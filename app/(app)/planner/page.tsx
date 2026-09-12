"use client";

import React, { useState } from "react";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { CardSkeleton, EmptyState, Modal, Dot } from "@/components/ui";
import { useToast } from "@/components/Providers";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PlannerPage() {
  const { toast } = useToast();
  const { data, loading, reload } = useFetch("/api/planner");
  const { data: subjectsData } = useFetch("/api/subjects");
  const [modal, setModal] = useState(false);
  const [day, setDay] = useState("0");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("60");
  const blocks = data?.blocks || [];
  const weekKey = data?.weekKey || "";
  const subjects = subjectsData?.subjects || [];
  const doneCount = blocks.filter((b: any) => b.done_week === weekKey && weekKey).length;

  const add = async () => {
    try {
      await api("/api/planner", { method: "POST", body: JSON.stringify({ day: Number(day), subject_id: subjectId || null, title, minutes: Number(minutes) }) });
      setModal(false); setTitle(""); setMinutes("60"); reload(); toast("Block added", "success");
    } catch (e: any) { toast(e.message, "error"); }
  };

  const toggle = async (b: any) => {
    try { await api("/api/planner", { method: "PATCH", body: JSON.stringify({ id: b.id, done: b.done_week !== weekKey }) }); reload(); }
    catch (e: any) { toast(e.message, "error"); }
  };

  const remove = async (id: number) => {
    try { await api(`/api/planner?id=${id}`, { method: "DELETE" }); reload(); }
    catch (e: any) { toast(e.message, "error"); }
  };

  if (loading && !data) return <div className="grid"><CardSkeleton height={300} /></div>;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>This week · {blocks.length ? Math.round((doneCount / blocks.length) * 100) : 0}% done</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>{doneCount}/{blocks.length} blocks ticked — resets every Monday</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Add block</button>
      </div>
      {blocks.length === 0 ? (
        <div className="card"><EmptyState icon={<CalendarDays size={26} />} title="Empty week" hint="Plan study blocks per day, tick them off, and watch your weekly completion rate." action={<button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Plan my week</button>} /></div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, minWidth: 980 }}>
            {DAYS.map((d, i) => (
              <div key={d} className="card" style={{ padding: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, color: "var(--muted)" }}>{d.toUpperCase()}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {blocks.filter((b: any) => b.day === i).map((b: any) => {
                    const done = b.done_week === weekKey && weekKey;
                    return (
                      <div key={b.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "8px 10px", background: done ? "var(--accent-soft)" : "var(--surface-2)", opacity: done ? 0.85 : 1 }}>
                        <label style={{ display: "flex", gap: 7, alignItems: "flex-start", cursor: "pointer", fontSize: 13 }}>
                          <input type="checkbox" checked={!!done} onChange={() => toggle(b)} style={{ marginTop: 2 }} />
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, textDecoration: done ? "line-through" : "none" }}>
                              {b.subject_color ? <Dot color={b.subject_color} /> : null}
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.subject_name || b.title || "Study"}</span>
                            </span>
                            <span style={{ color: "var(--muted)", fontSize: 12 }}>{b.title && b.subject_name ? `${b.title} · ` : ""}{b.minutes}m</span>
                          </span>
                        </label>
                        <button className="btn btn-sm btn-ghost" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => remove(b.id)}><Trash2 size={12} /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="New block">
        <div className="grid grid-2">
          <div className="field"><label className="label">Day</label>
            <select className="select" value={day} onChange={(e) => setDay(e.target.value)}>
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="field"><label className="label">Minutes</label><input className="input" type="number" min={5} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} /></div>
        </div>
        <div className="field"><label className="label">Subject (optional)</label>
          <select className="select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">No subject</option>
            {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="field"><label className="label">Title (optional)</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Thermodynamics ch.5" /></div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={add}>Save block</button>
        </div>
      </Modal>
    </div>
  );
}
