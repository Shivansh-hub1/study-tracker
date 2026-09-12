"use client";

import React from "react";
import { Crown } from "lucide-react";
import { useFetch } from "@/lib/client";
import { CardSkeleton, EmptyState } from "@/components/ui";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { data, loading } = useFetch("/api/leaderboard");
  const board = data?.board || [];

  if (loading && !data) return <div className="grid"><CardSkeleton height={300} /></div>;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card card-pad-0">
        <div style={{ padding: "16px 20px", display: "flex", gap: 10, alignItems: "center" }}>
          <Crown size={18} style={{ color: "var(--warn)" }} />
          <h3 style={{ fontSize: 15, flex: 1 }}>Top learners</h3>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>ranked by XP</span>
        </div>
        {board.length === 0 ? (
          <EmptyState icon={<Crown size={26} />} title="Empty board" hint="Study to claim the #1 spot." />
        ) : (
          <table className="table">
            <thead><tr><th>#</th><th>Learner</th><th>Level</th><th>XP</th><th>Hours</th><th>Sessions</th></tr></thead>
            <tbody>
              {board.map((r: any, i: number) => (
                <tr key={r.id} style={r.me ? { background: "var(--accent-soft)" } : undefined}>
                  <td style={{ fontSize: 16 }}>{MEDAL[i] || `${i + 1}`}</td>
                  <td style={{ fontWeight: 700 }}>{r.name} {r.me ? <span className="badge">you</span> : null}</td>
                  <td><span className="badge">Lv {r.level}</span></td>
                  <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{r.xp}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>{r.hours}h</td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>{r.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--muted)", textAlign: "center" }}>
        Only people with accounts on your app appear here — invite friends to compete. 👥
      </p>
    </div>
  );
}
