"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Flame, Clock, CalendarDays, TrendingUp, Play, Plus, Target, Trash2,
  BookOpen, Timer as TimerIcon, Snowflake, Share2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { useFetch, useStats, api } from "@/lib/client";
import { fmtMinutes, prettyDT, SUBJECT_COLORS } from "@/lib/utils";
import { Spinner, EmptyState, Modal, ProgressRing, Stat, CardSkeleton, Dot } from "@/components/ui";
import Heatmap from "@/components/Heatmap";
import { drawShareCard, shareText } from "@/components/ShareCard";
import { useToast } from "@/components/Providers";

const KIND_LABELS: Record<string, string> = {
  daily_minutes: "minutes / day",
  weekly_minutes: "minutes / week",
  monthly_minutes: "minutes / month",
  weekly_sessions: "sessions / week",
};

export default function DashboardPage() {
  const { toast } = useToast();
  const { data: statsData, loading: statsLoading, reload: reloadStats } = useStats();
  const { data: goalsData, reload: reloadGoals, setData: setGoalsData } = useFetch("/api/goals");
  const { data: sessData } = useFetch("/api/sessions?limit=6");
  const { data: subjectsData } = useFetch("/api/subjects");
  const [goalModal, setGoalModal] = useState(false);
  const [gTitle, setGTitle] = useState("");
  const [gKind, setGKind] = useState("daily_minutes");
  const [gTarget, setGTarget] = useState("120");
  const [saving, setSaving] = useState(false);
  const { data: streakData, setData: setStreakData } = useFetch(`/api/streak?offset=${-new Date().getTimezoneOffset()}`);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLCanvasElement>(null);

  const stats = statsData?.stats;
  const stock = streakData?.stock ?? 0;
  const frozenToday = !!streakData?.frozenToday;
  const atRisk = (stats?.streak ?? 0) > 0 && (stats?.todayMin ?? 0) === 0 && !frozenToday;
  const goals = goalsData?.goals || [];
  const subjects = subjectsData?.subjects || [];

  const addGoal = async () => {
    if (!gTitle.trim()) return;
    setSaving(true);
    const temp = { id: -Date.now(), title: gTitle, kind: gKind, target: Number(gTarget) };
    const prev = goals;
    setGoalsData({ goals: [...goals, temp] } as any);
    try {
      const { goal } = await api("/api/goals", { method: "POST", body: JSON.stringify({ title: gTitle, kind: gKind, target: Number(gTarget) }) });
      setGoalsData({ goals: [...prev, goal] } as any);
      setGoalModal(false);
      setGTitle("");
      toast("Goal added", "success");
    } catch (e: any) {
      setGoalsData({ goals: prev } as any);
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const removeGoal = async (id: number) => {
    const prev = goals;
    setGoalsData({ goals: goals.filter((g: any) => g.id !== id) } as any);
    try {
      await api(`/api/goals/${id}`, { method: "DELETE" });
      toast("Goal removed", "success");
    } catch (e: any) {
      setGoalsData({ goals: prev } as any);
      toast(e.message, "error");
    }
  };

  const useFreeze = async () => {
    try {
      const r = await api(`/api/streak?offset=${-new Date().getTimezoneOffset()}`, { method: "POST", body: JSON.stringify({ action: "freeze" }) });
      setStreakData(r as any);
      reloadStats();
      toast("Streak frozen \u2744\uFE0F Come back tomorrow!", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const unFreeze = async () => {
    try {
      const r = await api(`/api/streak?offset=${-new Date().getTimezoneOffset()}`, { method: "POST", body: JSON.stringify({ action: "unfreeze" }) });
      setStreakData(r as any);
      reloadStats();
      toast("Unfrozen — study today to keep the streak!", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  useEffect(() => {
    if (shareOpen && shareRef.current && stats) {
      drawShareCard(shareRef.current, { streak: stats.streak ?? 0, monthMin: stats.monthMin ?? 0, level: stats.level ?? 1, xp: stats.xp ?? 0, totalHours: stats.totalHours ?? 0, daily: (stats.daily || []).slice(-7).map((d: any) => d.minutes) });
    }
  }, [shareOpen, stats]);

  const downloadShare = () => {
    if (!shareRef.current) return;
    const a = document.createElement("a");
    a.href = shareRef.current.toDataURL("image/png");
    a.download = "focusflow-progress.png";
    a.click();
  };

  const copyShare = async () => {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(shareText({ streak: stats.streak ?? 0, monthMin: stats.monthMin ?? 0, level: stats.level ?? 1, xp: stats.xp ?? 0, totalHours: stats.totalHours ?? 0 }));
      toast("Copied — paste it anywhere!", "success");
    } catch {
      toast("Copy failed in this browser", "error");
    }
  };

  const goalProgress = (g: any) => {
    if (!stats) return 0;
    switch (g.kind) {
      case "daily_minutes": return Math.min(1, stats.todayMin / g.target);
      case "weekly_minutes": return Math.min(1, stats.weekMin / g.target);
      case "monthly_minutes": return Math.min(1, stats.monthMin / g.target);
      case "weekly_sessions": return Math.min(1, stats.weekSessions / g.target);
      default: return 0;
    }
  };
  const goalCurrent = (g: any) => {
    if (!stats) return "0";
    switch (g.kind) {
      case "daily_minutes": return fmtMinutes(stats.todayMin);
      case "weekly_minutes": return fmtMinutes(stats.weekMin);
      case "monthly_minutes": return fmtMinutes(stats.monthMin);
      case "weekly_sessions": return `${stats.weekSessions}`;
      default: return "0";
    }
  };

  if (statsLoading && !stats) {
    return (
      <div className="grid">
        <div className="grid grid-4"><CardSkeleton height={46} /><CardSkeleton height={46} /><CardSkeleton height={46} /><CardSkeleton height={46} /></div>
        <div className="grid grid-2"><CardSkeleton height={260} /><CardSkeleton height={260} /></div>
      </div>
    );
  }

  const pie = (stats?.bySubject || []).map((s: any) => ({ name: s.name, value: Math.round(s.minutes), color: s.color }));

  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* Level + freeze + share */}
      {stats && (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <ProgressRing size={74} stroke={8} pct={(stats.xpInto ?? 0) / Math.max(1, stats.xpNeed ?? 1)} color="var(--accent)" label={`Lv ${stats.level ?? 1}`} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Level {stats.level ?? 1}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{stats.xp ?? 0} XP total · {(stats.xpNeed ?? 0) - (stats.xpInto ?? 0)} XP to level {(stats.level ?? 1) + 1}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>❄️ {stock} freeze{stock === 1 ? "" : "s"} left{frozenToday ? " · today frozen" : atRisk ? " · streak at risk!" : ""}</div>
          </div>
          {atRisk && stock > 0 && (
            <button className="btn" onClick={useFreeze}><Snowflake size={15} /> Freeze streak</button>
          )}
          {frozenToday && (
            <button className="btn" onClick={unFreeze}>Unfreeze</button>
          )}
          <button className="btn btn-primary" onClick={() => setShareOpen(true)}><Share2 size={15} /> Share</button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-4">
        <Stat icon={<Flame size={22} />} label="Day streak" value={`${stats?.streak ?? 0}`} sub="consecutive days" accent="#f97316" />
        <Stat icon={<Clock size={22} />} label="Today" value={fmtMinutes(stats?.todayMin ?? 0)} sub="focused time" accent="#6366f1" />
        <Stat icon={<CalendarDays size={22} />} label="This week" value={fmtMinutes(stats?.weekMin ?? 0)} sub={`${stats?.weekSessions ?? 0} sessions`} accent="#10b981" />
        <Stat icon={<TrendingUp size={22} />} label="All time" value={`${stats?.totalHours ?? 0}h`} sub={`${stats?.totalSessions ?? 0} sessions`} accent="#ec4899" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr" }} >
        <style>{`@media (max-width: 1000px){ .grid[style*="1.6fr"] { grid-template-columns: 1fr !important; } }`}</style>
        {/* 30-day trend */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 15 }}>Study time — last 30 days</h3>
            <Link href="/progress" className="btn btn-sm btn-ghost">Full analytics</Link>
          </div>
          {stats && stats.daily.some((d: any) => d.minutes > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.daily} margin={{ left: -20, right: 8, top: 6 }}>
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={(d) => d.slice(5)} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 60)}h`} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12.5 }}
                  labelStyle={{ fontWeight: 700 }}
                  formatter={(v: any) => [fmtMinutes(Number(v)), "Focused"]}
                />
                <Area type="monotone" dataKey="minutes" stroke="var(--accent)" strokeWidth={2.5} fill="url(#dashGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<TrendingUp size={26} />} title="No study data yet" hint="Start a timer to see your 30-day trend come alive." action={<Link className="btn btn-primary" href="/timer"><Play size={15} /> Start focusing</Link>} />
          )}
        </div>

        {/* Subject split */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>Subjects — last 30 days</h3>
          {pie.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pie} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                    {pie.map((p: any) => <Cell key={p.name} fill={p.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12.5 }} formatter={(v: any) => [fmtMinutes(Number(v))]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {pie.slice(0, 6).map((p: any) => (
                  <span key={p.name} style={{ fontSize: 12, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Dot color={p.color} /> {p.name}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon={<BookOpen size={26} />} title="Nothing tracked yet" hint="Log your first session to unlock subject insights." action={<Link className="btn btn-primary" href="/timer"><TimerIcon size={15} /> Open timers</Link>} />
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <style>{`@media (max-width: 1000px){ .grid[style*="1.6fr"] { grid-template-columns: 1fr !important; } }`}</style>
        {/* Recent sessions */}
        <div className="card card-pad-0">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
            <h3 style={{ fontSize: 15 }}>Recent sessions</h3>
            <Link href="/sessions" className="btn btn-sm btn-ghost">View all</Link>
          </div>
          {(sessData?.sessions || []).length === 0 ? (
            <EmptyState icon={<Clock size={26} />} title="No sessions logged" hint="Pomodoros, timers and stopwatch runs appear here." action={<Link className="btn btn-primary" href="/timer"><Play size={15} /> Start a session</Link>} />
          ) : (
            <table className="table">
              <thead><tr><th>Subject</th><th>Type</th><th>Duration</th><th>When</th></tr></thead>
              <tbody>
                {(sessData?.sessions || []).map((s: any) => (
                  <tr key={s.id}>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                        <Dot color={s.subject_color || "#64748b"} /> {s.subject_name || "Unassigned"}
                      </span>
                    </td>
                    <td><span className="badge" style={{ textTransform: "capitalize" }}>{s.type}</span></td>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{fmtMinutes(Math.round(s.duration_sec / 60))}</td>
                    <td style={{ color: "var(--muted)", fontSize: 13 }}>{prettyDT(s.started_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Goals */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15 }}>Goals</h3>
            <button className="btn btn-sm" onClick={() => setGoalModal(true)}><Plus size={14} /> Add</button>
          </div>
          {goals.length === 0 ? (
            <EmptyState icon={<Target size={26} />} title="No goals set" hint="Set a daily or weekly target to stay accountable." action={<button className="btn btn-primary" onClick={() => setGoalModal(true)}><Plus size={15} /> Create a goal</button>} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {goals.slice(0, 4).map((g: any, i: number) => (
                <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <ProgressRing
                    size={58} stroke={6}
                    pct={goalProgress(g)}
                    color={SUBJECT_COLORS[i % SUBJECT_COLORS.length]}
                    label={`${Math.round(goalProgress(g) * 100)}%`}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{goalCurrent(g)} of {g.target} {KIND_LABELS[g.kind]}</div>
                  </div>
                  <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => removeGoal(g.id)} title="Delete goal"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Consistency heatmap — last 20 weeks</h3>
        <Heatmap data={stats?.heat || []} />
      </div>

      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="Share your progress">
        <canvas ref={shareRef} style={{ width: "100%", borderRadius: 14, border: "1px solid var(--border)" }} />
        <div className="modal-actions" style={{ justifyContent: "space-between" }}>
          <button className="btn" onClick={copyShare}>Copy text</button>
          <button className="btn btn-primary" onClick={downloadShare}>Download PNG</button>
        </div>
      </Modal>

      <Modal open={goalModal} onClose={() => setGoalModal(false)} title="New goal">
        <div className="field">
          <label className="label">Title</label>
          <input className="input" value={gTitle} onChange={(e) => setGTitle(e.target.value)} placeholder="e.g. 2 hours of Physics daily" />
        </div>
        <div className="grid grid-2">
          <div className="field">
            <label className="label">Type</label>
            <select className="select" value={gKind} onChange={(e) => setGKind(e.target.value)}>
              <option value="daily_minutes">Minutes per day</option>
              <option value="weekly_minutes">Minutes per week</option>
              <option value="monthly_minutes">Minutes per month</option>
              <option value="weekly_sessions">Sessions per week</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Target</label>
            <input className="input" type="number" min={1} value={gTarget} onChange={(e) => setGTarget(e.target.value)} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setGoalModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={addGoal} disabled={saving || !gTitle.trim()}>Save goal</button>
        </div>
      </Modal>
    </div>
  );
}
