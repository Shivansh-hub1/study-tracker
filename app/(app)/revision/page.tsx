"use client";

import React, { useMemo } from "react";
import { History, CalendarClock, CheckCheck } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { Stat, CardSkeleton, EmptyState } from "@/components/ui";
import { useToast } from "@/components/Providers";

type Item = { journey: string; apiPath: string; color: string; key: string; title: string; days_ago?: number; days_left?: number };

export default function RevisionPage() {
  const { toast } = useToast();
  const dsa = useFetch("/api/dsa");
  const web = useFetch("/api/webdev");

  const due = useMemo<Item[]>(() => {
    const a: Item[] = (dsa.data?.revision_due || []).map((r: any) => ({ journey: "DSA", apiPath: "/api/dsa", color: "#8b5cf6", ...r }));
    const b: Item[] = (web.data?.revision_due || []).map((r: any) => ({ journey: "WebDev", apiPath: "/api/webdev", color: "#ec4899", ...r }));
    return [...a, ...b].sort((p, q) => (q.days_ago || 0) - (p.days_ago || 0));
  }, [dsa.data, web.data]);

  const upcoming = useMemo<Item[]>(() => {
    const a: Item[] = (dsa.data?.revision_upcoming || []).map((r: any) => ({ journey: "DSA", apiPath: "/api/dsa", color: "#8b5cf6", ...r }));
    const b: Item[] = (web.data?.revision_upcoming || []).map((r: any) => ({ journey: "WebDev", apiPath: "/api/webdev", color: "#ec4899", ...r }));
    return [...a, ...b].sort((p, q) => (p.days_left || 0) - (q.days_left || 0));
  }, [dsa.data, web.data]);

  const revisedTotal = (dsa.data?.revised_count || 0) + (web.data?.revised_count || 0);

  const rate = async (it: Item, rating: string) => {
    try {
      await api(it.apiPath, { method: "POST", body: JSON.stringify({ action: "revise", key: it.key, rating }) });
      dsa.reload(); web.reload();
      toast(rating === "again" ? "Again tomorrow — it'll stick 💪" : rating === "hard" ? "Back in 3 days" : "Revised! Back in 7 days ✅", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  if ((dsa.loading || web.loading) && !dsa.data && !web.data) {
    return (
      <div className="grid">
        <div className="grid grid-3"><CardSkeleton height={46} /><CardSkeleton height={46} /><CardSkeleton height={46} /></div>
        <CardSkeleton height={260} />
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="grid grid-3">
        <Stat icon={<History size={22} />} label="Due now" value={`${due.length}`} sub="topics waiting" accent="#f59e0b" />
        <Stat icon={<CalendarClock size={22} />} label="Upcoming" value={`${upcoming.length}`} sub="scheduled ahead" accent="#6366f1" />
        <Stat icon={<CheckCheck size={22} />} label="Revised" value={`${revisedTotal}`} sub="all time" accent="#10b981" />
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 4 }}>Due for revision</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
          Be honest — <b>Again</b> brings it back tomorrow, <b>Hard</b> in 3 days, <b>Easy</b> in 7 days.
        </p>
        {due.length === 0 ? (
          <EmptyState icon={<CheckCheck size={26} />} title="All caught up ✅" hint="Nothing due. Upcoming revisions are listed below." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {due.map((r) => (
              <div key={r.journey + r.key} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface-2)" }}>
                <span className="badge" style={{ background: `${r.color}22`, color: r.color }}>{r.journey}</span>
                <span style={{ flex: 1, minWidth: 140, fontWeight: 600, fontSize: 14 }}>
                  {r.title} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}>· {r.days_ago}d ago</span>
                </span>
                <button className="btn btn-sm" title="Show me again tomorrow" onClick={() => rate(r, "again")}>Again</button>
                <button className="btn btn-sm" title="Show me in 3 days" onClick={() => rate(r, "hard")}>Hard</button>
                <button className="btn btn-sm btn-primary" title="Show me in 7 days" onClick={() => rate(r, "easy")}>Easy ✓</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {upcoming.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Upcoming</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcoming.slice(0, 12).map((r) => (
              <div key={r.journey + r.key} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13.5, color: "var(--muted)" }}>
                <span className="badge" style={{ background: `${r.color}22`, color: r.color }}>{r.journey}</span>
                <span style={{ flex: 1 }}>{r.title}</span>
                <span style={{ fontSize: 12 }}>in {r.days_left}d</span>
              </div>
            ))}
            {upcoming.length > 12 && (
              <div style={{ fontSize: 12, color: "var(--muted)" }}>+{upcoming.length - 12} more scheduled</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
