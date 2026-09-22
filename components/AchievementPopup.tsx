"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useStats } from "@/lib/client";
import { BADGES, RC, CAT_LABEL } from "@/lib/achievements";
import { Trophy, X, Sparkles } from "lucide-react";

const SEEN_KEY = "ff_achievements_seen_v2";
const QUEUE_KEY = "ff_achievements_queue_v2";

function getSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}
function setSeen(seen: Set<string>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(seen))); } catch {}
}

function beep(times = 3) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = i === 0 ? 880 : i === 1 ? 1108 : 1318;
      const t = ctx.currentTime + i * 0.15;
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.start(t); o.stop(t + 0.31);
    }
  } catch {}
}

function Confetti() {
  const pieces = Array.from({ length: 40 }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 1.5 + Math.random() * 1.5;
    const color = ["#818cf8", "#f472b6", "#34d399", "#fbbf24", "#38bdf8", "#c084fc"][Math.floor(Math.random() * 6)];
    const size = 6 + Math.random() * 8;
    const rot = Math.random() * 360;
    return { left, delay, duration, color, size, rot, i };
  });
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {pieces.map(p => (
        <div key={p.i} style={{
          position: "absolute",
          left: `${p.left}%`,
          top: "-20px",
          width: p.size,
          height: p.size * 1.6,
          background: p.color,
          borderRadius: 2,
          transform: `rotate(${p.rot}deg)`,
          animation: `confFall ${p.duration}s ${p.delay}s ease-out forwards`,
        }} />
      ))}
      <style>{`
        @keyframes confFall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function AchievementPopup() {
  const { data } = useStats();
  const stats = data?.stats;
  const [queue, setQueue] = useState<typeof BADGES>([]);
  const [current, setCurrent] = useState<(typeof BADGES)[number] | null>(null);
  const [show, setShow] = useState(false);

  const checkNew = useCallback(() => {
    if (!stats) return;
    const seen = getSeen();
    const unlocked = BADGES.filter(b => b.test(stats));
    const newOnes = unlocked.filter(b => !seen.has(b.id));
    if (newOnes.length > 0) {
      setQueue(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const toAdd = newOnes.filter(n => !existingIds.has(n.id) && n.id !== current?.id);
        const merged: typeof BADGES = [];
        prev.forEach(p => merged.push(p));
        toAdd.forEach(p => merged.push(p));
        return merged;
      });
    }
  }, [stats, current]);

  useEffect(() => {
    checkNew();
  }, [checkNew]);

  // Poll every 10s for new unlocks (when session logged)
  useEffect(() => {
    const t = setInterval(checkNew, 10000);
    return () => clearInterval(t);
  }, [checkNew]);

  // Show next from queue
  useEffect(() => {
    if (!show && queue.length > 0 && !current) {
      const next = queue[0];
      setCurrent(next);
      setQueue(q => q.slice(1));
      setShow(true);
      beep(3);
      // haptic
      try { (navigator as any).vibrate?.([100, 50, 100]); } catch {}
    }
  }, [queue, show, current]);

  const close = useCallback(() => {
    if (!current) return;
    const seen = getSeen();
    seen.add(current.id);
    setSeen(seen);
    setShow(false);
    setTimeout(() => setCurrent(null), 300);
  }, [current]);

  const next = useCallback(() => {
    if (!current) return;
    const seen = getSeen();
    seen.add(current.id);
    setSeen(seen);
    if (queue.length > 0) {
      const nxt = queue[0];
      setQueue(q => q.slice(1));
      setCurrent(nxt);
      beep(3);
    } else {
      setShow(false);
      setTimeout(() => setCurrent(null), 300);
    }
  }, [current, queue]);

  if (!current) return null;

  const color = RC[current.rarity] || "#818cf8";

  return (
    <div className="modal-overlay" style={{ zIndex: 200, background: "rgba(2,6,18,0.7)", backdropFilter: "blur(10px)" }} onClick={close}>
      <style>{`
        @keyframes popBounce { 0% { transform: scale(0.8) translateY(20px); opacity: 0; } 50% { transform: scale(1.05) translateY(-5px); } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
      `}</style>
      <div className="modal" style={{ maxWidth: 380, textAlign: "center", position: "relative", overflow: "hidden", border: `2px solid ${color}`, boxShadow: `0 0 40px -10px ${color}, var(--shadow)`, animation: "popBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }} onClick={e => e.stopPropagation()}>
        <Confetti />
        <button onClick={close} style={{ position: "absolute", top: 12, right: 12, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, width: 28, height: 28, display: "grid", placeItems: "center", cursor: "pointer", color: "var(--muted)" }}><X size={14} /></button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 72, filter: `drop-shadow(0 0 20px ${color})`, animation: "pulseGlow 1.5s infinite" }}>{current.icon}</div>
            <div style={{ position: "absolute", top: -8, right: -8, background: color, color: "#fff", borderRadius: 999, width: 24, height: 24, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, boxShadow: `0 2px 10px ${color}` }}><Sparkles size={14} /></div>
          </div>

          <div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
              <span className="badge" style={{ background: `${color}22`, color, textTransform: "capitalize" }}>{current.rarity}</span>
              <span className="badge" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>{CAT_LABEL[current.category] || current.category}</span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.02, marginBottom: 6, background: `linear-gradient(135deg, ${color}, var(--accent))`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{current.name}</h3>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>{current.desc}</p>
          </div>

          <div style={{ width: "100%", height: 1, background: `linear-gradient(90deg, transparent, ${color}44, transparent)`, margin: "4px 0" }} />

          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button className="btn" style={{ flex: 1 }} onClick={close}>Keep it</button>
            <button className="btn btn-primary" style={{ flex: 1, background: `linear-gradient(135deg, ${color}, var(--accent))`, border: "none" }} onClick={next}>
              {queue.length > 0 ? `Next (${queue.length}) →` : "Awesome! 🎉"}
            </button>
          </div>

          <a href="/achievements" onClick={close} style={{ fontSize: 12.5, color: "var(--muted)", textDecoration: "underline" }}>View all {BADGES.length} achievements →</a>
        </div>
      </div>
    </div>
  );
}
