"use client";

import React, { useState } from "react";
import { Plus, Trash2, Sprout, Check } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { CardSkeleton, EmptyState, Modal } from "@/components/ui";
import { useToast } from "@/components/Providers";

const COLORS = ["#10b981", "#6366f1", "#ec4899", "#f59e0b", "#0ea5e9", "#8b5cf6"];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HabitsPage() {
  const { toast } = useToast();
  const { data, loading, reload } = useFetch(`/api/habits?offset=${-new Date().getTimezoneOffset()}`);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const habits = data?.habits || [];

  const add = async () => {
    if (!name.trim()) return;
    try {
      await api("/api/habits", { method: "POST", body: JSON.stringify({ name, color }) });
      setModal(false); setName(""); reload(); toast("Habit added", "success");
    } catch (e: any) { toast(e.message, "error"); }
  };

  const toggle = async (h: any) => {
    try { await api("/api/habits", { method: "PATCH", body: JSON.stringify({ id: h.id, day: todayKey() }) }); reload(); }
    catch (e: any) { toast(e.message, "error"); }
  };

  if (loading && !data) return <div className="grid"><CardSkeleton height={200} /></div>;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> New habit</button>
      </div>
      {habits.length === 0 ? (
        <div className="card"><EmptyState icon={<Sprout size={26} />} title="No habits yet" hint="Small daily habits beat rare big efforts. Add one and tick it every day." action={<button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Add habit</button>} /></div>
      ) : (
        <div className="grid grid-2">
          {habits.map((h: any) => (
            <div key={h.id} className="card" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: h.color, boxShadow: `0 0 8px ${h.color}`, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{h.name}</div>
                <div style={{ display: "flex", gap: 5, marginTop: 6, alignItems: "center" }}>
                  {(h.last7 || []).map((on: boolean, i: number) => (
                    <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: on ? h.color : "var(--border)", opacity: on ? 1 : 0.7 }} />
                  ))}
                  <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>🔥 {h.streak} · {h.total} total</span>
                </div>
              </div>
              <button className={`btn btn-sm ${h.doneToday ? "" : "btn-primary"}`} onClick={() => toggle(h)}>
                {h.doneToday ? <><Check size={14} /> Done</> : "Tick today"}
              </button>
              <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={async () => { await api(`/api/habits?id=${h.id}`, { method: "DELETE" }); reload(); }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="New habit">
        <div className="field"><label className="label">Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Read 20 pages" /></div>
        <div className="field">
          <label className="label">Color</label>
          <div style={{ display: "flex", gap: 10 }}>
            {COLORS.map((c) => (
              <button key={c} className={`color-dot ${color === c ? "on" : ""}`} style={{ background: c, color: c }} onClick={() => setColor(c)} aria-label={c} />
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={add} disabled={!name.trim()}>Save habit</button>
        </div>
      </Modal>
    </div>
  );
}
