"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { useStats } from "@/lib/client";
import { CardSkeleton, EmptyState } from "@/components/ui";

type S = any;
type Badge = { id: string; name: string; desc: string; icon: string; rarity: string; test: (s: S) => boolean; prog: (s: S) => [number, number] };

const BADGES: Badge[] = [
  { id: "first", name: "First Steps", desc: "Log your first session", icon: "🌱", rarity: "common", test: (s) => s.totalSessions >= 1, prog: (s) => [Math.min(s.totalSessions, 1), 1] },
  { id: "s10", name: "Getting Serious", desc: "Log 10 sessions", icon: "📚", rarity: "common", test: (s) => s.totalSessions >= 10, prog: (s) => [Math.min(s.totalSessions, 10), 10] },
  { id: "s50", name: "Half Century", desc: "Log 50 sessions", icon: "🔥", rarity: "rare", test: (s) => s.totalSessions >= 50, prog: (s) => [Math.min(s.totalSessions, 50), 50] },
  { id: "s100", name: "Century", desc: "Log 100 sessions", icon: "💯", rarity: "epic", test: (s) => s.totalSessions >= 100, prog: (s) => [Math.min(s.totalSessions, 100), 100] },
  { id: "st3", name: "On a Roll", desc: "Reach a 3-day streak", icon: "⚡", rarity: "common", test: (s) => s.streak >= 3, prog: (s) => [Math.min(s.streak, 3), 3] },
  { id: "st7", name: "Week Warrior", desc: "Reach a 7-day streak", icon: "🏅", rarity: "rare", test: (s) => s.streak >= 7, prog: (s) => [Math.min(s.streak, 7), 7] },
  { id: "st30", name: "Iron Will", desc: "Reach a 30-day streak", icon: "🛡️", rarity: "legendary", test: (s) => s.streak >= 30, prog: (s) => [Math.min(s.streak, 30), 30] },
  { id: "h10", name: "Deep Diver", desc: "Study 10 hours total", icon: "⏱️", rarity: "common", test: (s) => s.totalHours >= 10, prog: (s) => [Math.min(s.totalHours, 10), 10] },
  { id: "h50", name: "Marathoner", desc: "Study 50 hours total", icon: "🏃", rarity: "rare", test: (s) => s.totalHours >= 50, prog: (s) => [Math.min(s.totalHours, 50), 50] },
  { id: "h100", name: "Centurion", desc: "Study 100 hours total", icon: "👑", rarity: "epic", test: (s) => s.totalHours >= 100, prog: (s) => [Math.min(s.totalHours, 100), 100] },
  { id: "lv3", name: "Rising Star", desc: "Reach level 3", icon: "⭐", rarity: "common", test: (s) => s.level >= 3, prog: (s) => [Math.min(s.level, 3), 3] },
  { id: "lv8", name: "Legend", desc: "Reach level 8", icon: "🌟", rarity: "legendary", test: (s) => s.level >= 8, prog: (s) => [Math.min(s.level, 8), 8] },
  { id: "rev10", name: "Reviser", desc: "Revise 10 journey topics", icon: "🔁", rarity: "rare", test: (s) => (s.revised || 0) >= 10, prog: (s) => [Math.min(s.revised || 0, 10), 10] },
];

const RC: Record<string, string> = { common: "#94a3b8", rare: "#38bdf8", epic: "#c084fc", legendary: "#fbbf24" };

export default function AchievementsPage() {
  const { data, loading } = useStats();
  const stats = data?.stats;

  if (loading && !stats) {
    return (
      <div className="grid">
        <div className="grid grid-3"><CardSkeleton height={120} /><CardSkeleton height={120} /><CardSkeleton height={120} /></div>
      </div>
    );
  }
  if (!stats) return <EmptyState icon={<Trophy size={26} />} title="No data yet" hint="Start studying to unlock achievements." />;

  const unlocked = BADGES.filter((b) => b.test(stats)).length;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="empty ico" style={{ margin: 0, padding: 0, width: 56, height: 56, borderRadius: 16, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Trophy size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{unlocked}/{BADGES.length} unlocked</div>
          <div style={{ height: 8, borderRadius: 99, background: "var(--border)", marginTop: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round((unlocked / BADGES.length) * 100)}%`, background: "var(--accent-grad)", borderRadius: 99 }} />
          </div>
        </div>
      </div>
      <div className="grid grid-3">
        {BADGES.map((b) => {
          const un = b.test(stats);
          const [cur, tgt] = b.prog(stats);
          const c = RC[b.rarity];
          return (
            <div key={b.id} className="card" style={{ borderColor: un ? c : undefined, boxShadow: un ? `0 0 24px -8px ${c}` : undefined, opacity: un ? 1 : 0.75 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 34, filter: un ? "none" : "grayscale(1)", opacity: un ? 1 : 0.6 }}>{b.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5 }}>{b.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{b.desc}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <span className="badge" style={{ background: `${c}22`, color: c, textTransform: "capitalize" }}>{b.rarity}</span>
                {un ? (
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: c, marginLeft: "auto" }}>Unlocked ✓</span>
                ) : (
                  <span style={{ fontSize: 12.5, color: "var(--muted)", marginLeft: "auto" }}>{cur}/{tgt}</span>
                )}
              </div>
              {!un && (
                <div style={{ height: 6, borderRadius: 99, background: "var(--border)", marginTop: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.round((cur / tgt) * 100)}%`, background: c, borderRadius: 99 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
