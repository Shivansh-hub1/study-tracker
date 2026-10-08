"use client";

import React, { useState } from "react";
import { ArrowLeftRight, X } from "lucide-react";
import { api } from "@/lib/client";
import { fmtMinutes } from "@/lib/utils";
import { playSound } from "@/lib/sounds";
import { useToast } from "@/components/Providers";

type Transferable = { date: string; minutes: number; half: number };
type Daily = { date: string; minutes: number };

function dayLabel(date: string): string {
  const d = new Date(date + "T12:00:00");
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yest.getTime()) return "Yesterday";
  return d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
}

export default function TimeTransfer({ transferable, daily, onDone }: { transferable: Transferable[]; daily: Daily[]; onDone: () => void }) {
  const { toast } = useToast();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);

  if (!transferable || transferable.length === 0) return null;

  const move = async (fromDay: string) => {
    if (!target) { toast("Pick a day to move the time to", "error"); return; }
    setBusy(true);
    try {
      const r = await api(`/api/transfer?offset=${-new Date().getTimezoneOffset()}`, {
        method: "POST",
        body: JSON.stringify({ fromDay, toDay: target }),
      });
      playSound("milestone");
      toast(`Moved ${fmtMinutes(r.minutes)} from ${dayLabel(fromDay)} → ${dayLabel(target)}`, "success");
      setOpenFor(null);
      setTarget("");
      onDone();
    } catch (e: any) {
      playSound("error");
      toast(e.message || "Transfer failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <ArrowLeftRight size={16} style={{ color: "var(--accent)" }} />
        <h2 style={{ fontSize: 14.5, fontWeight: 800 }}>Balance your days</h2>
        <span className="badge" style={{ fontSize: 10.5, background: "var(--accent-soft)", color: "var(--accent)" }}>6h+ day</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12 }}>
        You studied more than 6 hours on {transferable.length === 1 ? "this day" : "these days"}. Move half of that time
        to an earlier day to fill gaps and grow your streak — total time and XP stay the same.
      </p>

      {transferable.map((t) => {
        const open = openFor === t.date;
        const options = (daily || []).filter((d) => d.date < t.date);
        return (
          <div key={t.date} style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>{dayLabel(t.date)} · {fmtMinutes(t.minutes)}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>moveable: {fmtMinutes(t.half)}</div>
              </div>
              {!open ? (
                <button className="btn" onClick={() => { setOpenFor(t.date); setTarget(""); }}>
                  Move {fmtMinutes(t.half)} →
                </button>
              ) : (
                <button className="btn" onClick={() => setOpenFor(null)} aria-label="Cancel"><X size={14} /></button>
              )}
            </div>

            {open && (
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <select
                  className="input"
                  style={{ maxWidth: 250 }}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="">Move to which day?</option>
                  {options.slice().reverse().map((d) => (
                    <option key={d.date} value={d.date}>
                      {dayLabel(d.date)} {d.minutes > 0 ? `(${fmtMinutes(d.minutes)} already)` : "(no study yet)"}
                    </option>
                  ))}
                </select>
                <button className="btn btn-primary" disabled={busy || !target} onClick={() => move(t.date)}>
                  {busy ? "Moving…" : "Confirm"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
