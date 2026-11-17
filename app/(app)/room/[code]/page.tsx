"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Play, Pause, RotateCcw, Share2, Check, Sparkles, Coffee,
  Target, Edit3, ArrowLeft, ShieldCheck, Flame, Zap
} from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { playSound } from "@/lib/sounds";
import { useToast } from "@/components/Providers";

type Member = {
  id: string;
  name: string;
  pfp?: string | null;
  task?: string;
  status: "focus" | "break";
  lastSeen: number;
};

type Reaction = {
  id: string;
  emoji: string;
  from: string;
  timestamp: number;
};

type RoomData = {
  code: string;
  timer: {
    durationSec: number;
    remainingSec: number;
    status: "idle" | "running" | "paused";
    mode: "work" | "break";
  };
  memberList: Member[];
  reactions: Reaction[];
};

export default function StudyRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomCode = String(params.code || "").toUpperCase();

  const { data: me } = useFetch("/api/auth/me");
  const [memberId, setMemberId] = useState<string>("");
  const [memberName, setMemberName] = useState<string>("");
  const [myTask, setMyTask] = useState("");
  const [editingTask, setEditingTask] = useState(false);
  const [copied, setCopied] = useState(false);

  const [room, setRoom] = useState<RoomData | null>(null);
  const [localRemaining, setLocalRemaining] = useState<number>(1500);
  const [floatingReactions, setFloatingReactions] = useState<Reaction[]>([]);
  const seenReactionsRef = useRef<Set<string>>(new Set());

  // Setup client member ID and name
  useEffect(() => {
    let mid = localStorage.getItem("ff_room_mid");
    if (!mid) {
      mid = `m_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem("ff_room_mid", mid);
    }
    setMemberId(me?.user?.id ? String(me.user.id) : mid);
    setMemberName(me?.user?.name || `Developer_${mid.slice(2, 5)}`);
  }, [me]);

  // Join room once memberId and name are known
  useEffect(() => {
    if (!roomCode || !memberId || !memberName) return;

    const joinRoom = async () => {
      try {
        const res = await api(`/api/room/${roomCode}`, {
          method: "POST",
          body: JSON.stringify({
            action: "join",
            memberId,
            name: memberName,
            pfp: me?.user?.pfp || null,
            task: myTask,
          }),
        });
        setRoom(res);
        setLocalRemaining(res.timer.remainingSec);
      } catch (e: any) {
        toast(e.message || "Failed to join room", "error");
      }
    };

    joinRoom();

    // Heartbeat every 20s
    const hb = setInterval(() => {
      api(`/api/room/${roomCode}`, {
        method: "POST",
        body: JSON.stringify({
          action: "heartbeat",
          memberId,
          task: myTask,
          status: room?.timer.mode === "break" ? "break" : "focus",
        }),
      }).catch(() => {});
    }, 20000);

    return () => clearInterval(hb);
  }, [roomCode, memberId, memberName]);

  // Polling room state every 3s
  // shortcut: 3s polling instead of WebSockets to stay within serverless limits and zero cost
  useEffect(() => {
    if (!roomCode) return;

    const syncRoom = async () => {
      try {
        const res: RoomData = await api(`/api/room/${roomCode}`, { method: "GET" });
        setRoom(res);
        setLocalRemaining(res.timer.remainingSec);

        // Process newly arrived reactions
        if (res.reactions && res.reactions.length) {
          const fresh = res.reactions.filter((r) => !seenReactionsRef.current.has(r.id));
          if (fresh.length) {
            fresh.forEach((r) => seenReactionsRef.current.add(r.id));
            setFloatingReactions((prev) => [...prev, ...fresh].slice(-8));
            playSound("bell");
          }
        }
      } catch {}
    };

    const interval = setInterval(syncRoom, 3000);
    return () => clearInterval(interval);
  }, [roomCode]);

  // Local 1-second countdown tick when running
  useEffect(() => {
    if (room?.timer.status !== "running") return;

    const tick = setInterval(() => {
      setLocalRemaining((prev) => {
        if (prev <= 1) {
          playSound("bell");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [room?.timer.status]);

  // Control actions
  const handleStart = async () => {
    playSound("click");
    try {
      const res = await api(`/api/room/${roomCode}`, {
        method: "POST",
        body: JSON.stringify({ action: "start" }),
      });
      setRoom(res);
      setLocalRemaining(res.timer.remainingSec);
    } catch {}
  };

  const handlePause = async () => {
    playSound("click");
    try {
      const res = await api(`/api/room/${roomCode}`, {
        method: "POST",
        body: JSON.stringify({ action: "pause" }),
      });
      setRoom(res);
      setLocalRemaining(res.timer.remainingSec);
    } catch {}
  };

  const handleReset = async (durationSec: number, mode: "work" | "break") => {
    playSound("click");
    try {
      const res = await api(`/api/room/${roomCode}`, {
        method: "POST",
        body: JSON.stringify({ action: "reset", durationSec, mode }),
      });
      setRoom(res);
      setLocalRemaining(res.timer.remainingSec);
    } catch {}
  };

  const handleSendReaction = async (emoji: string) => {
    playSound("click");
    try {
      await api(`/api/room/${roomCode}`, {
        method: "POST",
        body: JSON.stringify({ action: "react", emoji, from: memberName }),
      });
    } catch {}
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingTask(false);
    try {
      await api(`/api/room/${roomCode}`, {
        method: "POST",
        body: JSON.stringify({ action: "heartbeat", memberId, task: myTask }),
      });
      toast("Focus goal updated for your buddy", "success");
    } catch {}
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast("Room link copied! Send it to your study buddy.", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const timerRunning = room?.timer.status === "running";
  const timerPaused = room?.timer.status === "paused";
  const isBreak = room?.timer.mode === "break";
  const members = room?.memberList || [];

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Bar with Room Code & Invite button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Link href="/room" className="btn btn-sm" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={14} /> Exit Room
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 12,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: 1,
            }}
          >
            ROOM: {roomCode}
          </span>

          <button onClick={copyInvite} className="btn btn-sm btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? "Link Copied!" : "Invite Buddy"}
          </button>
        </div>
      </div>

      {/* Main Synced Timer Hero Card */}
      <div
        className="card"
        style={{
          padding: "36px 24px",
          textAlign: "center",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
          background: isBreak
            ? "linear-gradient(180deg, var(--surface) 0%, rgba(14,40,30,0.6) 100%)"
            : "linear-gradient(180deg, var(--surface) 0%, rgba(20,13,38,0.7) 100%)",
        }}
      >
        {/* Floating live reaction bubbles */}
        <div style={{ position: "absolute", top: 16, right: 20, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", pointerEvents: "none" }}>
          {floatingReactions.slice(-4).map((r) => (
            <div
              key={r.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 20,
                background: "rgba(0,0,0,0.65)",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: 13,
                backdropFilter: "blur(8px)",
                animation: "pulse 1.5s ease-out",
              }}
            >
              <span style={{ fontSize: 16 }}>{r.emoji}</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{r.from}</span>
            </div>
          ))}
        </div>

        {/* Mode Tag */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <span
            style={{
              padding: "4px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.5,
              background: isBreak ? "rgba(16,185,129,0.15)" : "rgba(168,85,247,0.15)",
              color: isBreak ? "#10b981" : "var(--accent)",
              border: `1px solid ${isBreak ? "rgba(16,185,129,0.3)" : "rgba(168,85,247,0.3)"}`,
            }}
          >
            {isBreak ? "☕ SHORT BREAK" : "🧠 DEEP WORK BLOCK"}
          </span>

          {timerRunning && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#10b981", fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
              SYNCED LIVE
            </span>
          )}
        </div>

        {/* Big Countdown Clock */}
        <div
          style={{
            fontSize: "clamp(64px, 15vw, 110px)",
            fontWeight: 800,
            letterSpacing: -2,
            fontVariantNumeric: "tabular-nums",
            margin: "4px 0 20px",
            color: timerRunning ? (isBreak ? "#34d399" : "#c4b5fd") : "inherit",
          }}
        >
          {formatTime(localRemaining)}
        </div>

        {/* Timer Control Buttons */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
          {timerRunning ? (
            <button
              onClick={handlePause}
              className="btn btn-lg"
              style={{ padding: "12px 28px", borderRadius: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Pause size={18} /> Pause Together
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="btn btn-lg btn-primary"
              style={{ padding: "12px 32px", borderRadius: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Play size={18} fill="currentColor" /> {timerPaused ? "Resume Together" : "Start Together"}
            </button>
          )}

          <button
            onClick={() => handleReset(isBreak ? 300 : 1500, isBreak ? "break" : "work")}
            className="btn"
            style={{ borderRadius: 12, padding: "12px 18px" }}
            title="Reset timer"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Preset Selector */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => handleReset(1500, "work")}
            className={`btn btn-sm ${!isBreak && room?.timer.durationSec === 1500 ? "btn-primary" : ""}`}
            style={{ fontSize: 12, borderRadius: 8 }}
          >
            25m Focus
          </button>
          <button
            onClick={() => handleReset(3000, "work")}
            className={`btn btn-sm ${!isBreak && room?.timer.durationSec === 3000 ? "btn-primary" : ""}`}
            style={{ fontSize: 12, borderRadius: 8 }}
          >
            50m Deep Block
          </button>
          <button
            onClick={() => handleReset(300, "break")}
            className={`btn btn-sm ${isBreak ? "btn-primary" : ""}`}
            style={{ fontSize: 12, borderRadius: 8 }}
          >
            5m Break
          </button>
        </div>
      </div>

      {/* Quick Motivational Emoji Bursts */}
      <div
        className="card"
        style={{
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={15} color="var(--accent)" /> Encourage your buddy:
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {["🔥", "👏", "⚡", "☕", "💪", "🧠"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendReaction(emoji)}
              className="btn btn-sm"
              style={{ fontSize: 18, padding: "4px 10px", borderRadius: 10, background: "var(--surface-2)" }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Connected Buddies Card */}
      <div className="card" style={{ padding: "24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={16} color="var(--accent)" /> Connected Focus Buddies ({members.length})
          </h2>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Synced in real time</span>
        </div>

        {/* Member List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {members.map((m) => {
            const isMe = m.id === memberId;
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: 14,
                  background: isMe ? "var(--surface-2)" : "var(--surface)",
                  border: isMe ? "1px solid var(--accent)" : "1px solid var(--border)",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "var(--accent-grad)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 800,
                      fontSize: 14,
                      overflow: "hidden",
                    }}
                  >
                    {m.pfp ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.pfp} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      m.name.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{m.name}</span>
                      {isMe && <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 800 }}>(You)</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {m.task ? (
                        <span style={{ color: "var(--fg)" }}>🎯 {m.task}</span>
                      ) : (
                        <span style={{ fontStyle: "italic" }}>No task stated</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 12,
                      background: m.status === "focus" ? "rgba(16,185,129,0.15)" : "rgba(234,179,8,0.15)",
                      color: m.status === "focus" ? "#10b981" : "#eab308",
                    }}
                  >
                    {m.status === "focus" ? "🟢 In the Zone" : "☕ Taking Break"}
                  </span>

                  {isMe && (
                    <button
                      onClick={() => setEditingTask(true)}
                      className="iconbtn"
                      style={{ width: 28, height: 28 }}
                      title="Set your task for this session"
                    >
                      <Edit3 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Set My Goal Form */}
        {editingTask && (
          <form onSubmit={handleSaveTask} style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <input
              className="input"
              value={myTask}
              onChange={(e) => setMyTask(e.target.value)}
              placeholder="What are you focusing on this block? (e.g. LeetCode 238, React state refactor)"
              maxLength={80}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 10, padding: "0 16px", whiteSpace: "nowrap" }}>
              Save Goal
            </button>
            <button type="button" onClick={() => setEditingTask(false)} className="btn" style={{ borderRadius: 10 }}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
