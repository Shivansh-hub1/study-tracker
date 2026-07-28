"use client";

import React, { useMemo } from "react";

export default function Heatmap({ data, weeks = 20 }: { data: Array<{ date: string; minutes: number }>; weeks?: number }) {
  const { cols, max } = useMemo(() => {
    const byDate: Record<string, number> = {};
    let max = 0;
    for (const d of data) { byDate[d.date] = d.minutes; if (d.minutes > max) max = d.minutes; }
    // Build columns of 7 ending today, aligned to Monday start
    const dayMs = 86400000;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = weeks * 7;
    const end = new Date(today.getTime() + (6 - ((today.getDay() + 6) % 7)) * dayMs); // upcoming Sunday
    const cols: Array<Array<{ date: string; v: number; future: boolean }>> = [];
    for (let w = 0; w < weeks; w++) {
      const col: Array<{ date: string; v: number; future: boolean }> = [];
      for (let dow = 0; dow < 7; dow++) {
        const d = new Date(end.getTime() - ((totalDays - 1) - (w * 7 + dow)) * dayMs);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        col.push({ date: key, v: byDate[key] || 0, future: d > today });
      }
      cols.push(col);
    }
    return { cols, max };
  }, [data, weeks]);

  const level = (v: number) => {
    if (v <= 0) return 0;
    if (max <= 0) return 1;
    const r = v / max;
    return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1;
  };
  const styles = [
    { background: "var(--surface-2)", border: "1px solid var(--border)" },
    { background: "color-mix(in srgb, var(--accent) 30%, transparent)", border: "1px solid transparent" },
    { background: "color-mix(in srgb, var(--accent) 50%, transparent)", border: "1px solid transparent" },
    { background: "color-mix(in srgb, var(--accent) 75%, transparent)", border: "1px solid transparent" },
    { background: "var(--accent)", border: "1px solid transparent", boxShadow: "0 0 6px var(--accent)" },
  ];

  return (
    <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6 }}>
      {cols.map((col, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {col.map((c) => (
            <div
              key={c.date}
              className="heat-cell"
              title={`${c.date} — ${c.v >= 60 ? `${Math.floor(c.v / 60)}h ${c.v % 60}m` : `${c.v}m`}`}
              style={c.future ? { opacity: 0.25 } : styles[level(c.v)]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
