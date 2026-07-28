"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, Target } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { fmtMinutes, SUBJECT_COLORS } from "@/lib/utils";
import { Modal, EmptyState, Spinner } from "@/components/ui";
import { useToast } from "@/components/Providers";

export default function SubjectsPage() {
  const { toast } = useToast();
  const { data, loading, setData, reload } = useFetch("/api/subjects");
  const subjects = data?.subjects || [];

  const [modal, setModal] = useState<null | { id?: number }>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [target, setTarget] = useState("300");
  const [confirmDel, setConfirmDel] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const openCreate = () => {
    setName(""); setColor(SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length]); setTarget("300");
    setModal({});
  };
  const openEdit = (s: any) => {
    setName(s.name); setColor(s.color); setTarget(String(s.target_minutes));
    setModal({ id: s.id });
  };

  const save = async () => {
    if (!name.trim()) return;
    setBusy(true);
    const payload = { name: name.trim(), color, target_minutes: Number(target) || 0 };
    const prev = subjects;
    if (modal?.id) {
      // optimistic update
      setData({ subjects: subjects.map((s: any) => (s.id === modal.id ? { ...s, ...payload } : s)) } as any);
      try {
        const { subject } = await api(`/api/subjects/${modal.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        setData({ subjects: prev.map((s: any) => (s.id === modal.id ? { ...s, ...subject } : s)) } as any);
        toast("Subject updated", "success");
        setModal(null);
      } catch (e: any) {
        setData({ subjects: prev } as any);
        toast(e.message, "error");
      }
    } else {
      const temp = { id: -Date.now(), ...payload, total_sec: 0, session_count: 0 };
      setData({ subjects: [...subjects, temp] } as any);
      try {
        const { subject } = await api("/api/subjects", { method: "POST", body: JSON.stringify(payload) });
        setData({ subjects: [...prev, { ...subject, total_sec: 0, session_count: 0 }] } as any);
        toast("Subject created", "success");
        setModal(null);
      } catch (e: any) {
        setData({ subjects: prev } as any);
        toast(e.message, "error");
      }
    }
    setBusy(false);
  };

  const remove = async () => {
    const s = confirmDel;
    setConfirmDel(null);
    const prev = subjects;
    setData({ subjects: subjects.filter((x: any) => x.id !== s.id) } as any);
    try {
      await api(`/api/subjects/${s.id}`, { method: "DELETE" });
      toast(`"${s.name}" deleted`, "success");
    } catch (e: any) {
      setData({ subjects: prev } as any);
      toast(e.message, "error");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New subject</button>
      </div>

      {loading ? (
        <div className="grid grid-3">
          {[0, 1, 2].map((i) => <div key={i} className="card"><div className="skel" style={{ height: 90 }} /></div>)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<BookOpen size={26} />}
            title="No subjects yet"
            hint="Create your first subject to tag study sessions and auto-generate timetables."
            action={<button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add a subject</button>}
          />
        </div>
      ) : (
        <div className="grid grid-3">
          {subjects.map((s: any) => (
            <div key={s.id} className="card" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: "0 0 auto 0", height: 4, background: s.color, boxShadow: `0 0 14px ${s.color}` }} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 6 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 13, background: `${s.color}22`, color: s.color,
                  display: "grid", placeItems: "center", flexShrink: 0, boxShadow: `0 0 16px -4px ${s.color}`,
                  fontWeight: 800, fontSize: 16,
                }}>
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                    {fmtMinutes(Math.round((s.total_sec || 0) / 60))} total · {s.session_count} sessions
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={() => openEdit(s)} title="Edit"><Pencil size={14} /></button>
                  <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={() => setConfirmDel(s)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--muted)" }}>
                <Target size={13} style={{ color: s.color }} />
                Weekly target: <b style={{ color: "var(--text)" }}>{fmtMinutes(s.target_minutes)}</b>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? "Edit subject" : "New subject"}>
        <div className="field">
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Organic Chemistry" autoFocus />
        </div>
        <div className="field">
          <label className="label">Color</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SUBJECT_COLORS.map((c) => (
              <button key={c} className={`color-dot ${color === c ? "on" : ""}`} style={{ background: c, color: c }} onClick={() => setColor(c)} aria-label={c} />
            ))}
          </div>
        </div>
        <div className="field">
          <label className="label">Weekly target (minutes)</label>
          <input className="input" type="number" min={0} step={15} value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy || !name.trim()}>{modal?.id ? "Save changes" : "Create subject"}</button>
        </div>
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete subject?">
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
          <b style={{ color: "var(--text)" }}>{confirmDel?.name}</b> will be removed. Past sessions stay in your history but become unassigned.
        </p>
        <div className="modal-actions">
          <button className="btn" onClick={() => setConfirmDel(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={remove}><Trash2 size={15} /> Delete</button>
        </div>
      </Modal>
    </div>
  );
}
