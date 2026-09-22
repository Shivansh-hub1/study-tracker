"use client";

import React, { useState } from "react";
import { Trophy } from "lucide-react";
import { useStats } from "@/lib/client";
import { CardSkeleton, EmptyState } from "@/components/ui";
import { BADGES, RC, CAT_LABEL } from "@/lib/achievements";

export default function AchievementsPage() {
  const { data, loading } = useStats();
  const stats = data?.stats;
  const [filter, setFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");

  if (loading && !stats) {
    return (
      <div className="grid">
        <div className="grid grid-3"><CardSkeleton height={120} /><CardSkeleton height={120} /><CardSkeleton height={120} /></div>
      </div>
    );
  }
  if (!stats) return <EmptyState icon={<Trophy size={26} />} title="No data yet" hint="Start studying to unlock achievements." />;

  const unlocked = BADGES.filter((b) => b.test(stats)).length;
  const filtered = BADGES.filter(b => {
    const catMatch = filter === "all" || b.category === filter;
    const rarityMatch = rarityFilter === "all" || b.rarity === rarityFilter;
    return catMatch && rarityMatch;
  });
  const filteredUnlocked = filtered.filter(b => b.test(stats)).length;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div className="empty ico" style={{ margin: 0, padding: 0, width: 56, height: 56, borderRadius: 16, background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Trophy size={26} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{unlocked}/{BADGES.length} unlocked • {Math.round((unlocked / BADGES.length) * 100)}% complete</div>
          <div style={{ height: 8, borderRadius: 99, background: "var(--border)", marginTop: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round((unlocked / BADGES.length) * 100)}%`, background: "var(--accent-grad)", borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6 }}>{filtered.length !== BADGES.length ? `${filteredUnlocked}/${filtered.length} in filter` : `${BADGES.length} total achievements — keep grinding!`}</div>
        </div>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06 }}>Category:</span>
          {Object.keys(CAT_LABEL).map(cat => (
            <button key={cat} className={`chip ${filter === cat ? "on" : ""}`} onClick={() => setFilter(cat)} style={{ fontSize: 12.5 }}>
              {CAT_LABEL[cat]} {filter === cat ? `(${filtered.length})` : ""}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06 }}>Rarity:</span>
          {["all", "common", "rare", "epic", "legendary"].map(r => (
            <button key={r} className={`chip ${rarityFilter === r ? "on" : ""}`} onClick={() => setRarityFilter(r)} style={{ fontSize: 12.5, textTransform: "capitalize" }}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-3">
        {filtered.map((b) => {
          const un = b.test(stats);
          const [cur, tgt] = b.prog(stats);
          const c = RC[b.rarity];
          const pct = Math.min(100, Math.round((cur / tgt) * 100));
          return (
            <div key={b.id} className="card" style={{ borderColor: un ? c : undefined, boxShadow: un ? `0 0 24px -8px ${c}` : undefined, opacity: un ? 1 : 0.8, transition: "all 0.2s ease" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 34, filter: un ? "none" : "grayscale(1)", opacity: un ? 1 : 0.5, transition: "all 0.2s" }}>{b.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, display: "flex", gap: 6, alignItems: "center" }}>{b.name} {un && <span style={{ fontSize: 11 }}>✨</span>}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.4 }}>{b.desc}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <span className="badge" style={{ background: `${c}22`, color: c, textTransform: "capitalize", fontSize: 11 }}>{b.rarity}</span>
                <span className="badge" style={{ background: "var(--surface-2)", color: "var(--muted)", fontSize: 11 }}>{CAT_LABEL[b.category] || b.category}</span>
                {un ? (
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: c, marginLeft: "auto" }}>Unlocked ✓</span>
                ) : (
                  <span style={{ fontSize: 12.5, color: "var(--muted)", marginLeft: "auto" }}>{cur}/{tgt} • {pct}%</span>
                )}
              </div>
              {!un && (
                <div style={{ height: 6, borderRadius: 99, background: "var(--border)", marginTop: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 99, transition: "width 0.5s ease" }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
          No achievements in this filter. Try another category.
        </div>
      )}
    </div>
  );
}
