import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/api-cache";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export type RoomMember = {
  id: string;
  name: string;
  pfp?: string | null;
  task?: string;
  status: "focus" | "break";
  lastSeen: number;
};

export type RoomReaction = {
  id: string;
  emoji: string;
  from: string;
  timestamp: number;
};

export type RoomState = {
  code: string;
  timer: {
    durationSec: number;
    remainingAtStart: number;
    startedAt: number | null;
    status: "idle" | "running" | "paused";
    mode: "work" | "break";
  };
  members: Record<string, RoomMember>;
  reactions: RoomReaction[];
  updatedAt: number;
};

// In-memory fallback if Redis is unconfigured or unavailable
// shortcut: Map loses rooms on cold start without Redis, upgrade to durable DB if rooms need long persistence
const MAX_MEMORY_ROOMS = 250;
const memoryRooms = new Map<string, RoomState>();

function computeRemaining(timer: RoomState["timer"]): number {
  if (timer.status !== "running" || !timer.startedAt) {
    return timer.remainingAtStart;
  }
  const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
  return Math.max(0, timer.remainingAtStart - elapsed);
}

function pruneRoom(room: RoomState): RoomState {
  const now = Date.now();
  // Filter members inactive for > 75s
  const activeMembers: Record<string, RoomMember> = {};
  for (const [id, m] of Object.entries(room.members || {})) {
    if (now - m.lastSeen < 75_000) {
      activeMembers[id] = m;
    }
  }
  room.members = activeMembers;
  // Filter reactions older than 12s
  room.reactions = (room.reactions || []).filter((r) => now - r.timestamp < 12_000);

  // If timer expired while running, set idle
  if (room.timer.status === "running") {
    const rem = computeRemaining(room.timer);
    if (rem <= 0) {
      room.timer.status = "idle";
      room.timer.startedAt = null;
      room.timer.remainingAtStart = room.timer.durationSec;
    }
  }

  return room;
}

async function getRoom(code: string): Promise<RoomState> {
  const cleanCode = code.toUpperCase();
  const redis = getRedis();

  if (redis) {
    try {
      const data = await redis.get<RoomState>(`ff:room:${cleanCode}`);
      if (data) return pruneRoom(data);
    } catch {}
  }

  const mem = memoryRooms.get(cleanCode);
  if (mem) return pruneRoom(mem);

  // Fresh room initialization
  const fresh: RoomState = {
    code: cleanCode,
    timer: {
      durationSec: 1500, // 25 min default
      remainingAtStart: 1500,
      startedAt: null,
      status: "idle",
      mode: "work",
    },
    members: {},
    reactions: [],
    updatedAt: Date.now(),
  };

  return fresh;
}

async function saveRoom(room: RoomState): Promise<void> {
  room.updatedAt = Date.now();
  const redis = getRedis();

  if (redis) {
    try {
      // 24 hour TTL
      await redis.set(`ff:room:${room.code}`, room, { ex: 86400 });
    } catch {}
  }

  // Evict oldest room if capacity exceeded
  if (memoryRooms.size >= MAX_MEMORY_ROOMS && !memoryRooms.has(room.code)) {
    const oldest = memoryRooms.keys().next().value;
    if (oldest) memoryRooms.delete(oldest);
  }
  memoryRooms.set(room.code, room);
}

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = (params.code || "").trim().toUpperCase();
  if (!code || code.length > 20) {
    return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
  }

  const room = await getRoom(code);
  const remainingSec = computeRemaining(room.timer);

  return NextResponse.json({
    ...room,
    timer: {
      ...room.timer,
      remainingSec,
    },
    memberList: Object.values(room.members),
  });
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const code = (params.code || "").trim().toUpperCase();
  if (!code || code.length > 20) {
    return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "").toLowerCase();
  const room = await getRoom(code);
  const now = Date.now();

  switch (action) {
    case "join": {
      const { memberId, name, pfp, task } = body;
      if (!memberId || !name) {
        return NextResponse.json({ error: "Missing memberId or name" }, { status: 400 });
      }
      room.members = room.members || {};
      if (Object.keys(room.members).length >= 50 && !room.members[memberId]) {
        return NextResponse.json({ error: "Room is full (max 50 members)" }, { status: 409 });
      }
      room.members[memberId] = {
        id: String(memberId).slice(0, 50),
        name: String(name).slice(0, 40),
        pfp: pfp || null,
        task: task ? String(task).slice(0, 100) : "",
        status: room.timer.mode === "break" ? "break" : "focus",
        lastSeen: now,
      };
      break;
    }

    case "heartbeat": {
      const { memberId, task, status } = body;
      if (memberId && room.members[memberId]) {
        room.members[memberId].lastSeen = now;
        if (task !== undefined) room.members[memberId].task = String(task).slice(0, 100);
        if (status) room.members[memberId].status = status;
      }
      break;
    }

    case "start": {
      const rem = computeRemaining(room.timer);
      if (rem > 0) {
        room.timer.status = "running";
        room.timer.startedAt = now;
        room.timer.remainingAtStart = rem;
      }
      break;
    }

    case "pause": {
      const rem = computeRemaining(room.timer);
      room.timer.status = "paused";
      room.timer.startedAt = null;
      room.timer.remainingAtStart = rem;
      break;
    }

    case "reset": {
      const rawSec = body.durationSec == null || body.durationSec === "" ? NaN : Number(body.durationSec);
      const defaultSec = body.mode === "break" ? 300 : 1500;
      const durationSec = Number.isFinite(rawSec) ? Math.max(60, Math.min(7200, Math.round(rawSec))) : defaultSec;
      const mode = body.mode === "break" ? "break" : "work";
      room.timer.status = "idle";
      room.timer.startedAt = null;
      room.timer.durationSec = durationSec;
      room.timer.remainingAtStart = durationSec;
      room.timer.mode = mode;
      break;
    }

    case "react": {
      const { emoji, from } = body;
      if (emoji) {
        room.reactions = room.reactions || [];
        room.reactions.push({
          id: `${now}-${Math.random().toString(36).slice(2, 6)}`,
          emoji: String(emoji).slice(0, 6),
          from: String(from || "Buddy").slice(0, 30),
          timestamp: now,
        });
      }
      break;
    }

    case "leave": {
      const { memberId } = body;
      if (memberId) {
        delete room.members[memberId];
      }
      break;
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  await saveRoom(room);
  const remainingSec = computeRemaining(room.timer);

  return NextResponse.json({
    ...room,
    timer: {
      ...room.timer,
      remainingSec,
    },
    memberList: Object.values(room.members),
  });
}
