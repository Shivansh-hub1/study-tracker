"use client";

import React, { useState } from "react";
import { Plus, Trash2, CalendarClock } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { CardSkeleton, EmptyState, Modal } from "@/components/ui";
import { useToast } from "@/components/Providers";

type Item = { t: string; done: boolean };

function daysLeft(dateStr: string) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

export default function ExamsPage() {
  const { toast } = useToast();
  const { data, loading, reload } = useFetch("/api/exams");
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [newItem, setNewItem] = useState<Record<number, string>>({});
  const exams = data?.exams || [];

  const add = async () => {
    if (!title.trim() || !date) return;
    try {
      await api("/api/exams", { method: "POST", body: JSON.stringify({ title, subject, exam_date: date, notes }) });
      setModal(false); setTitle(""); setSubject(""); setDate(""); setNotes("");
      reload(); toast("Exam added", "success");
    } catch (e: any) { toast(e.message, "error"); }
  };

  const remove = async (id: number) => {
    try { await api(`/api/exams?id=${id}`, { method: "DELETE" }); reload(); toast("Exam deleted", "success"); }
    catch (e: any) { toast(e.message, "error"); }
  };

  const saveList = async (exam: any, list: Item[]) => {
    try { await api("/api/exams", { method: "PATCH", body: JSON.stringify({ id: exam.id, checklist: list }) }); reload(); }
    catch (e: any) { toast(e.message, "error"); }
  };

  if (loading && !data) return <div className="grid"><CardSkeleton height={200} /></div>;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Add exam</button>
      </div>
      {exams.length === 0 ? (
        <div className="card"><EmptyState icon={<CalendarClock size={26} />} title="No exams tracked" hint="Add your next exam with a prep checklist and watch the countdown." action={<button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15} /> Add exam</button>} /></div>
      ) : (
        <div className="grid grid-2">
          {exams.map((e: any) => {
            const left = daysLeft(e.exam_date);
            const color = left < 0 ? "var(--muted)" : left === 0 ? "var(--danger)" : left <= 7 ? "var(--danger)" : left <= 30 ? "var(--warn)" : "var(--success)";
            const list: Item[] = e.checklist || [];
            const done = list.filter((i) => i.done).length;
            return (
              <div key={e.id} className="card">
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{e.title}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>{e.subject ? `${e.subject} · ` : ""}{e.exam_date}</div>
                  </div>
                  <span className="badge" style={{ color, fontSize: 13 }}>{left < 0 ? "Passed" : left === 0 ? "Today!" : `${left}d left`}</span>
                  <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => remove(e.id)} title="Delete"><Trash2 size={14} /></button>
                </div>
                {e.notes ? <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>{e.notes}</p> : null}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>
                    PREP CHECKLIST{list.length > 0 ? ` · ${done}/${list.length} (${list.length ? Math.round((done / list.length) * 100) : 0}%)` : ""}
                  </div>
                  {list.length > 0 && (
                    <div style={{ height: 6, borderRadius: 99, background: "var(--border)", marginBottom: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.round((done / list.length) * 100)}%`, background: "var(--accent-grad)", borderRadius: 99 }} />
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {list.map((it, i) => (
                      <label key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, cursor: "pointer" }}>
                        <input type="checkbox" checked={it.done} onChange={() => saveList(e, list.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))} />
                        <span style={{ textDecoration: it.done ? "line-through" : "none", color: it.done ? "var(--muted)" : undefined, flex: 1 }}>{it.t}</span>
                        <button className="btn btn-sm btn-ghost" onClick={() => saveList(e, list.filter((_, j) => j !== i))}>✕</button>
                      </label>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <input className="input" placeholder="Add checklist item…" value={newItem[e.id] || ""} onChange={(ev) => setNewItem({ ...newItem, [e.id]: ev.target.value })} onKeyDown={(ev) => { if (ev.key === "Enter" && (newItem[e.id] || "").trim()) { saveList(e, [...list, { t: newItem[e.id].trim(), done: false }]); setNewItem({ ...newItem, [e.id]: "" }); } }} />
                    <button className="btn" onClick={() => { if ((newItem[e.id] || "").trim()) { saveList(e, [...list, { t: newItem[e.id].trim(), done: false }]); setNewItem({ ...newItem, [e.id]: "" }); } }}>Add</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="New exam">
        <div className="field"><label className="label">Title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Physics Board Exam" /></div>
        <div className="grid grid-2">
          <div className="field"><label className="label">Subject (optional)</label><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Physics" /></div>
          <div className="field"><label className="label">Date</label><input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <div className="field"><label className="label">Notes (optional)</label><input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Syllabus, chapters…" /></div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={add} disabled={!title.trim() || !date}>Save exam</button>
        </div>
      </Modal>
    </div>
  );
}
