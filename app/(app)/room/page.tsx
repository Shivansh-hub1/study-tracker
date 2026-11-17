"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, ArrowRight, Clock, Target, Sparkles } from "lucide-react";
import { playSound } from "@/lib/sounds";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function RoomLobbyPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  const handleCreateRoom = () => {
    playSound("click");
    const code = generateCode();
    router.push(`/room/${code}`);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (clean) {
      playSound("click");
      router.push(`/room/${clean}`);
    }
  };

  return (
    <div className="grid" style={{ gap: 20, maxWidth: 840, margin: "0 auto" }}>
      <div
        className="card"
        style={{
          padding: "36px 28px",
          textAlign: "center",
          borderRadius: 20,
          background: "linear-gradient(180deg, var(--surface) 0%, rgba(20,13,38,0.7) 100%)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "rgba(168,85,247,0.15)",
            color: "var(--accent)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px",
            border: "1px solid rgba(168,85,247,0.3)",
          }}
        >
          <Users size={28} />
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", letterSpacing: -0.5 }}>
          Focus Buddy Study Rooms
        </h1>
        <p style={{ margin: "0 auto 28px", maxWidth: 540, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
          Study in real-time with a friend or study group. Synced Pomodoro timers, shared session goals, and live presence keep you accountable.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
          <button
            onClick={handleCreateRoom}
            className="btn btn-primary"
            style={{ padding: "12px 24px", fontSize: 14, fontWeight: 700, borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={16} /> Create New Room
          </button>
        </div>

        {/* Join by Code */}
        <form onSubmit={handleJoin} style={{ maxWidth: 360, margin: "0 auto", display: "flex", gap: 8 }}>
          <input
            className="input"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ENTER ROOM CODE (e.g. FLOW42)"
            maxLength={12}
            style={{ textTransform: "uppercase", fontWeight: 700, textAlign: "center", letterSpacing: 1 }}
          />
          <button
            type="submit"
            className="btn"
            style={{ borderRadius: 10, padding: "0 18px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Join <ArrowRight size={14} />
          </button>
        </form>
      </div>

      {/* Feature perks */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <div className="card" style={{ padding: "20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
            <Clock size={16} color="var(--accent)" /> Synced Timers
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
            When one buddy starts, pauses, or resets the timer, everyone’s clock syncs seamlessly without drift.
          </p>
        </div>

        <div className="card" style={{ padding: "20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
            <Target size={16} color="#38bdf8" /> Live Task Sharing
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
            Share your goal for the block (e.g. “DP on Trees” or “Refactoring API”) so your friend knows what you’re tackling.
          </p>
        </div>

        <div className="card" style={{ padding: "20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
            <Sparkles size={16} color="#f59e0b" /> Micro Celebrations
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
            Send quick motivational emoji bursts (🔥, 👏, ⚡, ☕) without distraction or typing.
          </p>
        </div>
      </div>
    </div>
  );
}
