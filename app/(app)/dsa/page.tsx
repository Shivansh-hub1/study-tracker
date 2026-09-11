"use client";

import React from "react";
import { Route, Check, Play, RotateCcw, Trophy, Plus, Clock } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { fmtMinutes } from "@/lib/utils";
import { Spinner } from "@/components/ui";
import { useToast } from "@/components/Providers";

export default function DsaPage() {
  const { toast } = useToast();
  const { data, loading, reload } = useFetch("/api/dsa");
  const { data: subjectsData, reload: reloadSubjects } = useFetch("/api/subjects");
  const topics: any[] = data?.topics || [];
  const subjects: any[] = subjectsData?.subjects || [];
  const hasDsaSubject = subjects.some((s: any) => /dsa/i.test(s.name || ""));
  const done: number = data?.done || 0;
  const total: number = data?.total || topics.length || 1;
  const pct = Math.round((done / total) * 100);
  const current = topics.find((t: any) => t.key === data?.current);

  const setStatus = async (key: string, status: string) => {
    try {
      await api("/api/dsa", { method: "PATCH", body: JSON.stringify({ key, status }) });
      await reload();
      if (status === "done") toast("Topic done! Next one unlocked 🎉", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const createSubject = async () => {
    try {
      await api("/api/subjects", {
        method: "POST",
        body: JSON.stringify({ name: "DSA", color: "#f59e0b", target_minutes: 600 }),
      });
      await reloadSubjects();
      toast("DSA subject created — timers will now auto-pick topics", "success");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const reset = async () => {
    if (!confirm("Restart the whole DSA journey? Time logs stay, statuses reset.")) return;
    try {
      await api("/api/dsa", { method: "POST", body: JSON.stringify({ action: "reset" }) });
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
          <h2 style={{ fontSize: 18, margin: 0 }}>DSA Journey</h2>
          <div style={{ flex: 1 }} />
          <button className="btn btn-sm" onClick={reset} title="Restart journey">
            <RotateCcw size={13} /> Restart
          </button>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 12px" }}>
          One topic at a time. Pick the <b>DSA</b> subject in Focus Timers and your current topic is selected automatically.
        </p>
        <div
          style={{
            height: 12, borderRadius: 99, background: "var(--surface-2)",
            border: "1px solid var(--border)", overflow: "hidden",
          }}
        >
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent-grad)", transition: "width .4s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <span className="badge">{done}/{total} topics · {pct}%</span>
          <span className="badge">
            <Clock size={12} /> {fmtMinutes(Math.round((data.total_sec || 0) / 60))} on DSA
          </span>
          {current && <span className="badge">Now: {current.title}</span>}
        </div>
      </div>

      {!hasDsaSubject && (
        <div className="card" style={{ borderColor: "var(--accent)" }}>
          <b style={{ fontSize: 14 }}>Step 1: create your DSA subject</b>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>
            Timers detect any subject with “DSA” in its name. Create it now and the journey plugs in automatically.
          </p>
          <button className="btn btn-primary btn-sm" onClick={createSubject}>
            <Plus size={14} /> Create “DSA” subject
          </button>
        </div>
      )}

      {done === total ? (
        <div className="card" style={{ textAlign: "center", padding: "32px 20px" }}>
          <Trophy size={34} style={{ color: "#f59e0b" }} />
          <h3 style={{ margin: "10px 0 4px" }}>Journey complete! 🏆</h3>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
            All {total} topics done. Time for contests — or restart and go deeper.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topics.map((t: any, i: number) => (
            <div
              key={t.key}
              className="card"
              style={{
                display: "flex", gap: 12, alignItems: "center", padding: "12px 14px",
                borderColor: t.status === "doing" ? "var(--accent)" : undefined,
              }}
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
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{t.blurb}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {t.seconds > 0 ? `${fmtMinutes(Math.round(t.seconds / 60))} logged` : "no time yet"}
                </div>
              </div>
              {t.status === "todo" && (
                <button className="btn btn-sm" onClick={() => setStatus(t.key, "doing")}>
                  <Play size={13} /> Start
                </button>
              )}
              {t.status === "doing" && (
                <button className="btn btn-sm btn-primary" onClick={() => setStatus(t.key, "done")}>
                  <Check size={13} /> Done
                </button>
              )}
              {t.status === "done" && (
                <button className="btn btn-sm" onClick={() => setStatus(t.key, "todo")}>
                  Reopen
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
