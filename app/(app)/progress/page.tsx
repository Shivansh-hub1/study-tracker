"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { TrendingUp, Play, Award, Clock3, CalendarClock } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { useStats } from "@/lib/client";
import { fmtMinutes } from "@/lib/utils";
import { EmptyState, Dot, CardSkeleton } from "@/components/ui";
import Heatmap from "@/components/Heatmap";

const TT = {
  contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12.5 } as React.CSSProperties,
  labelStyle: { fontWeight: 700 } as React.CSSProperties,
};
const AX = { tick: { fontSize: 10.5, fill: "var(--muted)" }, tickLine: false, axisLine: false } as const;

export default function ProgressPage() {
  const { data, loading } = useStats();
  const [metric, setMetric] = useState<"minutes" | "sessions">("minutes");
  const stats = data?.stats;

  const best = useMemo(() => {
    if (!stats) return null;
    const b = [...stats.daily].sort((a: any, b: any) => b.minutes - a.minutes)[0];
    return b && b.minutes > 0 ? b : null;
  }, [stats]);

  if (loading && !stats) {
    return (
      <div className="grid">
        <div className="grid grid-3"><CardSkeleton height={70} /><CardSkeleton height={70} /><CardSkeleton height={70} /></div>
        <CardSkeleton height={280} />
        <div className="grid grid-2"><CardSkeleton height={260} /><CardSkeleton height={260} /></div>
      </div>
    );
  }

  if (!stats || stats.totalSessions === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<TrendingUp size={26} />}
          title="No analytics yet"
          hint="Your daily, weekly and monthly charts appear after your first study session."
          action={<Link className="btn btn-primary" href="/timer"><Play size={15} /> Start a session</Link>}
        />
      </div>
    );
  }

  const weeklyBar = stats.weekly.map((w: any, i: number, arr: any[]) => ({
    ...w, delta: i > 0 && arr[i - 1].minutes > 0 ? Math.round(((w.minutes - arr[i - 1].minutes) / arr[i - 1].minutes) * 100) : 0,
  }));
  const pieType = stats.byType.filter((t: any) => t.minutes > 0);
  const TYPE_COLORS: Record<string, string> = { pomodoro: "#ec4899", timer: "#6366f1", stopwatch: "#0ea5e9", manual: "#f59e0b" };
  const radar = stats.bySubject.slice(0, 6).map((s: any) => ({ subject: s.name.length > 10 ? s.name.slice(0, 9) + "…" : s.name, minutes: s.minutes }));
  const hourlyLabeled = stats.hourly.map((v: number, h: number) => ({ hour: `${h}`, minutes: v }));

  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* Summary band */}
      <div className="grid grid-3">
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Award size={22} style={{ color: "var(--warn)" }} />
          <div>
            <div className="stat-label">Best day (last 30d)</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{best ? fmtMinutes(best.minutes) : "—"}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{best ? best.date : ""}</div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Clock3 size={22} style={{ color: "var(--accent)" }} />
          <div>
            <div className="stat-label">Avg per study day (30d)</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              {fmtMinutes(Math.round(stats.daily.reduce((a: number, d: any) => a + d.minutes, 0) / Math.max(1, stats.daily.filter((d: any) => d.minutes > 0).length)))}
            </div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CalendarClock size={22} style={{ color: "#10b981" }} />
          <div>
            <div className="stat-label">Peak focus hour</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              {(() => {
                let bi = 0;
                stats.hourly.forEach((v: number, i: number) => { if (v > stats.hourly[bi]) bi = i; });
                return stats.hourly[bi] > 0 ? `${bi}:00 – ${bi + 1}:00` : "—";
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Daily trend with metric toggle */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
          <h3 style={{ fontSize: 15, flex: 1 }}>Daily trend — last 30 days</h3>
          <button className={`chip ${metric === "minutes" ? "on" : ""}`} onClick={() => setMetric("minutes")}>Minutes</button>
          <button className={`chip ${metric === "sessions" ? "on" : ""}`} onClick={() => setMetric("sessions")}>Sessions</button>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={stats.daily} margin={{ left: -18, right: 8, top: 6 }}>
            <defs>
              <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} minTickGap={24} {...AX} />
            <YAxis tickFormatter={metric === "minutes" ? (v) => `${Math.round(v / 60)}h` : undefined} {...AX} />
            <Tooltip {...TT} formatter={(v: any) => [metric === "minutes" ? fmtMinutes(Number(v)) : v, metric === "minutes" ? "Focus time" : "Sessions"]} />
            <Area type="monotone" dataKey={metric} stroke="var(--accent)" strokeWidth={2.5} fill="url(#pGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-2">
        {/* Weekly bar */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Weekly comparison — last 12 weeks</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={weeklyBar} margin={{ left: -18, right: 8, top: 6 }}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" {...AX} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 60)}h`} {...AX} />
              <Tooltip
                {...TT}
                formatter={(v: any, n: any, p: any) => [`${fmtMinutes(Number(v))} ${p?.payload?.delta ? `(${p.payload.delta > 0 ? "+" : ""}${p.payload.delta}%)` : ""}`, "Focus time"]}
                cursor={{ fill: "var(--accent-soft)" }}
              />
              <Bar dataKey="minutes" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly line */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Monthly totals — last 6 months</h3>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={stats.monthly} margin={{ left: -18, right: 8, top: 6 }}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" {...AX} />
              <YAxis yAxisId="l" tickFormatter={(v) => `${Math.round(v / 60)}h`} {...AX} />
              <YAxis yAxisId="r" orientation="right" {...AX} />
              <Tooltip {...TT} formatter={(v: any, n: any) => [n === "minutes" ? fmtMinutes(Number(v)) : v, n === "minutes" ? "Focus time" : "Sessions"]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="l" type="monotone" dataKey="minutes" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} name="minutes" />
              <Line yAxisId="r" type="monotone" dataKey="sessions" stroke="var(--accent-2)" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} name="sessions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Subject breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>Subject split — last 30 days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.bySubject} dataKey="minutes" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                {stats.bySubject.map((s: any) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Tooltip {...TT} formatter={(v: any, n: any) => [fmtMinutes(Number(v)), n]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {stats.bySubject.slice(0, 5).map((s: any) => {
              const total = stats.bySubject.reduce((a: number, x: any) => a + x.minutes, 0);
              const pct = total ? Math.round((s.minutes / total) * 100) : 0;
              return (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <Dot color={s.color} />
                  <span style={{ flex: 1, fontWeight: 600 }}>{s.name}</span>
                  <span style={{ color: "var(--muted)" }}>{fmtMinutes(s.minutes)}</span>
                  <span className="badge">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Radar */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>Balance radar — last 30 days</h3>
          {radar.length >= 3 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radar}>
                <PolarGrid stroke="var(--chart-grid)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <Radar dataKey="minutes" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.35} />
                <Tooltip {...TT} formatter={(v: any) => [fmtMinutes(Number(v)), "Focus time"]} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<TrendingUp size={24} />} title="Need 3+ subjects" hint="Track time across at least three subjects to see your balance radar." />
          )}
        </div>
      </div>

      <div className="grid grid-2">
        {/* Hourly */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>When you study — by hour of day</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyLabeled} margin={{ left: -24, right: 4, top: 6 }}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}h`} interval={2} {...AX} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 60)}h`} {...AX} />
              <Tooltip {...TT} formatter={(v: any) => [fmtMinutes(Number(v)), "Focus time"]} labelFormatter={(h) => `${h}:00`} cursor={{ fill: "var(--accent-soft)" }} />
              <Bar dataKey="minutes" fill="var(--accent-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Type split */}
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>Timer styles used</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieType} dataKey="minutes" nameKey="type" outerRadius={90} strokeWidth={0} paddingAngle={3}>
                {pieType.map((t: any) => <Cell key={t.type} fill={TYPE_COLORS[t.type] || "#6366f1"} />)}
              </Pie>
              <Tooltip {...TT} formatter={(v: any, n: any) => [fmtMinutes(Number(v)), n]} />
              <Legend wrapperStyle={{ fontSize: 12, textTransform: "capitalize" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Consistency heatmap — daily focus over 20 weeks</h3>
        <Heatmap data={stats.heat} />
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 10, fontSize: 11.5, color: "var(--muted)" }}>
          Less
          {[0.15, 0.35, 0.55, 0.8, 1].map((o) => (
            <span key={o} className="heat-cell" style={{ background: `color-mix(in srgb, var(--accent) ${o * 100}%, transparent)`, border: "1px solid transparent" }} />
          ))}
          More
        </div>
      </div>
    </div>
  );
}
