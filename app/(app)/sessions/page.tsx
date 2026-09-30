"use client";

import React, { useMemo, useState } from "react";
import { ListChecks, Plus, Pencil, Trash2, Download, Filter, Calendar, ArrowUpDown, Volume2, VolumeX, Clock, Search } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { fmtMinutes, prettyDT, localDateKey } from "@/lib/utils";
import { Modal, EmptyState, Spinner, Dot } from "@/components/ui";
import { useToast } from "@/components/Providers";
import { playSound, isSoundEnabled, setSoundEnabled } from "@/lib/sounds";

type SortBy = "date_desc" | "date_asc" | "duration_desc" | "duration_asc" | "subject_asc";
type DateRange = "all" | "today" | "yesterday" | "7d" | "30d" | "month";

export default function SessionsPage() {
  const { toast } = useToast();
  const [subjectFilter, setSubjectFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [search, setSearch] = useState("");
  const [soundOn, setSoundOn] = useState(true);

  const { data, loading, setData } = useFetch(`/api/sessions?limit=500${subjectFilter ? `&subject_id=${subjectFilter}` : ""}`, [subjectFilter]);
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

  React.useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound("pop");
  };

  // Filter + Sort logic
  const filteredSorted = useMemo(() => {
    let list = [...sessions];

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      list = list.filter((s: any) => {
        const d = new Date(s.started_at);
        switch (dateRange) {
          case "today":
            return d >= startOfToday;
          case "yesterday": {
            const yStart = new Date(startOfToday); yStart.setDate(yStart.getDate() - 1);
            const yEnd = new Date(startOfToday);
            return d >= yStart && d < yEnd;
          }
          case "7d": {
            const seven = new Date(startOfToday); seven.setDate(seven.getDate() - 7);
            return d >= seven;
          }
          case "30d": {
            const thirty = new Date(startOfToday); thirty.setDate(thirty.getDate() - 30);
            return d >= thirty;
          }
          case "month": {
            const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return d >= mStart;
          }
          default: return true;
        }
      });
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s: any) =>
        (s.subject_name || "").toLowerCase().includes(q) ||
        (s.topic || "").toLowerCase().includes(q) ||
        (s.notes || "").toLowerCase().includes(q) ||
        (s.type || "").toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a: any, b: any) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
        case "date_asc":
          return new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
        case "duration_desc":
          return b.duration_sec - a.duration_sec;
        case "duration_asc":
          return a.duration_sec - b.duration_sec;
        case "subject_asc":
          return (a.subject_name || "").localeCompare(b.subject_name || "");
        default:
          return 0;
      }
    });

    return list;
  }, [sessions, dateRange, search, sortBy]);

  const totalMin = useMemo(() => Math.round(filteredSorted.reduce((a: number, s: any) => a + s.duration_sec, 0) / 60), [filteredSorted]);

  const openCreate = () => {
    playSound("pop");
    setFSubject(subjects[0]?.id ? String(subjects[0].id) : "");
    setFDate(localDateKey(new Date()));
    setFTime(new Date().toTimeString().slice(0, 5));
    setFDur("45"); setFType("manual"); setFNotes(""); setFTopic("");
    setModal({});
  };
  const openEdit = (s: any) => {
    playSound("click");
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
        const res: any = await api(`/api/sessions/${modal.id}`, { method: "PATCH", body: JSON.stringify(payload) }, { queueOffline: true });
        if (res?._queued) {
          toast("No internet — edit saved on this device, will sync", "success");
        } else {
          setData({ sessions: prev.map((s: any) => (s.id === modal.id ? res.session : s)) } as any);
          toast("Session updated", "success");
        }
        playSound("success");
      } else {
        const res: any = await api("/api/sessions", { method: "POST", body: JSON.stringify(payload) }, { queueOffline: true });
        if (res?._queued) {
          toast("No internet — session saved on this device, will sync", "success");
        } else {
          setData({ sessions: [res.session, ...prev] } as any);
          toast("Session logged", "success");
        }
        playSound("success");
      }
      setModal(null);
    } catch (e: any) {
      setData({ sessions: prev } as any);
      playSound("error");
      toast(e.message, "error");
    }
    setBusy(false);
  };

  const remove = async () => {
    const s = confirmDel;
    setConfirmDel(null);
    const prev = sessions;
    setData({ sessions: sessions.filter((x: any) => x.id !== s.id) } as any);
    playSound("delete");
    try {
      const res: any = await api(`/api/sessions/${s.id}`, { method: "DELETE" }, { queueOffline: true });
      toast(res?._queued ? "No internet — delete saved, will sync" : "Session deleted", "success");
    } catch (e: any) {
      setData({ sessions: prev } as any);
      playSound("error");
      toast(e.message, "error");
    }
  };

  // Group by date for display
  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredSorted.forEach((s: any) => {
      const key = localDateKey(new Date(s.started_at));
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return Object.entries(groups);
  }, [filteredSorted]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`
        .sessions-toolbar {
          display: flex; gap: 10; flex-wrap: wrap; align-items: center;
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 12px 14px;
          box-shadow: var(--shadow);
        }
        .sessions-select {
          border-radius: 12px !important;
          font-weight: 600 !important;
          padding: 9px 12px !important;
          min-width: 140px;
        }
        .date-group-header {
          position: sticky; top: 0; z-index: 2;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 10px 14px;
          font-size: 12.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--muted);
          display: flex; gap: 10; align-items: center;
        }
        .session-row { transition: all 0.15s ease; }
        .session-row:hover { background: var(--surface-2) !important; transform: translateX(2px); }
      `}</style>

      {/* Toolbar — premium */}
      <div className="sessions-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
            <Filter size={16} />
          </div>
          <select className="select sessions-select" style={{ width: 160 }} value={subjectFilter} onChange={(e) => { playSound("click"); setSubjectFilter(e.target.value); }}>
            <option value="">All subjects</option>
            {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar size={14} style={{ color: "var(--muted)" }} />
          <select className="select sessions-select" style={{ width: 145 }} value={dateRange} onChange={(e) => { playSound("click"); setDateRange(e.target.value as DateRange); }}>
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="month">This month</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ArrowUpDown size={14} style={{ color: "var(--muted)" }} />
          <select className="select sessions-select" style={{ width: 155 }} value={sortBy} onChange={(e) => { playSound("click"); setSortBy(e.target.value as SortBy); }}>
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="duration_desc">Longest first</option>
            <option value="duration_asc">Shortest first</option>
            <option value="subject_asc">Subject A-Z</option>
          </select>
        </div>

        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 260 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input className="input" placeholder="Search topic, notes..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 30, borderRadius: 12, fontWeight: 500 }} />
        </div>

        <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent)", fontWeight: 700, padding: "6px 12px", borderRadius: 999 }}>
          {filteredSorted.length} sessions · {fmtMinutes(totalMin)}
        </span>

        <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
          <button className="iconbtn" onClick={toggleSound} title={soundOn ? "Sound on" : "Sound off"} style={{ width: 36, height: 36, borderRadius: 12, background: soundOn ? "var(--accent-soft)" : "var(--surface-2)", color: soundOn ? "var(--accent)" : "var(--muted)", border: `1px solid ${soundOn ? "var(--accent)" : "var(--border)"}` }}>
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <a className="btn" href="/api/export?format=csv" style={{ borderRadius: 12, fontWeight: 700 }} onClick={() => playSound("click")}><Download size={15} /> Export CSV</a>
          <button className="btn btn-primary" onClick={openCreate} style={{ borderRadius: 12, fontWeight: 800, background: "var(--accent-grad)", boxShadow: "var(--glow)" }}><Plus size={15} /> Log session</button>
        </div>
      </div>

      {/* Table */}
      <div className="card card-pad-0" style={{ borderRadius: 20, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40 }}><Spinner lg /></div>
        ) : filteredSorted.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={26} />}
            title="No sessions found"
            hint={subjectFilter || dateRange !== "all" || search ? "Try different filters." : "Log a study session manually or start a timer."}
            action={<button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Log your first session</button>}
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            {sortBy === "date_desc" || sortBy === "date_asc" ? (
              // Grouped by date view
              <div>
                {grouped.map(([dateKey, groupSessions]: any) => {
                  const d = new Date(dateKey);
                  const isToday = localDateKey(new Date()) === dateKey;
                  const isYesterday = localDateKey(new Date(Date.now() - 86400000)) === dateKey;
                  const label = isToday ? "Today" : isYesterday ? "Yesterday" : d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
                  const dayTotal = groupSessions.reduce((a: number, s: any) => a + s.duration_sec, 0);
                  return (
                    <div key={dateKey}>
                      <div className="date-group-header">
                        <Clock size={12} />
                        {label}
                        <span className="badge" style={{ marginLeft: 8, fontSize: 11 }}>{groupSessions.length} sessions · {fmtMinutes(Math.round(dayTotal / 60))}</span>
                      </div>
                      <table className="table">
                        <tbody>
                          {groupSessions.map((s: any) => (
                            <tr key={s.id} className="session-row">
                              <td>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, whiteSpace: "nowrap" }}>
                                  <Dot color={s.subject_color || "#64748b"} /> {s.subject_name || "Unassigned"}
                                </span>
                              </td>
                              <td>{s.topic ? <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent)", fontWeight: 600 }}>{s.topic}</span> : <span style={{ color: "var(--muted)" }}>—</span>}</td>
                              <td><span className="badge" style={{ textTransform: "capitalize", background: "var(--surface-2)", color: "var(--muted)", fontWeight: 600 }}>{s.type}</span></td>
                              <td style={{ color: "var(--muted)", fontSize: 13, whiteSpace: "nowrap", fontWeight: 500 }}>{prettyDT(s.started_at).split(",")[1] || prettyDT(s.started_at)}</td>
                              <td style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>{fmtMinutes(Math.round(s.duration_sec / 60))}</td>
                              <td style={{ color: "var(--muted)", fontSize: 13, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</td>
                              <td>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button className="iconbtn" style={{ width: 30, height: 30, borderRadius: 8 }} onClick={() => openEdit(s)}><Pencil size={13} /></button>
                                  <button className="iconbtn" style={{ width: 30, height: 30, borderRadius: 8 }} onClick={() => { playSound("click"); setConfirmDel(s); }}><Trash2 size={13} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Flat table for other sorts
              <table className="table">
                <thead>
                  <tr><th>Subject</th><th>Topic</th><th>Type</th><th>Started</th><th>Duration</th><th>Notes</th><th style={{ width: 90 }}></th></tr>
                </thead>
                <tbody>
                  {filteredSorted.map((s: any) => (
                    <tr key={s.id} className="session-row">
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, whiteSpace: "nowrap" }}>
                          <Dot color={s.subject_color || "#64748b"} /> {s.subject_name || "Unassigned"}
                        </span>
                      </td>
                      <td>{s.topic ? <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 600 }}>{s.topic}</span> : <span style={{ color: "var(--muted)" }}>—</span>}</td>
                      <td><span className="badge" style={{ textTransform: "capitalize" }}>{s.type}</span></td>
                      <td style={{ color: "var(--muted)", fontSize: 13, whiteSpace: "nowrap" }}>{prettyDT(s.started_at)}</td>
                      <td style={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{fmtMinutes(Math.round(s.duration_sec / 60))}</td>
                      <td style={{ color: "var(--muted)", fontSize: 13, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => openEdit(s)}><Pencil size={13} /></button>
                          <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => { playSound("click"); setConfirmDel(s); }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
          <button className="btn" onClick={() => { playSound("click"); setModal(null); }}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy} style={{ borderRadius: 12, fontWeight: 800 }}>{modal?.id ? "Save changes" : "Log session"}</button>
        </div>
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete session?">
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          This {fmtMinutes(Math.round((confirmDel?.duration_sec || 0) / 60))} session will be permanently removed.
        </p>
        <div className="modal-actions">
          <button className="btn" onClick={() => { playSound("click"); setConfirmDel(null); }}>Cancel</button>
          <button className="btn btn-danger" onClick={remove}><Trash2 size={15} /> Delete</button>
        </div>
      </Modal>
    </div>
  );
}
