"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Play, Pause, RotateCcw, Timer as TimerIcon, Hourglass, Watch, Bell, BellOff,
  Coffee, Moon, Zap, Flag, BookOpen, Check, Route, History, Sparkles, Clock,
} from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { fmtClock } from "@/lib/utils";
import { useToast } from "@/components/Providers";

type Mode = "pomodoro" | "countdown" | "stopwatch";
type Phase = "work" | "short" | "long";

type Persisted = {
  mode: Mode;
  status: "idle" | "running" | "paused";
  subjectId: number | null;
  endsAt: number | null;
  remainingMs: number;
  durationMs: number;
  phase: Phase;
  round: number;
  startedAt: number | null;
  accumMs: number;
  laps: number[];
  topic: string;
};

const LS_KEY = "ff_timer_v1";

const DEFAULT_P: Persisted = {
  mode: "pomodoro", status: "idle", subjectId: null,
  endsAt: null, remainingMs: 25 * 60000, durationMs: 25 * 60000,
  phase: "work", round: 0, startedAt: null, accumMs: 0, laps: [], topic: "",
};

function beep(times = 3) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = i % 2 === 0 ? 880 : 660;
      const t = ctx.currentTime + i * 0.22;
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.start(t); o.stop(t + 0.21);
    }
  } catch {}
}

