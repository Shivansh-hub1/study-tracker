import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureDsaTopics, DB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { DSA_TOPICS, DSA_KEY_SET, DsaStatus } from "@/lib/dsa";
import { DSA_LECTURES } from "@/lib/dsa-lectures";

export const dynamic = "force-dynamic";

async function payload(userId: number) {
  const db = await getDb();
  await ensureDsaTopics(db, userId);
  const rows = await db.all<{ topic_key: string; status: string; lecture_idx: number }>(
    "SELECT topic_key, status, lecture_idx FROM dsa_progress WHERE user_id = ?",
    userId
  );
  const rowMap = new Map(rows.map((r) => [r.topic_key, r]));
  // Time logged per topic (sessions store the topic TITLE)
  const times = await db.all<{ topic: string; sec: number }>(
    "SELECT topic, COALESCE(SUM(duration_sec), 0) as sec FROM sessions WHERE user_id = ? AND topic != '' GROUP BY topic",
    userId
  );
  const timeMap = new Map(times.map((t) => [t.topic, Number(t.sec) || 0]));
  const topics = DSA_TOPICS.map((t) => {
    const lectures = DSA_LECTURES[t.key] || [];
    const status = (rowMap.get(t.key)?.status || "todo") as DsaStatus;
    return {
      ...t,
      status,
      lectures,
      lecture_idx: status === "done" ? lectures.length : (rowMap.get(t.key)?.lecture_idx || 0),
      seconds: timeMap.get(t.title) || 0,
    };
  });
  const current =
    topics.find((t) => t.status === "doing")?.key ||
    topics.find((t) => t.status === "todo")?.key ||
    null;
  const done = topics.filter((t) => t.status === "done").length;
  const total_sec = topics.reduce((a, t) => a + t.seconds, 0);
  return { topics, current, done, total: topics.length, total_sec };
}

/** First remaining todo becomes the new current. */
async function autoAdvance(db: DB, userId: number, now: string) {
  const rows = await db.all<{ topic_key: string; status: string }>(
    "SELECT topic_key, status FROM dsa_progress WHERE user_id = ?",
    userId
  );
  const st = new Map(rows.map((r) => [r.topic_key, r.status]));
  const next = DSA_TOPICS.map((t) => t.key).find((k) => st.get(k) === "todo");
  if (next) {
    await db.run(
      "UPDATE dsa_progress SET status = 'doing', updated_at = ? WHERE user_id = ? AND topic_key = ?",
      now, userId, next
    );
  }
}

async function demoteOthers(db: DB, userId: number, now: string) {
  await db.run(
    "UPDATE dsa_progress SET status = 'todo', updated_at = ? WHERE user_id = ? AND status = 'doing'",
    now, userId
  );
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await payload(user.id));
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { key, status, lecture_idx } = body as { key: string; status?: DsaStatus; lecture_idx?: number };
  if (!key || !DSA_KEY_SET.has(key)) {
    return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
  }
  const db = await getDb();
  await ensureDsaTopics(db, user.id);
  const now = new Date().toISOString();
  const len = (DSA_LECTURES[key] || []).length;

  if (status !== undefined) {
    if (!["todo", "doing", "done"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (status === "doing") await demoteOthers(db, user.id, now);
    await db.run(
      "UPDATE dsa_progress SET status = ?, updated_at = ? WHERE user_id = ? AND topic_key = ?",
      status, now, user.id, key
    );
    if (status === "done") await autoAdvance(db, user.id, now);
  }

  if (lecture_idx !== undefined) {
    const idx = Math.max(0, Math.min(len, Math.round(Number(lecture_idx) || 0)));
    await db.run(
      "UPDATE dsa_progress SET lecture_idx = ?, updated_at = ? WHERE user_id = ? AND topic_key = ?",
      idx, now, user.id, key
    );
    if (idx >= len && len > 0) {
      // Finished last lecture → module done, journey advances
      await db.run(
        "UPDATE dsa_progress SET status = 'done', updated_at = ? WHERE user_id = ? AND topic_key = ?",
        now, user.id, key
      );
      await autoAdvance(db, user.id, now);
    } else if (idx < len) {
      // (Re)opened mid-module → it becomes current
      await demoteOthers(db, user.id, now);
      await db.run(
        "UPDATE dsa_progress SET status = 'doing', updated_at = ? WHERE user_id = ? AND topic_key = ?",
        now, user.id, key
      );
    }
  }

  return NextResponse.json(await payload(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body.action !== "reset") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  const db = await getDb();
  await ensureDsaTopics(db, user.id);
  const now = new Date().toISOString();
  await db.run(
    "UPDATE dsa_progress SET status = 'todo', lecture_idx = 0, updated_at = ? WHERE user_id = ?",
    now, user.id
  );
  await db.run(
    "UPDATE dsa_progress SET status = 'doing', updated_at = ? WHERE user_id = ? AND topic_key = ?",
    now, user.id, DSA_TOPICS[0].key
  );
  return NextResponse.json(await payload(user.id));
}
