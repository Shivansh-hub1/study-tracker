"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Square,
  Timer,
  Sparkles,
  Calendar,
  Flame,
  Bed,
  FileText,
  ChevronRight,
  Trophy,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";
import { SPRINT_PHASES, SPRINT_TASKS, SprintTask, SubjectCode } from "@/lib/sprint-tasks";
import { useFetch, api } from "@/lib/client";
import { playSound } from "@/lib/sounds";
import { useToast } from "@/components/Providers";

const SUBJECT_COLORS: Record<SubjectCode, { bg: string; text: string; border: string }> = {
  P: { bg: "#0284c718", text: "#38bdf8", border: "#0284c744" },
  C: { bg: "#05966918", text: "#34d399", border: "#05966944" },
  M: { bg: "#7c3aed18", text: "#a78bfa", border: "#7c3aed44" },
  Night: { bg: "#d9770618", text: "#fbbf24", border: "#d9770644" },
  Break: { bg: "#e11d4818", text: "#fb7185", border: "#e11d4844" },
  Mock: { bg: "#6366f118", text: "#818cf8", border: "#6366f144" },
};

export default function TasksPage() {
  const { data: taskData, setData: setTaskData, reload: reloadTasks } = useFetch("/api/tasks");
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<number | "bed" | "mock">(1);
  const completedIds = new Set<string>(taskData?.completedTaskIds || []);
  const activeDay = Number(taskData?.activeDay ?? 1);
  const mode = taskData?.mode ?? "standard";

  const totalTasks = SPRINT_TASKS.length;
  const completedCount = completedIds.size;
  const overallPct = Math.round((completedCount / totalTasks) * 100);

  const toggleTask = async (taskId: string) => {
    const isNowDone = !completedIds.has(taskId);
    playSound(isNowDone ? "success" : "pop");

    // Optimistic UI update
    const nextCompleted = isNowDone
      ? [...(taskData?.completedTaskIds || []), taskId]
      : (taskData?.completedTaskIds || []).filter((id: string) => id !== taskId);

    setTaskData((prev: any) => ({ ...prev, completedTaskIds: nextCompleted }));

    try {
      await api("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ taskId, completed: isNowDone }),
      });
      if (isNowDone) toast("Task completed! Keep the momentum.", "success");
    } catch {
      toast("Failed to update task", "error");
      reloadTasks();
    }
  };

  const setActiveSprintDay = async (dayNum: number) => {
    try {
      playSound("pop");
      await api("/api/tasks", {
        method: "PATCH",
        body: JSON.stringify({ activeDay: dayNum }),
      });
      setTaskData((prev: any) => ({ ...prev, activeDay: dayNum }));
      toast(`Active focus set to Day ${dayNum}`, "success");
    } catch {
      toast("Failed to set active day", "error");
    }
  };

  const setSprintMode = async (newMode: "standard" | "bed" | "mock") => {
    try {
      playSound("pop");
      await api("/api/tasks", {
        method: "PATCH",
        body: JSON.stringify({ mode: newMode }),
      });
      setTaskData((prev: any) => ({ ...prev, mode: newMode }));
      if (newMode === "bed") {
        setActiveTab("bed");
        toast("Bed Recovery Mode activated. Focus on gentle rest.", "info");
      } else if (newMode === "mock") {
        setActiveTab("mock");
        toast("Jan Mock Mode activated. Full shifts only.", "info");
      } else {
        setActiveTab(1);
        toast("Standard 42-Day Sprint activated.", "success");
      }
    } catch {
      toast("Failed to update mode", "error");
    }
  };

  // Active day tasks
  const todayTasks = SPRINT_TASKS.filter((t) => t.day === activeDay);
  const todayDone = todayTasks.filter((t) => completedIds.has(t.id)).length;

  return (
    <div className="grid" style={{ gap: 24 }}>
      {/* Hero Sprint Header */}
      <div
        className="card"
        style={{
          padding: "24px",
          background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)",
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                JEE 42-DAY SPRINT
              </span>
              <span className="badge" style={{ background: "#10b98122", color: "#10b981" }}>
                Target: 115–135 Marks (KNIT CSE)
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
              Daily Study Tasks & Sprint Roadmap
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 4, marginBottom: 0 }}>
              Don&apos;t think, just follow the daily order. 1 line = 1 day&apos;s focused work per subject.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setSprintMode("standard")}
              className={`btn btn-sm ${mode === "standard" ? "btn-primary" : ""}`}
            >
              <Calendar size={14} /> 42-Day Sprint
            </button>
            <button
              onClick={() => setSprintMode("bed")}
              className={`btn btn-sm ${mode === "bed" ? "btn-primary" : ""}`}
              style={mode === "bed" ? { background: "#f97316", borderColor: "#f97316" } : {}}
            >
              <Bed size={14} /> Bed Recovery Mode
            </button>
            <button
              onClick={() => setSprintMode("mock")}
              className={`btn btn-sm ${mode === "mock" ? "btn-primary" : ""}`}
              style={mode === "mock" ? { background: "#8b5cf6", borderColor: "#8b5cf6" } : {}}
            >
              <FileText size={14} /> Jan Mocks
            </button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
            <span>
              Overall Progress: {completedCount} of {totalTasks} tasks completed
            </span>
            <span style={{ color: "var(--accent)" }}>{overallPct}% Finished</span>
          </div>
          <div style={{ width: "100%", height: 8, background: "var(--surface)", borderRadius: 9999, overflow: "hidden", border: "1px solid var(--border)" }}>
            <div
              style={{
                width: `${overallPct}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--accent) 0%, #10b981 100%)",
                borderRadius: 9999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Mode Alert Notice (Bed Mode / Mock Mode) */}
      {mode === "bed" && (
        <div
          className="card"
          style={{
            background: "color-mix(in srgb, #f97316 12%, var(--surface))",
            border: "1px solid #f9731688",
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 20px",
          }}
        >
          <Bed size={28} style={{ color: "#f97316", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14.5, color: "#f97316" }}>
              BED DAILY TARGET ACTIVE (Surgery Recovery Mode)
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              Stop normal timetable. Study lying down on your phone in 30-min slots only. No study table, no full mocks. Listen strictly to your doctor for rest, belt, and posture.
            </div>
          </div>
        </div>
      )}

      {/* Active Day Spotlight Card */}
      {mode === "standard" && (
        <div
          className="card"
          style={{
            border: "2px solid var(--accent)",
            padding: 20,
            background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, var(--surface)) 0%, var(--surface) 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--accent)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                {activeDay}
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>
                  Today&apos;s Active Focus: Day {activeDay}
                </h2>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                  {todayDone === todayTasks.length ? (
                    <span style={{ color: "#10b981", fontWeight: 700 }}>
                      🎉 Day {activeDay} Completed! You crushed every subject!
                    </span>
                  ) : (
                    `${todayDone} of ${todayTasks.length} tasks done for today`
                  )}
                </div>
              </div>
            </div>

            {todayDone === todayTasks.length && activeDay < 42 && (
              <button
                onClick={() => setActiveSprintDay(activeDay + 1)}
                className="btn btn-primary"
                style={{ fontSize: 13 }}
              >
                Advance to Day {activeDay + 1} <ArrowRight size={14} />
              </button>
            )}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {todayTasks.map((task) => {
              const isDone = completedIds.has(task.id);
              const styling = SUBJECT_COLORS[task.code] || SUBJECT_COLORS.P;
              return (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 14px",
                    background: isDone ? "var(--surface-2)" : "var(--surface)",
                    borderRadius: 10,
                    border: `1px solid ${isDone ? "var(--border)" : styling.border}`,
                    transition: "all 0.15s ease",
                    opacity: isDone ? 0.75 : 1,
                  }}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      marginTop: 2,
                      color: isDone ? "#10b981" : "var(--muted)",
                    }}
                    aria-label="Toggle task"
                  >
                    {isDone ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                      <span
                        className="badge"
                        style={{
                          background: styling.bg,
                          color: styling.text,
                          border: `1px solid ${styling.border}`,
                          fontSize: 10.5,
                          fontWeight: 700,
                        }}
                      >
                        {task.subject}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          textDecoration: isDone ? "line-through" : "none",
                          color: isDone ? "var(--muted)" : "var(--text)",
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.4 }}>
                      {task.details}
                    </div>
                  </div>

                  <Link
                    href={`/timer?task=${encodeURIComponent(task.title)}&subject=${encodeURIComponent(task.subject)}`}
                    className="btn btn-sm"
                    style={{ fontSize: 11, padding: "5px 9px", flexShrink: 0, textDecoration: "none" }}
                    title="Launch timer with this task"
                  >
                    <Timer size={13} /> Focus
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Phase Navigation Tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
        {SPRINT_PHASES.map((ph) => {
          const isSelected = activeTab === ph.id;
          return (
            <button
              key={ph.id}
              onClick={() => { playSound("click"); setActiveTab(ph.id); }}
              className={`btn btn-sm ${isSelected ? "btn-primary" : ""}`}
              style={{
                whiteSpace: "nowrap",
                fontSize: 12,
                borderRadius: 8,
                padding: "8px 12px",
                borderColor: isSelected ? ph.color : "var(--border)",
              }}
            >
              {ph.title.split(":")[0]} ({ph.days})
            </button>
          );
        })}
      </div>

      {/* Selected Phase View */}
      {(() => {
        const currentPhase = SPRINT_PHASES.find((p) => p.id === activeTab);
        const phaseTasks = SPRINT_TASKS.filter((t) => t.phaseId === activeTab);

        // Group tasks by Day
        const daysMap = new Map<number | string, SprintTask[]>();
        for (const t of phaseTasks) {
          const list = daysMap.get(t.day) || [];
          list.push(t);
          daysMap.set(t.day, list);
        }

        return (
          <div className="grid" style={{ gap: 16 }}>
            <div
              className="card"
              style={{
                borderLeft: `4px solid ${currentPhase?.color || "var(--accent)"}`,
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>
                    {currentPhase?.title}
                  </h3>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                    {currentPhase?.subtitle}
                  </div>
                </div>
                {currentPhase?.note && (
                  <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)", fontSize: 11 }}>
                    {currentPhase.note}
                  </span>
                )}
              </div>
            </div>

            {/* Days Cards */}
            {Array.from(daysMap.entries()).map(([dayVal, tasks]) => {
              const isCurrentDay = dayVal === activeDay && mode === "standard";
              const dayDone = tasks.filter((t) => completedIds.has(t.id)).length;
              const isAllDone = dayDone === tasks.length;

              return (
                <div
                  key={String(dayVal)}
                  className="card"
                  style={{
                    padding: 18,
                    border: isCurrentDay ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: isAllDone ? "color-mix(in srgb, #10b981 5%, var(--surface))" : "var(--surface)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        className="badge"
                        style={{
                          background: isCurrentDay ? "var(--accent)" : "var(--surface-2)",
                          color: isCurrentDay ? "#fff" : "var(--text)",
                          fontWeight: 800,
                          fontSize: 12,
                          padding: "3px 10px",
                        }}
                      >
                        {typeof dayVal === "number" ? `DAY ${dayVal}` : dayVal.toUpperCase()}
                      </span>
                      {isCurrentDay && (
                        <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)", fontSize: 11 }}>
                          Active Day
                        </span>
                      )}
                      {isAllDone && (
                        <span className="badge" style={{ background: "#10b98122", color: "#10b981", fontSize: 11 }}>
                          All Done ✨
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        {dayDone} / {tasks.length} Done
                      </span>
                      {typeof dayVal === "number" && dayVal !== activeDay && (
                        <button
                          onClick={() => setActiveSprintDay(dayVal)}
                          className="btn btn-sm"
                          style={{ fontSize: 11, padding: "4px 8px" }}
                        >
                          Set as Today
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    {tasks.map((task) => {
                      const isDone = completedIds.has(task.id);
                      const styling = SUBJECT_COLORS[task.code] || SUBJECT_COLORS.P;
                      return (
                        <div
                          key={task.id}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "10px 12px",
                            background: isDone ? "var(--surface-2)" : "var(--surface)",
                            borderRadius: 8,
                            border: `1px solid ${isDone ? "var(--border)" : styling.border}`,
                            opacity: isDone ? 0.65 : 1,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <button
                            onClick={() => toggleTask(task.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              marginTop: 2,
                              color: isDone ? "#10b981" : "var(--muted)",
                            }}
                            aria-label="Toggle task"
                          >
                            {isDone ? <CheckSquare size={18} /> : <Square size={18} />}
                          </button>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                              <span
                                className="badge"
                                style={{
                                  background: styling.bg,
                                  color: styling.text,
                                  border: `1px solid ${styling.border}`,
                                  fontSize: 10,
                                  padding: "1px 6px",
                                }}
                              >
                                {task.subject}
                              </span>
                              <span
                                style={{
                                  fontWeight: 600,
                                  fontSize: 13.5,
                                  textDecoration: isDone ? "line-through" : "none",
                                  color: isDone ? "var(--muted)" : "var(--text)",
                                }}
                              >
                                {task.title}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>
                              {task.details}
                            </div>
                          </div>

                          <Link
                            href={`/timer?task=${encodeURIComponent(task.title)}&subject=${encodeURIComponent(task.subject)}`}
                            className="btn btn-sm"
                            style={{ fontSize: 11, padding: "4px 8px", flexShrink: 0, textDecoration: "none" }}
                            title="Focus timer"
                          >
                            <Timer size={12} />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