export default function TimersPage() {
  const { toast } = useToast();
  const { data: subjectsData } = useFetch("/api/subjects");
  const { data: settingsData } = useFetch("/api/settings");
  const { data: dsaData, reload: reloadDsa } = useFetch("/api/dsa");
  const { data: webData, reload: reloadWeb } = useFetch("/api/webdev");
  const subjects = subjectsData?.subjects || [];
  const settings = settingsData?.settings;

  const [mode, setMode] = useState<Mode>("pomodoro");
  const [p, setP] = useState<Persisted>(DEFAULT_P);
  const [now, setNow] = useState(Date.now());
  const [hydrated, setHydrated] = useState(false);
  const [cdMin, setCdMin] = useState("45");
  const [notif, setNotif] = useState(false);
  const completedRef = useRef(false);

  const dsaTopics: any[] = dsaData?.topics || [];
  const webTopics: any[] = webData?.topics || [];
  const selSubject = subjects.find((s: any) => s.id === p.subjectId);
  const isDsa = !!selSubject && /dsa/i.test(selSubject.name || "");
  const isWeb = !!selSubject && !isDsa && /web|delta|mern/i.test(selSubject.name || "");
  const isRevision = !!selSubject && !isDsa && !isWeb && /revis/i.test(selSubject.name || "");
  const currentDsaTitle = dsaTopics.find((t: any) => t.key === dsaData?.current)?.title || "";
  const currentWebTitle = webTopics.find((t: any) => t.key === webData?.current)?.title || "";
  const journeyTopics = isDsa ? dsaTopics : webTopics;
  const journeyCurrent = isDsa ? currentDsaTitle : currentWebTitle;
  const journeyEndpoint = isDsa ? "/api/dsa" : "/api/webdev";
  const revisionDueAll: any[] = [
    ...(dsaData?.revision_due || []).map((r: any) => ({ ...r, key: `dsa:${r.key}`, tag: "DSA" })),
    ...(webData?.revision_due || []).map((r: any) => ({ ...r, key: `web:${r.key}`, tag: "Web" })),
  ].sort((a, b) => (b.days_ago || 0) - (a.days_ago || 0));
  const activeKey = isDsa ? dsaData?.current : webData?.current;
  const selTopic = journeyTopics.find((t: any) => t.title === p.topic) || journeyTopics.find((t: any) => t.key === activeKey);
  const selLectures: any[] = selTopic?.lectures || [];
  const selLectureIdx: number = selTopic?.lecture_idx || 0;
  const selLecture = selLectureIdx < selLectures.length ? selLectures[selLectureIdx] : null;

  const pomoWork = (settings?.pomo_work ?? 25) * 60000;
  const pomoShort = (settings?.pomo_short ?? 5) * 60000;
  const pomoLong = (settings?.pomo_long ?? 15) * 60000;
  const pomoRounds = settings?.pomo_rounds ?? 4;
  const autoNext = settings?.auto_next !== 0;

  const persist = useCallback((next: Persisted) => {
    setP(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved: Persisted = { ...DEFAULT_P, ...JSON.parse(raw) };
        setMode(saved.mode);
        if (saved.status === "running" && saved.mode !== "stopwatch" && saved.endsAt && saved.endsAt <= Date.now()) {
          saved.remainingMs = 0;
          persist(saved);
          setHydrated(true);
          finishPhase(saved, true);
          return;
        }
        setP(saved);
        completedRef.current = false;
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    setNotif(typeof Notification !== "undefined" && Notification.permission === "granted");
  }, []);

  useEffect(() => {
    if (!hydrated || (!dsaData && !webData)) return;
    const want = isDsa ? currentDsaTitle : isWeb ? currentWebTitle : "";
    if ((isDsa || isWeb) && !p.topic && want) persist({ ...p, topic: want });
    else if (!isDsa && !isWeb && p.topic) persist({ ...p, topic: "" });
  }, [hydrated, dsaData, webData, isDsa, isWeb, p.subjectId]);

  useEffect(() => {
    if (p.status !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [p.status]);

  const isTimed = mode !== "stopwatch";
  const remaining = isTimed
    ? p.status === "running" && p.endsAt
      ? Math.max(0, p.endsAt - now)
      : p.remainingMs
    : 0;
  const swElapsed = mode === "stopwatch"
    ? p.accumMs + (p.status === "running" && p.startedAt ? now - p.startedAt : 0)
    : 0;

  const display = isTimed ? Math.ceil(remaining / 1000) : Math.floor(swElapsed / 1000);
  const pct = isTimed && p.durationMs > 0 ? 1 - remaining / p.durationMs : 0;

  const logSession = useCallback(
    async (durMs: number, type: string) => {
      const seconds = Math.round(durMs / 1000);
      if (seconds < 10) return;
      try {
        const r: any = await api("/api/sessions", {
          method: "POST",
          body: JSON.stringify({
            subject_id: p.subjectId,
            type,
            duration_sec: seconds,
            started_at: new Date(Date.now() - durMs).toISOString(),
            ended_at: new Date().toISOString(),
            notes: (type === "pomodoro" ? `Pomodoro (${p.phase === "work" ? "focus" : "break"})` : `${type} session`) + (p.topic && selLecture ? ` · ${selLecture.title}` : ""),
            topic: p.topic || "",
          }),
        }, { queueOffline: true });
        toast(r?._queued ? `No internet — ${fmtClock(seconds)} saved, will sync` : `Logged ${fmtClock(seconds)} of focus`, "success");
      } catch {}
    },
    [p.subjectId, p.phase, p.topic, selLecture?.title, toast]
  );

  const notify = useCallback((title: string, body: string) => {
    beep(3);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try { new Notification(title, { body, icon: "/favicon.ico" }); } catch {}
    }
  }, []);

  const finishPhase = useCallback(
    (cur: Persisted, wasAway = false) => {
      if (completedRef.current && !wasAway) return;
      completedRef.current = true;
      if (cur.mode === "pomodoro") {
        const finishedWork = cur.phase === "work";
        if (finishedWork) logSession(cur.durationMs, "pomodoro");
        const nextRound = finishedWork ? cur.round + 1 : cur.round;
        const nextPhase: Phase = finishedWork ? (nextRound % pomoRounds === 0 ? "long" : "short") : "work";
        const nextDur = nextPhase === "work" ? pomoWork : nextPhase === "short" ? pomoShort : pomoLong;
        notify(
          finishedWork ? "Focus block complete 🎉" : "Break over",
          finishedWork ? `Time for a ${nextPhase === "long" ? "long" : "short"} break.` : `Round ${nextRound + 1} — back to it!`
        );
        persist({
          ...cur, phase: nextPhase, round: nextRound, durationMs: nextDur, remainingMs: nextDur,
          endsAt: autoNext ? Date.now() + nextDur : null,
          status: autoNext ? "running" : "paused",
        });
        if (autoNext) completedRef.current = false;
      } else if (cur.mode === "countdown") {
        logSession(cur.durationMs, "timer");
        notify("Timer finished ⏰", `Great — ${fmtClock(Math.round(cur.durationMs / 1000))} logged.`);
        persist({ ...cur, status: "idle", remainingMs: cur.durationMs, endsAt: null });
      }
    },
    [logSession, notify, persist, pomoWork, pomoShort, pomoLong, pomoRounds, autoNext]
  );

  useEffect(() => {
    if (isTimed && p.status === "running" && p.endsAt && now >= p.endsAt && !completedRef.current) {
      finishPhase(p);
    }
  }, [now, isTimed, p, finishPhase]);

  useEffect(() => {
    if (p.status === "running") {
      const tag = mode === "stopwatch" ? `▶ ${fmtClock(display)}` : `⏳ ${fmtClock(display)}`;
      document.title = `${tag} — FocusFlow`;
    } else {
      document.title = "FocusFlow — Study Tracker";
    }
    return () => { document.title = "FocusFlow — Study Tracker"; };
  }, [display, p.status, mode]);

  const switchMode = (m: Mode) => {
    setMode(m);
    const next: Persisted = m === "pomodoro"
      ? { ...DEFAULT_P, mode: m, subjectId: p.subjectId, durationMs: pomoWork, remainingMs: pomoWork }
      : m === "countdown"
        ? { ...DEFAULT_P, mode: m, subjectId: p.subjectId, durationMs: Number(cdMin) * 60000, remainingMs: Number(cdMin) * 60000 }
        : { ...DEFAULT_P, mode: m, subjectId: p.subjectId, remainingMs: 0, durationMs: 0, laps: [] };
    persist(next);
  };

  const start = () => {
    completedRef.current = false;
    if (mode === "stopwatch") {
      persist({ ...p, status: "running", startedAt: Date.now() });
    } else {
      const dur = remaining > 0 ? remaining : p.durationMs;
      persist({ ...p, status: "running", endsAt: Date.now() + dur, remainingMs: dur });
    }
  };

  const pause = () => {
    if (mode === "stopwatch") {
      persist({ ...p, status: "paused", accumMs: p.accumMs + (p.startedAt ? Date.now() - p.startedAt : 0), startedAt: null });
    } else {
      const rem = p.endsAt ? Math.max(0, p.endsAt - Date.now()) : p.remainingMs;
      persist({ ...p, status: "paused", remainingMs: rem, endsAt: null });
    }
  };

  const reset = () => {
    if (mode === "stopwatch") {
      persist({ ...p, status: "idle", accumMs: 0, startedAt: null, laps: [] });
    } else {
      const dur = mode === "pomodoro" ? (p.phase === "work" ? pomoWork : p.phase === "short" ? pomoShort : pomoLong) : Number(cdMin) * 60000;
      persist({ ...p, status: "idle", remainingMs: dur, durationMs: dur, endsAt: null });
    }
  };

  const resetAll = () => persist({ ...DEFAULT_P, mode, subjectId: p.subjectId, durationMs: pomoWork, remainingMs: pomoWork });

  const setCountdown = (min: number) => {
    setCdMin(String(min));
    persist({ ...p, mode: "countdown", status: "idle", remainingMs: min * 60000, durationMs: min * 60000, endsAt: null });
  };

  const stopStopwatch = async () => {
    const total = p.accumMs + (p.startedAt ? Date.now() - p.startedAt : 0);
    persist({ ...p, status: "idle", accumMs: 0, startedAt: null, laps: [] });
    if (total >= 60000) {
      await logSession(total, "stopwatch");
    } else {
      toast("Under a minute — not logged", "info");
    }
  };

  const lap = () => {
    if (p.status !== "running") return;
    persist({ ...p, laps: [swElapsed, ...p.laps].slice(0, 20) });
  };

  const setSubject = (id: number | null) => {
    const s = subjects.find((x: any) => x.id === id);
    const nm = s?.name || "";
    const dsa = /dsa/i.test(nm);
    const web = !dsa && /web|delta|mern/i.test(nm);
    persist({ ...p, subjectId: id, topic: dsa ? p.topic || currentDsaTitle : web ? p.topic || currentWebTitle : "" });
  };

  const stepLecture = async (dir: 1 | -1) => {
    if (!selTopic || (!isDsa && !isWeb)) return;
    const next = Math.max(0, Math.min(selLectures.length, selLectureIdx + dir));
    try {
      await api(journeyEndpoint, { method: "PATCH", body: JSON.stringify({ key: selTopic.key, lecture_idx: next }) });
      await (isDsa ? reloadDsa() : reloadWeb());
    } catch (e: any) { toast(e.message, "error"); }
  };

  const requestNotif = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotif(perm === "granted");
    toast(perm === "granted" ? "Notifications on" : "Notifications blocked", perm === "granted" ? "success" : "error");
  };

  const R = 132, C = 2 * Math.PI * R;
  const doneCount = journeyTopics.filter((t: any) => t.status === "done").length;
  const totalCount = journeyTopics.length;
  const journeyPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const phaseMeta: Record<Phase, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    work: { label: "Focus", icon: <Zap size={14} />, color: "var(--accent)", bg: "var(--accent-soft)" },
    short: { label: "Short break", icon: <Coffee size={14} />, color: "#10b981", bg: "#10b98122" },
    long: { label: "Long break", icon: <Moon size={14} />, color: "#0ea5e9", bg: "#0ea5e922" },
  };

  if (!hydrated) return <div className="card" style={{ height: 520 }}><div className="skel" style={{ width: "100%", height: "100%", borderRadius: 24 }} /></div>;

  return (
    <div className="grid" style={{ gridTemplateColumns: "1.4fr 0.9fr", gap: 20, alignItems: "start" }}>
      <style>{`
        @media (max-width: 1100px){ .grid[style*="1.4fr"] { grid-template-columns: 1fr !important; } }
        .timer-hero {
          background: radial-gradient(600px 400px at 50% -10%, var(--accent-soft), transparent 70%), var(--surface);
          border: 1px solid var(--border);
          border-radius: 28px;
          box-shadow: var(--shadow), 0 0 0 1px rgba(255,255,255,0.04) inset;
          backdrop-filter: blur(20px);
          overflow: hidden;
          position: relative;
        }
        .timer-hero::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(135deg, var(--accent-soft) 0%, transparent 50%, transparent 100%);
          pointer-events: none;
        }
        .journey-card {
          background: linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%);
          border: 1px solid var(--border);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        .journey-card::before {
          content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: var(--accent-grad);
        }
        .journey-card.auto { border-color: color-mix(in srgb, var(--accent) 30%, var(--border)); box-shadow: 0 0 20px -8px var(--accent); }
        .subject-chip {
          position: relative;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .subject-chip:hover { transform: translateY(-1px); box-shadow: 0 4px 12px -4px var(--border); }
        .subject-chip.on {
          background: var(--accent-soft);
          border-color: var(--accent);
          color: var(--accent);
          box-shadow: 0 0 16px -6px var(--accent), 0 0 0 1px var(--accent) inset;
          transform: translateY(-1px);
        }
      `}</style>

      {/* LEFT — TIMER HERO */}
      <div className="timer-hero card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "28px 24px 24px", position: "relative" }}>
        {/* Mode Tabs — pill with icons */}
        <div className="timer-tabs" style={{ padding: 5, borderRadius: 16, gap: 4 }}>
          <button className={`timer-tab ${mode === "pomodoro" ? "active" : ""}`} onClick={() => switchMode("pomodoro")} style={{ borderRadius: 12, padding: "10px 18px", fontSize: 13.5, fontWeight: 700 }}>
            <Hourglass size={16} /> Pomodoro
          </button>
          <button className={`timer-tab ${mode === "countdown" ? "active" : ""}`} onClick={() => switchMode("countdown")} style={{ borderRadius: 12, padding: "10px 18px", fontSize: 13.5, fontWeight: 700 }}>
            <TimerIcon size={16} /> Timer
          </button>
          <button className={`timer-tab ${mode === "stopwatch" ? "active" : ""}`} onClick={() => switchMode("stopwatch")} style={{ borderRadius: 12, padding: "10px 18px", fontSize: 13.5, fontWeight: 700 }}>
            <Watch size={16} /> Stopwatch
          </button>
        </div>

        {/* Phase + Rounds — improved */}
        {mode === "pomodoro" && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 999, padding: "6px 14px" }}>
            <span className="badge" style={{ background: phaseMeta[p.phase].bg, color: phaseMeta[p.phase].color, border: `1px solid ${phaseMeta[p.phase].color}22`, fontWeight: 700 }}>
              {phaseMeta[p.phase].icon} {phaseMeta[p.phase].label}
            </span>
            <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {Array.from({ length: pomoRounds }).map((_, i) => (
                <span key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: i < p.round % pomoRounds || (p.round > 0 && p.round % pomoRounds === 0 && i < pomoRounds) ? "var(--accent)" : "var(--border)",
                  boxShadow: i < p.round ? "0 0 8px var(--accent)" : "none",
                  transition: "all 0.3s ease",
                }} />
              ))}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Round {Math.min(p.round + 1, pomoRounds)}/{pomoRounds}</span>
          </div>
        )}

        {/* Ring — Bigger, gradient, glow */}
        <div className="ring-wrap" style={{ width: 300, height: 300, position: "relative" }}>
          <svg width={300} height={300} style={{ transform: "rotate(-90deg)", position: "relative", zIndex: 1 }}>
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent-2)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Track */}
            <circle cx={150} cy={150} r={R} fill="none" stroke="var(--border)" strokeWidth={12} opacity={0.6} />
            {/* Progress */}
            {isTimed ? (
              <circle
                cx={150} cy={150} r={R} fill="none"
                stroke={mode === "pomodoro" ? phaseMeta[p.phase].color : "url(#ringGrad)"}
                strokeWidth={12} strokeLinecap="round" strokeDasharray={C}
                strokeDashoffset={C * (1 - Math.min(1, Math.max(0, pct)))}
                style={{ transition: "stroke-dashoffset 0.4s cubic-bezier(0.4,0,0.2,1)", filter: p.status === "running" ? "url(#glow)" : "none" }}
              />
            ) : (
              <circle cx={150} cy={150} r={R} fill="none" stroke="url(#ringGrad)" strokeWidth={12} strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - ((swElapsed / 60000) % 1))}
                style={{ transition: "stroke-dashoffset 0.3s linear", filter: p.status === "running" ? "url(#glow)" : "none" }}
              />
            )}
          </svg>
          {/* Center label — improved typography */}
          <div className="ring-label" style={{ zIndex: 2 }}>
            <div className="timer-display" style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, background: p.status === "running" ? "var(--accent-grad)" : "none", WebkitBackgroundClip: p.status === "running" ? "text" : "unset", backgroundClip: p.status === "running" ? "text" : "unset", color: p.status === "running" ? "transparent" : "var(--text)" }}>
              {mode === "stopwatch" ? fmtClock(Math.floor(swElapsed / 1000)) : fmtClock(display)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 8 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: p.status === "running" ? "#10b981" : p.status === "paused" ? "#f59e0b" : "var(--border)",
                boxShadow: p.status === "running" ? "0 0 8px #10b981" : "none",
                animation: p.status === "running" ? "pulseGlow 1.5s infinite" : "none",
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06 }}>
                {p.status === "running" ? (mode === "stopwatch" ? "Tracking" : `${phaseMeta[p.phase]?.label || "Focusing"} • ${Math.ceil(remaining/60000)}m left`) : p.status === "paused" ? "Paused" : "Ready to focus"}
              </span>
            </div>
            {p.status === "idle" && (
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, display: "flex", gap: 4, alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={12} /> Pick a subject below & start
              </div>
            )}
          </div>
        </div>

        {/* Controls — bigger, premium */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="iconbtn" onClick={reset} title="Reset" style={{ width: 44, height: 44, borderRadius: 14, background: "var(--surface-2)" }}><RotateCcw size={18} /></button>
          {mode === "stopwatch" ? (
            <>
              {p.status === "running" ? (
                <button className="btn btn-primary btn-lg pulse" onClick={pause} style={{ minWidth: 160, borderRadius: 16, padding: "14px 28px", fontSize: 16, fontWeight: 800, boxShadow: "var(--glow), 0 8px 24px -8px var(--accent)" }}><Pause size={20} /> Pause</button>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={start} style={{ minWidth: 160, borderRadius: 16, padding: "14px 28px", fontSize: 16, fontWeight: 800, background: "var(--accent-grad)", boxShadow: "var(--glow), 0 8px 24px -8px var(--accent)" }}><Play size={20} /> {p.accumMs > 0 ? "Resume" : "Start Focus"}</button>
              )}
              {(p.status === "running" || p.accumMs > 0) && (
                <>
                  <button className="btn btn-lg" onClick={lap} disabled={p.status !== "running"} style={{ borderRadius: 14 }}><Flag size={16} /> Lap</button>
                  <button className="btn btn-lg" onClick={stopStopwatch} style={{ borderRadius: 14, background: "var(--success)", color: "#fff", border: "none" }}><Check size={16} /> Done</button>
                </>
              )}
            </>
          ) : (
            p.status === "running" ? (
              <button className="btn btn-primary btn-lg pulse" onClick={pause} style={{ minWidth: 160, borderRadius: 16, padding: "14px 28px", fontSize: 16, fontWeight: 800, boxShadow: "var(--glow)" }}><Pause size={20} /> Pause</button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={start} style={{ minWidth: 160, borderRadius: 16, padding: "14px 28px", fontSize: 16, fontWeight: 800, background: "var(--accent-grad)", boxShadow: "var(--glow), 0 8px 24px -8px var(--accent)" }}><Play size={20} /> {p.status === "paused" ? "Resume" : "Start Focus"}</button>
            )
          )}
        </div>

        {mode === "countdown" && p.status === "idle" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "10px 14px" }}>
            {[15, 25, 45, 60, 90, 120].map((m) => (
              <button key={m} className={`chip subject-chip ${Number(cdMin) === m ? "on" : ""}`} onClick={() => setCountdown(m)} style={{ fontWeight: 700 }}>{m}m</button>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
              <input className="input" type="number" min={1} max={600} value={cdMin} onChange={(e) => setCountdown(Math.max(1, Math.min(600, Number(e.target.value) || 1)))} style={{ width: 72, textAlign: "center", borderRadius: 10, fontWeight: 700 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>min</span>
            </div>
          </div>
        )}

        {/* Subject — premium chips */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={14} style={{ color: "var(--muted)" }} />
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.08, color: "var(--muted)" }}>Focus Subject</span>
            {selSubject && <span className="badge" style={{ marginLeft: "auto", background: `${selSubject.color}22`, color: selSubject.color, border: `1px solid ${selSubject.color}33` }}>{selSubject.name}</span>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className={`chip subject-chip ${p.subjectId === null ? "on" : ""}`} onClick={() => setSubject(null)} style={{ borderRadius: 12, padding: "8px 14px", fontWeight: 600 }}>No subject</button>
            {subjects.map((s: any) => (
              <button key={s.id} className={`chip subject-chip ${p.subjectId === s.id ? "on" : ""}`} onClick={() => setSubject(s.id)} style={{ borderRadius: 12, padding: "8px 14px", fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}`, flexShrink: 0 }} /> {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Journey — premium card with progress */}
        {(isDsa || isWeb) && (
          <div className={`journey-card ${p.topic === journeyCurrent && journeyCurrent ? "auto" : ""}`} style={{ width: "100%", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)" }}><Route size={16} /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, display: "flex", gap: 8, alignItems: "center" }}>
                    Journey topic {p.topic === journeyCurrent && journeyCurrent ? <span className="badge" style={{ background: "#10b98122", color: "#10b981", fontSize: 11 }}>Auto ✓</span> : <span className="badge" style={{ background: "var(--surface-2)", color: "var(--muted)", fontSize: 11 }}>Manual</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ width: 60, height: 4, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}><div style={{ width: `${journeyPct}%`, height: "100%", background: "var(--accent-grad)", borderRadius: 99 }} /></div>
                    {doneCount}/{totalCount} done • {journeyPct}% • {totalCount - doneCount} left
                  </div>
                </div>
              </div>
              <a href={isDsa ? "/dsa" : "/webdev"} style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", background: "var(--accent-soft)", padding: "6px 10px", borderRadius: 8, whiteSpace: "nowrap" }}>Open journey →</a>
            </div>

            <select className="select" style={{ width: "100%", borderRadius: 12, padding: "12px 14px", fontWeight: 600, fontSize: 14 }} value={p.topic} onChange={(e) => persist({ ...p, topic: e.target.value })}>
              <option value="">No topic — pick from journey</option>
              {journeyTopics.map((t: any) => (
                <option key={t.key} value={t.title}>{t.status === "done" ? "✓ " : t.status === "revising" ? "↻ " : "○ "}{t.title}</option>
              ))}
            </select>

            {selTopic && selLectures.length > 0 && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px" }}>
                <button className="iconbtn" style={{ width: 32, height: 32, borderRadius: 10 }} onClick={() => stepLecture(-1)} disabled={selLectureIdx === 0}>‹</button>
                <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
                  {selLecture ? (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06 }}>Lec {selLectureIdx + 1}/{selLectures.length}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selLecture.title}</div>
                    </>
                  ) : (
                    <span className="badge" style={{ background: "#10b98122", color: "#10b981" }}>Module complete ✓</span>
                  )}
                </div>
                <button className="iconbtn" style={{ width: 32, height: 32, borderRadius: 10 }} onClick={() => stepLecture(1)} disabled={selLectureIdx >= selLectures.length}>›</button>
              </div>
            )}
          </div>
        )}

        {isRevision && (
          <div className="journey-card" style={{ width: "100%", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f59e0b22", display: "grid", placeItems: "center", color: "#f59e0b" }}><History size={16} /></div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>Revise Due Topics</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{revisionDueAll.length} topics need revision • most overdue first</div>
              </div>
              {revisionDueAll.length === 0 && <span className="badge" style={{ marginLeft: "auto", background: "#10b98122", color: "#10b981" }}>All caught up ✅</span>}
            </div>
            {revisionDueAll.length > 0 && (
              <select className="select" style={{ width: "100%", borderRadius: 12, padding: "12px 14px", fontWeight: 600 }} value="" onChange={(e) => { if (e.target.value) persist({ ...p, topic: e.target.value }); }}>
                <option value="">Pick a due topic…</option>
                {revisionDueAll.map((r: any) => (
                  <option key={r.key} value={r.title}>{r.tag} · {r.title} · {r.days_ago}d ago</option>
                ))}
              </select>
            )}
            <a href="/revision" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textAlign: "center", background: "var(--accent-soft)", padding: "8px", borderRadius: 10 }}>Open revision → {revisionDueAll.length} due</a>
          </div>
        )}
      </div>

      {/* RIGHT — SIDE PANEL — Improved cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 }}>
        <div className="card" style={{ borderRadius: 20, padding: 20, background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)" }}><Clock size={18} /></div>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 800 }}>Background mode</h2>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.06 }}>Always tracking</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>
            Timers keep counting even if you switch tabs, minimise, or reload — time is tracked by the clock, not the screen. Perfect for your side-by-side video study.
          </p>
          <button className={`btn ${notif ? "" : "btn-primary"} btn-block`} onClick={requestNotif} style={{ borderRadius: 12, fontWeight: 700 }}>
            {notif ? <><Bell size={16} /> Notifications enabled ✓</> : <><BellOff size={16} /> Enable notifications</>}
          </button>
        </div>

        {mode === "pomodoro" && (
          <div className="card" style={{ borderRadius: 20, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}><TimerIcon size={16} style={{ color: "var(--accent)" }} /> Pomodoro Cycle</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {[
                { label: "Focus", val: `${settings?.pomo_work ?? 25}m`, color: "var(--accent)" },
                { label: "Short break", val: `${settings?.pomo_short ?? 5}m`, color: "#10b981" },
                { label: "Long break", val: `${settings?.pomo_long ?? 15}m`, color: "#0ea5e9" },
                { label: "Rounds", val: `${pomoRounds}`, color: "var(--text)" },
              ].map(c => (
                <div key={c.label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06 }}>{c.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: c.color, marginTop: 4 }}>{c.val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, padding: "8px 12px", background: "var(--surface-2)", borderRadius: 10, fontSize: 12.5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: autoNext ? "#10b981" : "var(--muted)" }} />
              Auto-advance <b>{autoNext ? "on" : "off"}</b> • Change in <a href="/settings" style={{ color: "var(--accent)", fontWeight: 700 }}>Settings</a>
            </div>
            <button className="btn btn-sm btn-block" style={{ marginTop: 12, borderRadius: 10 }} onClick={resetAll}><RotateCcw size={13} /> Reset cycle</button>
          </div>
        )}

        {mode === "stopwatch" && p.laps.length > 0 && (
          <div className="card" style={{ borderRadius: 20, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Laps • {p.laps.length}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
              {p.laps.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>Lap {p.laps.length - i}</span>
                  <b style={{ fontVariantNumeric: "tabular-nums", fontWeight: 800 }}>{fmtClock(Math.floor(l / 1000))}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ borderRadius: 20, padding: 20, background: "var(--surface-2)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}><BookOpen size={16} style={{ color: "var(--accent)" }} /> How logging works</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "🍅", text: "Completed pomodoro focus blocks log automatically." },
              { icon: "⏱️", text: "Finished countdowns log their full duration." },
              { icon: "✅", text: "Press Done on the stopwatch to log elapsed time." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span dangerouslySetInnerHTML={{ __html: item.text.replace("Done", "<b style='color:var(--text)'>Done</b>").replace("automatically", "<b style='color:var(--text)'>automatically</b>") }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
