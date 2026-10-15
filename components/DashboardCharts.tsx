"use client";

// Recharts lives ONLY in this file — the dashboard lazy-loads it so the
// initial page paint never waits for ~100 KB of chart code.
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { fmtMinutes } from "@/lib/utils";
import { Dot } from "@/components/ui";

const TOOLTIP_STYLE = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12.5,
};

export function TrendChart({ daily }: { daily: Array<{ date: string; minutes: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={daily} margin={{ left: -20, right: 8, top: 6 }}>
        <defs>
          <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={(d) => d.slice(5)} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 60)}h`} />
        <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ fontWeight: 700 }} formatter={(v: any) => [fmtMinutes(Number(v)), "Focused"]} />
        <Area type="monotone" dataKey="minutes" stroke="var(--accent)" strokeWidth={2.5} fill="url(#dashGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SubjectPie({ pie }: { pie: Array<{ name: string; value: number; color: string }> }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={pie} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3} strokeWidth={0}>
            {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [fmtMinutes(Number(v))]} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {pie.slice(0, 6).map((p) => (
          <span key={p.name} style={{ fontSize: 12, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Dot color={p.color} /> {p.name}
          </span>
        ))}
      </div>
    </>
  );
}
