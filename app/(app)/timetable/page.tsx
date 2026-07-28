"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  CalendarRange, Wand2, Download, Printer, Save, Trash2, AlertTriangle, Clock, Coffee, FolderOpen,
} from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { generateTimetable, DAY_NAMES, type Slot, type TTConfig } from "@/lib/timetable";
import { EmptyState, Modal, Spinner, Dot } from "@/components/ui";
import { useToast } from "@/components/Providers";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function TimetablePage() {
  const { toast } = useToast();
  const { data: subjectsData, loading: subLoading } = useFetch("/api/subjects");
  const { data: ttData, setData: setTtData, reload: reloadTt } = useFetch("/api/timetables");
  const subjects = subjectsData?.subjects || [];
  const saved = ttData?.timetables || [];

  /* ---------- config state ---------- */
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(20);
  const [sessionMin, setSessionMin] = useState(50);
  const [breakMin, setBreakMin] = useState(10);
  const [longBreakMin, setLongBreakMin] = useState(30);
  const [intensity, setIntensity] = useState<"light" | "balanced" | "intense">("balanced");
  const [mins, setMins] = useState<Record<number, number>>({});
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [name, setName] = useState("My weekly plan");
  const [saveModal, setSaveModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // prefill minutes from weekly targets
  useEffect(() => {
    if (subjects.length && Object.keys(mins).length === 0) {
      const m: Record<number, number> = {};
      subjects.forEach((s: any) => (m[s.id] = s.target_minutes || 300));
      setMins(m);
    }
  }, [subjects, mins]);

  const config: TTConfig = useMemo(
    () => ({
      days, startHour, endHour, sessionMin, breakMin, longBreakMin, intensity,
      subjects: subjects.map((s: any) => ({ id: s.id, name: s.name, color: s.color, weeklyMinutes: mins[s.id] || 0 })),
    }),
    [days, startHour, endHour, sessionMin, breakMin, longBreakMin, intensity, subjects, mins]
  );

  const generate = () => {
    const { slots, warnings } = generateTimetable(config);
    setSlots(slots);
    setWarnings(warnings);
    if (slots.length) toast("Timetable generated!", "success");
    else if (warnings.length) toast(warnings[0], "error");
  };

  const subjectById = useMemo(() => {
    const m: Record<number, any> = {};
    subjects.forEach((s: any) => (m[s.id] = s));
    return m;
  }, [subjects]);

  const save = async () => {
    if (!slots) return;
    setBusy(true);
    try {
      const { timetable } = await api("/api/timetables", {
        method: "POST",
        body: JSON.stringify({ name, config, slots, save: true }),
      });
      setTtData({ timetables: [timetable, ...saved] } as any);
      setSaveModal(false);
      toast("Timetable saved", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
    setBusy(false);
  };

  const loadSaved = (t: any) => {
    setSlots(t.slots);
    setName(t.name);
    const c = t.config || {};
    if (c.days) setDays(c.days);
    if (c.startHour != null) setStartHour(c.startHour);
    if (c.endHour != null) setEndHour(c.endHour);
    if (c.sessionMin) setSessionMin(c.sessionMin);
    if (c.breakMin != null) setBreakMin(c.breakMin);
    if (c.longBreakMin != null) setLongBreakMin(c.longBreakMin);
    if (c.intensity) setIntensity(c.intensity);
    if (c.subjects) {
      const m: Record<number, number> = {};
      c.subjects.forEach((s: any) => (m[s.id] = s.weeklyMinutes));
      setMins((prev) => ({ ...prev, ...m }));
    }
    toast(`Loaded "${t.name}"`, "success");
  };

  const removeSaved = async (id: number) => {
    const prev = saved;
    setTtData({ timetables: saved.filter((t: any) => t.id !== id) } as any);
    try {
      await api(`/api/timetables/${id}`, { method: "DELETE" });
      toast("Timetable deleted", "success");
    } catch (e: any) {
      setTtData({ timetables: prev } as any);
      toast(e.message, "error");
    }
  };

  const downloadPng = async () => {
    if (!gridRef.current) return;
    try {
      const dataUrl = await toPng(gridRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.download = `${name.replace(/\s+/g, "-").toLowerCase() || "timetable"}.png`;
      a.href = dataUrl;
      a.click();
      toast("PNG downloaded", "success");
    } catch {
      toast("PNG export failed in this browser", "error");
    }
  };

  const hours = (hm: string) => {
    const [h, m] = hm.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const weeklyTotal = slots?.filter((s) => s.type === "study").reduce((a, s) => a + s.minutes, 0) || 0;

  return (
    <div className="grid" style={{ gridTemplateColumns: "340px 1fr", alignItems: "start" }}>
      <style>{`@media (max-width: 1100px){ .grid[style*="340px"] { grid-template-columns: 1fr !important; } }`}</style>

      {/* ---------- Builder ---------- */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card no-print">
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Auto timetable builder</h3>

          <div className="field">
            <label className="label">Study days</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  className={`chip ${days.includes(d) ? "on" : ""}`}
                  style={{ padding: "6px 10px" }}
                  onClick={() => setDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]))}
                >
                  {DAY_NAMES[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label className="label">Day starts</label>
              <select className="select" value={startHour} onChange={(e) => setStartHour(Number(e.target.value))}>
                {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Day ends</label>
              <select className="select" value={endHour} onChange={(e) => setEndHour(Number(e.target.value))}>
                {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-3">
            <div className="field">
              <label className="label">Session (min)</label>
              <input className="input" type="number" min={20} max={180} step={5} value={sessionMin} onChange={(e) => setSessionMin(Number(e.target.value))} />
            </div>
            <div className="field">
              <label className="label">Break</label>
              <input className="input" type="number" min={0} max={60} step={5} value={breakMin} onChange={(e) => setBreakMin(Number(e.target.value))} />
            </div>
            <div className="field">
              <label className="label">Long break</label>
              <input className="input" type="number" min={0} max={120} step={5} value={longBreakMin} onChange={(e) => setLongBreakMin(Number(e.target.value))} />
            </div>
          </div>

          <div className="field">
            <label className="label">Intensity</label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["light", "balanced", "intense"] as const).map((i) => (
                <button key={i} className={`chip ${intensity === i ? "on" : ""}`} style={{ textTransform: "capitalize" }} onClick={() => setIntensity(i)}>{i}</button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="label">Subject hours per week</label>
            {subLoading ? (
              <Spinner />
            ) : subjects.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>Add subjects first to build a timetable.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {subjects.map((s: any) => (
                  <div key={s.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><Dot color={s.color} /> {s.name}</span>
                      <b>{((mins[s.id] || 0) / 60).toFixed(1)}h</b>
                    </div>
                    <input
                      type="range" min={0} max={900} step={30} value={mins[s.id] || 0}
                      onChange={(e) => setMins((m) => ({ ...m, [s.id]: Number(e.target.value) }))}
                      style={{ width: "100%", accentColor: s.color }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-block btn-lg" onClick={generate} disabled={subjects.length === 0}>
            <Wand2 size={16} /> Generate timetable
          </button>
        </div>

        {saved.length > 0 && (
          <div className="card no-print">
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Saved plans</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {saved.map((t: any) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", background: "var(--surface-2)", borderRadius: 10 }}>
                  <CalendarRange size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                  <button className="iconbtn" style={{ width: 30, height: 30 }} title="Load" onClick={() => loadSaved(t)}><FolderOpen size={14} /></button>
                  <button className="iconbtn" style={{ width: 30, height: 30 }} title="Delete" onClick={() => removeSaved(t.id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------- Preview ---------- */}
      <div>
        {warnings.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {warnings.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "color-mix(in srgb, var(--warn) 12%, transparent)", color: "var(--warn)", fontSize: 13, fontWeight: 500 }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} /> {w}
              </div>
            ))}
          </div>
        )}

        {!slots ? (
          <div className="card" style={{ minHeight: 420 }}>
            <EmptyState
              icon={<CalendarRange size={26} />}
              title="No timetable yet"
              hint="Set your days, window and subject hours, then hit Generate — FocusFlow balances subjects across the week and inserts breaks for you."
              action={<button className="btn btn-primary" onClick={generate} disabled={subjects.length === 0}><Wand2 size={15} /> Generate now</button>}
            />
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }} className="no-print">
              <span className="badge"><Clock size={12} /> {Math.floor(weeklyTotal / 60)}h {weeklyTotal % 60}m planned / week</span>
              <span className="badge">{slots.filter((s) => s.type === "study").length} study blocks</span>
              <div style={{ flex: 1 }} />
              <button className="btn" onClick={downloadPng}><Download size={15} /> PNG</button>
              <button className="btn" onClick={() => window.print()}><Printer size={15} /> PDF / Print</button>
              <button className="btn btn-primary" onClick={() => setSaveModal(true)}><Save size={15} /> Save plan</button>
            </div>

            <div ref={gridRef} style={{ background: "var(--bg, transparent)", borderRadius: 16, padding: 4 }}>
              <h2 style={{ fontSize: 18, margin: "8px 4px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <CalendarRange size={19} style={{ color: "var(--accent)" }} /> {name}
              </h2>
              {(() => {
                const visibleDays = [1, 2, 3, 4, 5, 6, 7].filter((d) => slots.some((s) => s.day === d) || days.includes(d));
                return (
              <div className="tt" style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(0, 1fr))` }}>
                {visibleDays.map((d) => {
                  const daySlots = slots.filter((s) => s.day === d).sort((a, b) => a.start.localeCompare(b.start));
                  return (
                    <div key={d} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ textAlign: "center", fontWeight: 800, fontSize: 12.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", padding: "6px 0" }}>
                        {["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][d]}
                      </div>
                      {daySlots.length === 0 ? (
                        <div className="tt-cell tt-break" style={{ justifyContent: "center", minHeight: 60 }}>Rest day</div>
                      ) : (
                        daySlots.map((s, i) =>
                          s.type === "break" ? (
                            <div key={i} className="tt-cell tt-break">
                              <Coffee size={12} /> {hours(s.start)} · {s.minutes}m
                            </div>
                          ) : (
                            <div
                              key={i}
                              className="tt-cell tt-study"
                              style={{
                                background: `linear-gradient(135deg, ${subjectById[s.subjectId!]?.color || "#6366f1"}, ${subjectById[s.subjectId!]?.color || "#6366f1"}cc)`,
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: 12.5 }}>{subjectById[s.subjectId!]?.name || "Study"}</div>
                              <div style={{ opacity: 0.85, fontSize: 11 }}>{hours(s.start)} – {hours(s.end)}</div>
                            </div>
                          )
                        )
                      )}
                    </div>
                  );
                })}
              </div>
                );
              })()}
            </div>
          </>
        )}
      </div>

      <Modal open={saveModal} onClose={() => setSaveModal(false)} title="Save timetable">
        <div className="field">
          <label className="label">Plan name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Semester 4 — mornings" />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setSaveModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy || !name.trim()}><Save size={15} /> Save</button>
        </div>
      </Modal>
    </div>
  );
}
