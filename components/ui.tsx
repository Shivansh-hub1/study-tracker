"use client";

import React, { useEffect, useRef } from "react";

export function Spinner({ lg }: { lg?: boolean }) {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: lg ? 48 : 16 }}>
      <div className={`spinner ${lg ? "spinner-lg" : ""}`} />
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" style={wide ? { maxWidth: 760 } : undefined} ref={ref}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <div className="ico">{icon}</div>
      <h4>{title}</h4>
      {hint && <p>{hint}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

export function ProgressRing({
  size = 96,
  stroke = 9,
  pct,
  color = "var(--accent)",
  label,
  sub,
}: {
  size?: number;
  stroke?: number;
  pct: number; // 0..1
  color?: string;
  label?: string;
  sub?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, pct));
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: "stroke-dashoffset 0.6s ease", filter: "drop-shadow(0 0 6px currentColor)" }}
        />
      </svg>
      <div className="ring-label">
        <div style={{ fontWeight: 800, fontSize: size > 70 ? 17 : 13 }}>{label}</div>
        {sub && <div style={{ fontSize: 10.5, color: "var(--muted)" }}>{sub}</div>}
      </div>
    </div>
  );
}

export function Stat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="card" style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 13,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          background: accent ? `${accent}1f` : "var(--accent-soft)",
          color: accent || "var(--accent)",
          boxShadow: accent ? `0 0 16px -4px ${accent}` : "var(--glow)",
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="stat-label">{label}</div>
        <div className="stat-num" style={{ fontSize: 24 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function CardSkeleton({ height = 160 }: { height?: number }) {
  return (
    <div className="card">
      <div className="skel" style={{ width: "40%", height: 16, marginBottom: 14 }} />
      <div className="skel" style={{ width: "100%", height }} />
    </div>
  );
}

export function FieldError({ msg }: { msg?: string | null }) {
  if (!msg) return null;
  return (
    <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: 500, padding: "8px 12px", background: "color-mix(in srgb, var(--danger) 8%, transparent)", borderRadius: 8, marginBottom: 12 }}>
      {msg}
    </div>
  );
}

export function Dot({ color }: { color: string }) {
  return <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block", boxShadow: `0 0 8px ${color}` }} />;
}
