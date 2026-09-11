"use client";

import React, { useState } from "react";
import { Route, Check, Play, RotateCcw, Trophy, Plus, Clock, ChevronDown, CheckCheck } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { fmtMinutes } from "@/lib/utils";
import { Spinner } from "@/components/ui";
import { useToast } from "@/components/Providers";

function fmtDur(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m ${s}s`;
}

export default function WebDevPage() {
  const { toast } = useToast();
  const { data, loading, reload } = useFetch("/api/webdev");
  const { data: subjectsData, reload: reloadSubjects } = useFetch("/api/subjects");
  const [expanded, setExpanded] = useState<string | null>(null);
  const topics: any[] = data?.topics || [];
  const subjects: any[] = subjectsData?.subjects || [];
  const hasWebSubject = subjects.some((s: any) => /web|delta|mern/i.test(s.name || ""));
  const done: number = data?.done || 0;
  const total: number = data?.total || topics.length || 1;
  const pct = Math.round((done / total) * 100);
  const current = topics.find((t: any) => t.key === data?.current);
  const openKey = expanded ?? data?.current ?? null;
  const currentIdx = topics.findIndex((t: any) => t.key === data?.current);
  const aboveCount = currentIdx > 0 ? topics.slice(0, currentIdx).filter((t: any) => t.status !== "done").length : 0;

  const setStatus = async (key: string, status: string) => {
    try {
      await api("/api/webdev", { method: "PATCH", body: JSON.stringify({ key, status }) });
      await reload();
      if (status === "done") toast("Topic done! Next one unlocked 🎉", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const setLecture = async (key: string, idx: number, len: number) => {
    try {
      await api("/api/webdev", { method: "PATCH", body: JSON.stringify({ key, lecture_idx: idx }) });
      await reload();
      if (idx >= len) toast("Module complete! Next one unlocked 🎉", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const completeAbove = async () => {
    const above = topics.slice(0, currentIdx).filter((t: any) => t.status !== "done");
    try {
      for (const t of above) {
        await api("/api/webdev", { method: "PATCH", body: JSON.stringify({ key: t.key, status: "done" }) });
      }
      await reload();
      toast(`${above.length} earlier modules marked done`, "success");
    } catch (e: any) {
      toast(e.message, "error");
      await reload();
    }
  };

  const createSubject = async () => {
    try {
      await api("/api/subjects", {
        method: "POST",
        body: JSON.stringify({ name: "Web Dev", color: "#22d3ee", target_minutes: 600 }),
      });
      await reloadSubjects();
      toast("Web Dev subject created — timers will now auto-pick topics", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const reset = async () => {
    if (!confirm("Restart the whole Web Dev journey? Time logs stay, statuses reset.")) return;
    try {
      await api("/api/webdev", { method: "POST", body: JSON.stringify({ action: "reset" }) });
      await reload();
      toast("Journey restarted", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  if (loading || !data) {
    return (
      <div className="card">
        <Spinner lg />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Route size={18} style={{ color: "var(--accent)" }} />
          <h2 style={{ fontSize: 18, margin: 0 }}>Web Dev Journey</h2>
          <div style={{ flex: 1 }} />
          <button className="btn btn-sm" onClick={reset} title="Restart journey">
            <RotateCcw size={13} /> Restart
          </button>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 12px" }}>
          One topic at a time. Pick the <b>Web Dev</b> subject in Focus Timers and your current topic is selected automatically.
        </p>
        <div
          style={{
            height: 12, borderRadius: 99, background: "var(--surface-2)",
            border: "1px solid var(--border)", overflow: "hidden",
          }}
        >
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent-grad)", transition: "width .4s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span className="badge">{done}/{total} topics · {pct}%</span>
          <span className="badge">
            <Clock size={12} /> {fmtMinutes(Math.round((data.total_sec || 0) / 60))} on Web Dev
          </span>
          {current && <span className="badge">Now: {current.title}</span>}
          {aboveCount > 0 && (
            <button className="btn btn-sm" onClick={completeAbove} title="Mark every module above the current one as done">
              <CheckCheck size={13} /> Complete {aboveCount} earlier
            </button>
          )}
        </div>
      </div>

      {!hasWebSubject && (
        <div className="card" style={{ borderColor: "var(--accent)" }}>
          <b style={{ fontSize: 14 }}>Step 1: create your Web Dev subject</b>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>
            Timers detect any subject with “Web”, “Delta” or “MERN” in its name. Create it now and the journey plugs in automatically.
          </p>
          <button className="btn btn-primary btn-sm" onClick={createSubject}>
            <Plus size={14} /> Create “Web Dev” subject
          </button>
        </div>
      )}

      {done === total ? (
        <div className="card" style={{ textAlign: "center", padding: "32px 20px" }}>
          <Trophy size={34} style={{ color: "#f59e0b" }} />
          <h3 style={{ margin: "10px 0 4px" }}>Journey complete! 🏆</h3>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
            All {total} topics done. Ship projects — or restart and go deeper.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topics.map((t: any, i: number) => {
            const lectures: any[] = t.lectures || [];
            const lidx: number = t.lecture_idx || 0;
            const open = openKey === t.key;
            return (
              <div
                key={t.key}
                className="card"
                style={{
                  padding: "12px 14px",
                  borderColor: t.status === "doing" ? "var(--accent)" : undefined,
                }}
              >
                <div
                  style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}
                  onClick={() => setExpanded(open ? "__none__" : t.key)}
                  title={open ? "Collapse lectures" : "Expand lectures"}
                >
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center",
                      fontWeight: 800, fontSize: 14, flexShrink: 0,
                      background: t.status === "done" ? "#10b981" : t.status === "doing" ? "var(--accent)" : "var(--surface-2)",
                      color: t.status === "todo" ? "var(--muted)" : "#fff",
                      border: t.status === "todo" ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {t.status === "done" ? <Check size={16} strokeWidth={3} /> : i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {t.title}{" "}
                      {t.status === "doing" && (
                        <span className="badge" style={{ marginLeft: 6 }}>current</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                      {t.blurb}
                      {t.status !== "done" && lectures.length > 0 && (
                        <> · lecture {Math.min(lidx + 1, lectures.length)}/{lectures.length}</>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                      {t.seconds > 0 ? `${fmtMinutes(Math.round(t.seconds / 60))} logged` : "no time yet"}
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    style={{
                      color: "var(--muted)", flexShrink: 0,
                      transform: open ? "rotate(180deg)" : "none", transition: "transform .2s",
                    }}
                  />
                </div>

                {open && lectures.length > 0 && (
                  <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                    {lectures.map((l: any, li: number) => {
                      const st = t.status === "done" || li < lidx ? "done" : li === lidx ? "doing" : "todo";
                      return (
                        <div
                          key={li}
                          onClick={() => li !== lidx && setLecture(t.key, li, lectures.length)}
                          title={li !== lidx ? "Jump here" : "Current lecture"}
                          style={{
                            display: "flex", gap: 10, alignItems: "center", padding: "7px 8px",
                            borderRadius: 8, fontSize: 13.5, cursor: li !== lidx ? "pointer" : "default",
                            background: st === "doing" ? "var(--accent-soft)" : "transparent",
                          }}
                        >
                          <span
                            style={{
                              width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center",
                              fontSize: 11, fontWeight: 700, flexShrink: 0,
                              background: st === "done" ? "#10b981" : st === "doing" ? "var(--accent)" : "var(--surface-2)",
                              color: st === "todo" ? "var(--muted)" : "#fff",
                            }}
                          >
                            {st === "done" ? <Check size={12} strokeWidth={3} /> : li + 1}
                          </span>
                          <span style={{ flex: 1, color: st === "todo" ? "var(--muted)" : "var(--text)" }}>{l.title}</span>
                          <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtDur(l.secs)}</span>
                        </div>
                      );
                    })}
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      {t.status === "todo" && (
                        <button className="btn btn-sm" onClick={() => setStatus(t.key, "doing")}>
                          <Play size={13} /> Start
                        </button>
                      )}
                      {lidx < lectures.length && (
                        <button className="btn btn-sm btn-primary" onClick={() => setLecture(t.key, lidx + 1, lectures.length)}>
                          <Check size={13} /> Next lecture
                        </button>
                      )}
                      {t.status !== "done" && (
                        <button className="btn btn-sm" onClick={() => setStatus(t.key, "done")}>
                          Skip to done
                        </button>
                      )}
                      {t.status === "done" && (
                        <button className="btn btn-sm" onClick={() => setStatus(t.key, "todo")}>
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
