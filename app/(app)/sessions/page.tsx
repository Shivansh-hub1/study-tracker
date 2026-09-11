"use client";

import React, { useMemo, useState } from "react";
import { ListChecks, Plus, Pencil, Trash2, Download, Filter } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { fmtMinutes, prettyDT, pad, localDateKey } from "@/lib/utils";
import { Modal, EmptyState, Spinner, Dot } from "@/components/ui";
import { useToast } from "@/components/Providers";

export default function SessionsPage() {
  const { toast } = useToast();
  const [subjectFilter, setSubjectFilter] = useState("");
  const { data, loading, setData } = useFetch(`/api/sessions?limit=300${subjectFilter ? `&subject_id=${subjectFilter}` : ""}`, [subjectFilter]);
  const { data: subjectsData } = useFetch("/api/subjects");
  const { data: dsaData } = useFetch("/api/dsa");
  const { data: webData } = useFetch("/api/webdev");
  const sessions = data?.sessions || [];
  const subjects = subjectsData?.subjects || [];

  const [modal, setModal] = useState<null | { id?: number }>(null);
  const [fSubject, setFSubject] = useState("");
  const [fDate, setFDate] = useState(localDateKey(new Date()));
  const [fTime, setFTime] = useState("18:00");
  const [fDur, setFDur] = useState("45");
  const [fType, setFType] = useState("manual");
  const [fNotes, setFNotes] = useState("");
  const [fTopic, setFTopic] = useState("");
  const dsaTopics: any[] = dsaData?.topics || [];
  const webTopics: any[] = webData?.topics || [];
  const fSubName = subjects.find((s: any) => String(s.id) === fSubject)?.name || "";
  const fIsDsa = /dsa/i.test(fSubName);
  const fIsWeb = !fIsDsa && /web|delta|mern/i.test(fSubName);
  const fTopics = fIsDsa ? dsaTopics : webTopics;
  const [confirmDel, setConfirmDel] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const openCreate = () => {
    setFSubject(subjects[0]?.id ? String(subjects[0].id) : "");
    setFDate(localDateKey(new Date()));
    setFTime(new Date().toTimeString().slice(0, 5));
    setFDur("45"); setFType("manual"); setFNotes(""); setFTopic("");
    setModal({});
  };
  const openEdit = (s: any) => {
    const d = new Date(s.started_at);
    setFSubject(s.subject_id ? String(s.subject_id) : "");
    setFDate(localDateKey(d));
    setFTime(d.toTimeString().slice(0, 5));
    setFDur(String(Math.round(s.duration_sec / 60)));
    setFType(s.type); setFNotes(s.notes || ""); setFTopic(s.topic || "");
    setModal({ id: s.id });
  };

  const save = async () => {
    setBusy(true);
    const durSec = Math.max(60, (Number(fDur) || 1) * 60);
    const started = new Date(`${fDate}T${fTime}:00`);
    const payload = {
      subject_id: fSubject ? Number(fSubject) : null,
      type: fType,
      started_at: started.toISOString(),
      duration_sec: durSec,
      notes: fNotes,
      topic: fTopic,
    };
    const prev = sessions;
    try {
      if (modal?.id) {
        const optimistic = prev.map((s: any) => (s.id === modal.id ? { ...s, ...payload, duration_sec: durSec } : s));
        setData({ sessions: optimistic } as any);
        const { session } = await api(`/api/sessions/${modal.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        setData({ sessions: prev.map((s: any) => (s.id === modal.id ? session : s)) } as any);
        toast("Session updated", "success");
      } else {
        const { session } = await api("/api/sessions", { method: "POST", body: JSON.stringify(payload) });
        setData({ sessions: [session, ...prev] } as any);
        toast("Session logged", "success");
      }
      setModal(null);
    } catch (e: any) {
      setData({ sessions: prev } as any);
      toast(e.message, "error");
    }
    setBusy(false);
  };

  const remove = async () => {
    const s = confirmDel;
    setConfirmDel(null);
    const prev = sessions;
    setData({ sessions: sessions.filter((x: any) => x.id !== s.id) } as any);
    try {
      await api(`/api/sessions/${s.id}`, { method: "DELETE" });
      toast("Session deleted", "success");
    } catch (e: any) {
      setData({ sessions: prev } as any);
      toast(e.message, "error");
    }
  };

  const totalMin = useMemo(() => Math.round(sessions.reduce((a: number, s: any) => a + s.duration_sec, 0) / 60), [sessions]);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={15} style={{ color: "var(--muted)" }} />
          <select className="select" style={{ width: 190 }} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="">All subjects</option>
            {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <span className="badge">{sessions.length} sessions · {fmtMinutes(totalMin)}</span>
        <div style={{ flex: 1 }} />
        <a className="btn" href="/api/export?format=csv"><Download size={15} /> Export CSV</a>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Log session</button>
      </div>

      <div className="card card-pad-0">
        {loading ? (
          <Spinner lg />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={26} />}
            title="No sessions found"
            hint={subjectFilter ? "Try a different subject filter." : "Log a study session manually or start a timer."}
            action={<button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Log your first session</button>}
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr><th>Subject</th><th>Topic</th><th>Type</th><th>Started</th><th>Duration</th><th>Notes</th><th style={{ width: 90 }}></th></tr>
              </thead>
              <tbody>
                {sessions.map((s: any) => (
                  <tr key={s.id}>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, whiteSpace: "nowrap" }}>
                        <Dot color={s.subject_color || "#64748b"} /> {s.subject_name || "Unassigned"}
                      </span>
                    </td>
                    <td>{s.topic ? <span className="badge">{s.topic}</span> : <span style={{ color: "var(--muted)" }}>—</span>}</td>
                    <td><span className="badge" style={{ textTransform: "capitalize" }}>{s.type}</span></td>
                    <td style={{ color: "var(--muted)", fontSize: 13, whiteSpace: "nowrap" }}>{prettyDT(s.started_at)}</td>
                    <td style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmtMinutes(Math.round(s.duration_sec / 60))}</td>
                    <td style={{ color: "var(--muted)", fontSize: 13, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => openEdit(s)}><Pencil size={13} /></button>
                        <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => setConfirmDel(s)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? "Edit session" : "Log a session"}>
        <div className="field">
          <label className="label">Subject</label>
          <select className="select" value={fSubject} onChange={(e) => setFSubject(e.target.value)}>
            <option value="">Unassigned</option>
            {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div className="field">
            <label className="label">Date</label>
            <input className="input" type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Start time</label>
            <input className="input" type="time" value={fTime} onChange={(e) => setFTime(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Minutes</label>
            <input className="input" type="number" min={1} value={fDur} onChange={(e) => setFDur(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="label">Type</label>
          <select className="select" value={fType} onChange={(e) => setFType(e.target.value)}>
            <option value="manual">Manual entry</option>
            <option value="pomodoro">Pomodoro</option>
            <option value="timer">Timer</option>
            <option value="stopwatch">Stopwatch</option>
          </select>
        </div>
        {(fIsDsa || fIsWeb) && (
          <div className="field">
            <label className="label">Journey topic</label>
            <select className="select" value={fTopic} onChange={(e) => setFTopic(e.target.value)}>
              <option value="">No topic</option>
              {fTopics.map((t: any) => <option key={t.key} value={t.title}>{t.title}</option>)}
            </select>
          </div>
        )}
        <div className="field">
          <label className="label">Notes</label>
          <textarea className="input" rows={2} value={fNotes} onChange={(e) => setFNotes(e.target.value)} placeholder="What did you cover?" />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>{modal?.id ? "Save changes" : "Log session"}</button>
        </div>
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete session?">
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          This {fmtMinutes(Math.round((confirmDel?.duration_sec || 0) / 60))} session will be permanently removed.
        </p>
        <div className="modal-actions">
          <button className="btn" onClick={() => setConfirmDel(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={remove}><Trash2 size={15} /> Delete</button>
        </div>
      </Modal>
    </div>
  );
}
