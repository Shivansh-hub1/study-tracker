"use client";

import React, { useEffect, useState } from "react";
import { Target, CheckCircle2, Flame, Sparkles } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { playSound } from "@/lib/sounds";
import { useToast } from "@/components/Providers";

const PRESETS = [60, 90, 120, 180, 240, 300, 360];

export default function DailyGoalRing() {
  const { data: dashData } = useFetch("/api/dashboard");
  const { toast } = useToast();
  const [targetMin, setTargetMin] = useState(120);
  const [open, setOpen] = useState(false);
  const [customVal, setCustomVal] = useState("");

  const todayMin = Math.round(Number(dashData?.stats?.todayMin ?? 0));

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ff_daily_target_min");
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (parsed > 0) setTargetMin(parsed);
      }
    } catch {}
  }, []);

  const pct = Math.min(1, Math.max(0, todayMin / Math.max(1, targetMin)));
  const isDone = todayMin >= targetMin;
  const size = 30;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - pct * circumference;

  const saveTarget = async (mins: number) => {
    const val = Math.max(15, Math.min(720, mins));
    setTargetMin(val);
    try {
      localStorage.setItem("ff_daily_target_min", String(val));
      await api("/api/tasks", { method: "PATCH", body: JSON.stringify({ dailyTargetMin: val }) });
      playSound("pop");
      toast(`Daily target set to ${val} minutes (${Math.round((val / 60) * 10) / 10}h)`, "success");
    } catch {}
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => { playSound("click"); setOpen(true); }}
        className="badge"
        title={`Daily Focus Goal: ${todayMin} / ${targetMin} mins (${Math.round(pct * 100)}%). Click to adjust.`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: isDone ? "color-mix(in srgb, #10b981 12%, var(--surface))" : "var(--surface)",
          border: isDone ? "1px solid #10b98188" : "1px solid var(--border)",
          color: isDone ? "#10b981" : "var(--text)",
          padding: "4px 9px",
          borderRadius: 9999,
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          transition: "all 0.15s ease",
          boxShadow: isDone ? "0 0 10px #10b98122" : "none",
        }}
      >
        <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--border)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={isDone ? "#10b981" : "var(--accent)"}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
          </svg>
          {isDone ? (
            <CheckCircle2 size={13} style={{ color: "#10b981" }} />
          ) : (
            <Target size={12} style={{ color: "var(--accent)" }} />
          )}
        </div>
        <span style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
          {todayMin} / {targetMin}m
          <span style={{ opacity: 0.65, marginLeft: 4, fontSize: 11 }}>({Math.round(pct * 100)}%)</span>
        </span>
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)} style={{ zIndex: 100 }}>
          <div
            className="card modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 360, padding: 22 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: isDone ? "#10b98122" : "var(--accent-soft)",
                  color: isDone ? "#10b981" : "var(--accent)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {isDone ? <Sparkles size={20} /> : <Target size={20} />}
              </div>
              <div>
                <h3 style={{ fontSize: 16, margin: 0 }}>Daily Focus Goal</h3>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {todayMin >= targetMin
                    ? "Target achieved today! Outstanding consistency."
                    : `${targetMin - todayMin} mins remaining to close today's ring.`}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--surface-2)",
                padding: "12px 14px",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Today&apos;s Focus
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                  {todayMin} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>minutes</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Progress
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: isDone ? "#10b981" : "var(--accent)", marginTop: 2 }}>
                  {Math.round(pct * 100)}%
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8, color: "var(--muted)" }}>
              Select Daily Target:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 14 }}>
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => saveTarget(p)}
                  className={`btn ${targetMin === p ? "btn-primary" : ""}`}
                  style={{ fontSize: 12, padding: "7px 6px", textAlign: "center" }}
                >
                  {p >= 60 ? `${p / 60}h` : `${p}m`}
                  {p === 120 && <span style={{ fontSize: 10, opacity: 0.8, marginLeft: 2 }}>⭐</span>}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customVal) saveTarget(parseInt(customVal, 10));
              }}
              style={{ display: "flex", gap: 8, marginBottom: 14 }}
            >
              <input
                type="number"
                min={15}
                max={720}
                placeholder="Custom minutes..."
                value={customVal}
                onChange={(e) => setCustomVal(e.target.value)}
                className="input"
                style={{ flex: 1, fontSize: 13 }}
              />
              <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }}>
                Set
              </button>
            </form>

            <button onClick={() => setOpen(false)} className="btn btn-block" style={{ fontSize: 13 }}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
