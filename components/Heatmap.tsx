"use client";

import React, { useMemo } from "react";

export default function Heatmap({ data, weeks = 20, compact = false }: { data: Array<{ date: string; minutes: number; frozen?: boolean }>; weeks?: number; compact?: boolean }) {
  const { cols, max, months } = useMemo(() => {
    const byDate: Record<string, number> = {};
    const frozen = new Set<string>();
    let max = 0;
    for (const d of data) { byDate[d.date] = d.minutes; if (d.frozen) frozen.add(d.date); if (d.minutes > max) max = d.minutes; }
    // Build columns of 7 ending today, aligned to Monday start
    const dayMs = 86400000;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = weeks * 7;
    const end = new Date(today.getTime() + (6 - ((today.getDay() + 6) % 7)) * dayMs); // upcoming Sunday
    const cols: Array<Array<{ date: string; v: number; future: boolean; f: boolean }>> = [];
    for (let w = 0; w < weeks; w++) {
      const col: Array<{ date: string; v: number; future: boolean; f: boolean }> = [];
      for (let dow = 0; dow < 7; dow++) {
        const d = new Date(end.getTime() - ((totalDays - 1) - (w * 7 + dow)) * dayMs);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        col.push({ date: key, v: byDate[key] || 0, future: d > today, f: frozen.has(key) });
      }
      cols.push(col);
    }
    // month labels: where the month of a column's Monday changes
    const months: Array<{ i: number; label: string }> = [];
    let lastM = -1;
    cols.forEach((col, i) => {
      const first = col[0];
      if (first) {
        const m = Number(first.date.slice(5, 7)) - 1;
        if (m !== lastM) { months.push({ i, label: new Date(first.date).toLocaleString("en", { month: "short" }) }); lastM = m; }
      }
    });
    return { cols, max, months };
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

  const gap = compact ? 2 : 4;
  const cell = compact ? { width: 9, height: 9 } : undefined;
  return (
    <div>
      <div style={{ display: "flex", gap, overflowX: "auto", paddingBottom: 2 }}>
        {cols.map((col, i) => {
          const m = months.find((x: any) => x.i === i);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap }}>
              <div style={{ height: 14, fontSize: 9, color: "var(--muted)", fontWeight: 700, whiteSpace: "nowrap" }}>
                {m ? m.label : ""}
              </div>
              {col.map((c) => (
                <div
                  key={c.date}
                  className="heat-cell"
                  title={`${c.date} — ${c.v >= 60 ? `${Math.floor(c.v / 60)}h ${c.v % 60}m` : `${c.v}m`}`}
                  style={{
                    ...(cell || {}),
                    ...(c.future ? { opacity: 0.25 } : c.f && c.v <= 0 ? { background: "rgba(125, 211, 252, 0.5)", border: "1px solid rgba(125,211,252,.9)" } : styles[level(c.v)]),
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
