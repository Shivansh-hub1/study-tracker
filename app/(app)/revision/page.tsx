"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { History, CalendarClock, CheckCheck, Play, X, Brain } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { Stat, CardSkeleton, EmptyState } from "@/components/ui";
import { useToast } from "@/components/Providers";

type Item = { journey: string; apiPath: string; color: string; key: string; title: string; days_ago?: number; days_left?: number };
type Filter = "all" | "DSA" | "WebDev";

const agoColor = (d: number) => (d >= 7 ? "#f87171" : d >= 3 ? "#f59e0b" : "var(--muted)");

export default function RevisionPage() {
  const { toast } = useToast();
  const dsa = useFetch("/api/dsa");
  const web = useFetch("/api/webdev");
  const [filter, setFilter] = useState<Filter>("all");
  const [session, setSession] = useState<Item[] | null>(null);
  const [doneCount, setDoneCount] = useState(0);
  const [busy, setBusy] = useState(false);

  const due = useMemo<Item[]>(() => {
    const a: Item[] = (dsa.data?.revision_due || []).map((r: any) => ({ journey: "DSA", apiPath: "/api/dsa", color: "#8b5cf6", ...r }));
    const b: Item[] = (web.data?.revision_due || []).map((r: any) => ({ journey: "WebDev", apiPath: "/api/webdev", color: "#ec4899", ...r }));
    return [...a, ...b]
      .filter((r) => filter === "all" || r.journey === filter)
      .sort((p, q) => (q.days_ago || 0) - (p.days_ago || 0));
  }, [dsa.data, web.data, filter]);

  const upcoming = useMemo<Item[]>(() => {
    const a: Item[] = (dsa.data?.revision_upcoming || []).map((r: any) => ({ journey: "DSA", apiPath: "/api/dsa", color: "#8b5cf6", ...r }));
    const b: Item[] = (web.data?.revision_upcoming || []).map((r: any) => ({ journey: "WebDev", apiPath: "/api/webdev", color: "#ec4899", ...r }));
    return [...a, ...b]
      .filter((r) => filter === "all" || r.journey === filter)
      .sort((p, q) => (p.days_left || 0) - (q.days_left || 0));
  }, [dsa.data, web.data, filter]);

  const totalDue = (dsa.data?.revision_due?.length || 0) + (web.data?.revision_due?.length || 0);
  const revisedTotal = (dsa.data?.revised_count || 0) + (web.data?.revised_count || 0);

  const refresh = () => { dsa.reload(); web.reload(); };

  const rate = async (it: Item, rating: string) => {
    try {
      await api(it.apiPath, { method: "POST", body: JSON.stringify({ action: "revise", key: it.key, rating }) });
      refresh();
      toast(rating === "again" ? "Again tomorrow — it'll stick 💪" : rating === "hard" ? "Back in 3 days" : "Revised! Back in 7 days ✅", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const startSession = () => {
    if (due.length === 0) return;
    setSession([...due]);
    setDoneCount(0);
  };

  const endSession = () => {
    setSession(null);
    refresh();
  };

  const rateSession = async (rating: string) => {
    if (!session || session.length === 0 || busy) return;
    const it = session[0];
    setBusy(true);
    try {
      await api(it.apiPath, { method: "POST", body: JSON.stringify({ action: "revise", key: it.key, rating }) });
      const rest = session.slice(1);
      setDoneCount((c) => c + 1);
      if (rest.length === 0) {
        setSession(null);
        refresh();
        toast("Session complete! All caught up 🎉", "success");
      } else {
        setSession(rest);
      }
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
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

  const total = session ? session.length + doneCount : 0;
  const current = session?.[0];

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="grid grid-3">
        <Stat icon={<History size={22} />} label="Due now" value={`${totalDue}`} sub="topics waiting" accent="#f59e0b" />
        <Stat icon={<CalendarClock size={22} />} label="Upcoming" value={`${upcoming.length}`} sub="scheduled ahead" accent="#6366f1" />
        <Stat icon={<CheckCheck size={22} />} label="Revised" value={`${revisedTotal}`} sub="all time" accent="#10b981" />
      </div>

      {session && current ? (
        <div className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700 }}>
              {doneCount + 1} of {total}
            </span>
            <button className="btn btn-sm btn-ghost" onClick={endSession}>
              <X size={13} /> End session
            </button>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: "var(--border)", overflow: "hidden", marginBottom: 28 }}>
            <div style={{ height: "100%", width: `${Math.round((doneCount / total) * 100)}%`, background: "var(--accent-grad)", borderRadius: 99, transition: "width .3s" }} />
          </div>
          <span className="badge" style={{ background: `${current.color}22`, color: current.color }}>{current.journey}</span>
          <h2 style={{ fontSize: 24, margin: "14px 0 6px" }}>{current.title}</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 8px" }}>
            Done {(current.days_ago ?? 0)} days ago · try to recall the key ideas, then rate yourself honestly.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
            <button className="btn btn-lg" disabled={busy} onClick={() => rateSession("again")}>Again <span style={{ fontSize: 11, opacity: 0.7 }}>· 1d</span></button>
            <button className="btn btn-lg" disabled={busy} onClick={() => rateSession("hard")}>Hard <span style={{ fontSize: 11, opacity: 0.7 }}>· 3d</span></button>
            <button className="btn btn-lg btn-primary" disabled={busy} onClick={() => rateSession("easy")}>Easy ✓ <span style={{ fontSize: 11, opacity: 0.8 }}>· 7d</span></button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontSize: 15 }}>Due for revision</h2>
            <div style={{ display: "flex", gap: 6 }}>
              {(["all", "DSA", "WebDev"] as Filter[]).map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm ${filter === f ? "btn-primary" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
            <b>Again</b> brings it back tomorrow, <b>Hard</b> in 3 days, <b>Easy</b> in 7 days.
          </p>
          {due.length === 0 ? (
            <EmptyState icon={<CheckCheck size={26} />} title="All caught up ✅" hint="Nothing due. Upcoming revisions are listed below." />
          ) : (
            <>
              <button className="btn btn-primary btn-block" style={{ marginBottom: 14 }} onClick={startSession}>
                <Play size={15} /> Start revision session ({due.length} topic{due.length === 1 ? "" : "s"})
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {due.map((r) => (
                  <div key={r.journey + r.key} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface-2)" }}>
                    <span className="badge" style={{ background: `${r.color}22`, color: r.color }}>{r.journey}</span>
                    <span style={{ flex: 1, minWidth: 140, fontWeight: 600, fontSize: 14 }}>
                      {r.title}{" "}
                      <span style={{ color: agoColor(r.days_ago || 0), fontWeight: 400, fontSize: 12 }}>
                        · {r.days_ago}d ago{(r.days_ago || 0) >= 7 ? " — overdue!" : ""}
                      </span>
                    </span>
                    <button className="btn btn-sm" title="Show me again tomorrow" onClick={() => rate(r, "again")}>Again</button>
                    <button className="btn btn-sm" title="Show me in 3 days" onClick={() => rate(r, "hard")}>Hard</button>
                    <button className="btn btn-sm btn-primary" title="Show me in 7 days" onClick={() => rate(r, "easy")}>Easy ✓</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {upcoming.length > 0 && !session && (
        <div className="card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Upcoming</h2>
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

      <p style={{ fontSize: 12.5, color: "var(--muted)", textAlign: "center" }}>
        <Brain size={13} style={{ verticalAlign: -2 }} /> Tip: finish topics in{" "}
        <Link href="/dsa" style={{ color: "var(--accent)", fontWeight: 600 }}>DSA</Link> or{" "}
        <Link href="/webdev" style={{ color: "var(--accent)", fontWeight: 600 }}>Web Dev</Link>{" "}
        and they land here for spaced revision automatically.
      </p>
    </div>
  );
}
