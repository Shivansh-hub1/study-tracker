"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Pause, RotateCcw, Timer as TimerIcon, Hourglass, Watch, Bell, BellOff,
  Coffee, Moon, Zap, Flag, BookOpen, Check,
} from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { fmtClock, pad } from "@/lib/utils";
import { useToast } from "@/components/Providers";

type Mode = "pomodoro" | "countdown" | "stopwatch";
type Phase = "work" | "short" | "long";

type Persisted = {
  mode: Mode;
  status: "idle" | "running" | "paused";
  subjectId: number | null;
  // countdown/pomo
  endsAt: number | null; // epoch ms when current phase ends (running)
  remainingMs: number; // remaining when paused
  durationMs: number; // total for current phase
  phase: Phase;
  round: number; // completed work rounds in the current cycle
  // stopwatch
  startedAt: number | null; // epoch ms when stopwatch (re)started
  accumMs: number; // accumulated before current run
  laps: number[];
};

const LS_KEY = "ff_timer_v1";

const DEFAULT_P: Persisted = {
  mode: "pomodoro", status: "idle", subjectId: null,
  endsAt: null, remainingMs: 25 * 60000, durationMs: 25 * 60000,
  phase: "work", round: 0, startedAt: null, accumMs: 0, laps: [],
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
  const subjects = subjectsData?.subjects || [];
  const settings = settingsData?.settings;

  const [mode, setMode] = useState<Mode>("pomodoro");
  const [p, setP] = useState<Persisted>(DEFAULT_P);
  const [now, setNow] = useState(Date.now());
  const [hydrated, setHydrated] = useState(false);
  const [cdMin, setCdMin] = useState("45");
  const [notif, setNotif] = useState(false);
  const completedRef = useRef(false);

  const pomoWork = (settings?.pomo_work ?? 25) * 60000;
  const pomoShort = (settings?.pomo_short ?? 5) * 60000;
  const pomoLong = (settings?.pomo_long ?? 15) * 60000;
  const pomoRounds = settings?.pomo_rounds ?? 4;
  const autoNext = settings?.auto_next !== 0;

  /* -------- persistence -------- */
  const persist = useCallback((next: Persisted) => {
    setP(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  }, []);

  /* -------- hydrate from localStorage on mount; catch up background time -------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved: Persisted = { ...DEFAULT_P, ...JSON.parse(raw) };
        setMode(saved.mode);
        if (saved.status === "running" && saved.mode !== "stopwatch" && saved.endsAt && saved.endsAt <= Date.now()) {
          // finished while away — complete it now
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNotif(typeof Notification !== "undefined" && Notification.permission === "granted");
  }, []);

  /* -------- tick -------- */
  useEffect(() => {
    if (p.status !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [p.status]);

  /* -------- derived display values -------- */
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

  /* -------- completion -------- */
  const logSession = useCallback(
    async (durMs: number, type: string) => {
      const seconds = Math.round(durMs / 1000);
      if (seconds < 10) return;
      try {
        await api("/api/sessions", {
          method: "POST",
          body: JSON.stringify({
            subject_id: p.subjectId,
            type,
            duration_sec: seconds,
            started_at: new Date(Date.now() - durMs).toISOString(),
            ended_at: new Date().toISOString(),
            notes: type === "pomodoro" ? `Pomodoro (${p.phase === "work" ? "focus" : "break"})` : `${type} session`,
          }),
        });
        toast(`Logged ${fmtClock(seconds)} of focus time`, "success");
      } catch { /* offline-safe: silently drop */ }
    },
    [p.subjectId, p.phase, toast]
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

  /* -------- detect countdown completion on tick -------- */
  useEffect(() => {
    if (isTimed && p.status === "running" && p.endsAt && now >= p.endsAt && !completedRef.current) {
      finishPhase(p);
    }
  }, [now, isTimed, p, finishPhase]);

  /* -------- document.title ticker -------- */
  useEffect(() => {
    if (p.status === "running") {
      const tag = mode === "stopwatch" ? `▶ ${fmtClock(display)}` : `⏳ ${fmtClock(display)}`;
      document.title = `${tag} — FocusFlow`;
    } else {
      document.title = "FocusFlow — Study Tracker";
    }
    return () => { document.title = "FocusFlow — Study Tracker"; };
  }, [display, p.status, mode]);

  /* -------- controls -------- */
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

  const setSubject = (id: number | null) => persist({ ...p, subjectId: id });

  const requestNotif = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotif(perm === "granted");
    toast(perm === "granted" ? "Notifications on — you'll be pinged when phases end" : "Notifications blocked by browser", perm === "granted" ? "success" : "error");
  };

  /* -------- ring geometry -------- */
  const R = 118, C = 2 * Math.PI * R;

  const phaseMeta: Record<Phase, { label: string; icon: React.ReactNode; color: string }> = {
    work: { label: "Focus", icon: <Zap size={15} />, color: "var(--accent)" },
    short: { label: "Short break", icon: <Coffee size={15} />, color: "#10b981" },
    long: { label: "Long break", icon: <Moon size={15} />, color: "#0ea5e9" },
  };

  if (!hydrated) return <div className="card" style={{ height: 480 }}><div className="skel" style={{ width: "100%", height: "100%" }} /></div>;

  return (
    <div className="grid" style={{ gridTemplateColumns: "1.35fr 1fr" }}>
      <style>{`@media (max-width: 1000px){ .grid[style*="1.35fr"] { grid-template-columns: 1fr !important; } }`}</style>
      <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, paddingTop: 26, paddingBottom: 26 }}>
        <div className="timer-tabs">
          <button className={`timer-tab ${mode === "pomodoro" ? "active" : ""}`} onClick={() => switchMode("pomodoro")}><Hourglass size={15} /> Pomodoro</button>
          <button className={`timer-tab ${mode === "countdown" ? "active" : ""}`} onClick={() => switchMode("countdown")}><TimerIcon size={15} /> Timer</button>
          <button className={`timer-tab ${mode === "stopwatch" ? "active" : ""}`} onClick={() => switchMode("stopwatch")}><Watch size={15} /> Stopwatch</button>
        </div>

        {mode === "pomodoro" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="badge" style={{ background: `${phaseMeta[p.phase].color}22`, color: phaseMeta[p.phase].color }}>
              {phaseMeta[p.phase].icon} {phaseMeta[p.phase].label}
            </span>
            <span style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: pomoRounds }).map((_, i) => (
                <span key={i} style={{
                  width: 9, height: 9, borderRadius: "50%",
                  background: i < p.round % pomoRounds || (p.round > 0 && p.round % pomoRounds === 0 && p.round > 0 && i < pomoRounds) ? "var(--accent)" : "var(--border)",
                  opacity: i < ((p.round - 1) % pomoRounds) + 1 && p.round > 0 ? 1 : 0.8,
                  boxShadow: i < p.round ? "0 0 6px var(--accent)" : "none",
                }} />
              ))}
            </span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Round {Math.min(p.round + 1, pomoRounds)}/{pomoRounds}</span>
          </div>
        )}

        {/* Ring */}
        <div className="ring-wrap" style={{ width: 260, height: 260 }}>
          <svg width={260} height={260} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={130} cy={130} r={R} fill="none" stroke="var(--border)" strokeWidth={10} />
            {isTimed && (
              <circle
                cx={130} cy={130} r={R} fill="none"
                stroke={mode === "pomodoro" ? phaseMeta[p.phase].color : "var(--accent)"}
                strokeWidth={10} strokeLinecap="round" strokeDasharray={C}
                strokeDashoffset={C * (1 - Math.min(1, Math.max(0, pct)))}
                style={{ transition: "stroke-dashoffset 0.3s linear", filter: "drop-shadow(0 0 8px currentColor)" }}
              />
            )}
            {!isTimed && (
              <circle cx={130} cy={130} r={R} fill="none" stroke="var(--accent)" strokeWidth={10} strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - ((swElapsed / 60000) % 1))}
                style={{ transition: "stroke-dashoffset 0.3s linear", filter: "drop-shadow(0 0 8px var(--accent))" }}
              />
            )}
          </svg>
          <div className="ring-label">
            <div className="timer-display" style={{ fontSize: 52 }}>{mode === "stopwatch" ? fmtClock(Math.floor(swElapsed / 1000)) : fmtClock(display)}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              {p.status === "running" ? (mode === "stopwatch" ? "tracking…" : "until phase ends") : p.status === "paused" ? "paused" : "ready"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="iconbtn" onClick={reset} title="Reset current"><RotateCcw size={17} /></button>
          {mode === "stopwatch" ? (
            <>
              {p.status === "running" ? (
                <button className="btn btn-primary btn-lg pulse" onClick={pause} style={{ minWidth: 150 }}><Pause size={18} /> Pause</button>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={start} style={{ minWidth: 150 }}><Play size={18} /> {p.accumMs > 0 ? "Resume" : "Start"}</button>
              )}
              {(p.status === "running" || p.accumMs > 0) && (
                <>
                  <button className="btn btn-lg" onClick={lap} disabled={p.status !== "running"}><Flag size={16} /> Lap</button>
                  <button className="btn btn-lg btn-danger" onClick={stopStopwatch}><Check size={16} /> Done</button>
                </>
              )}
            </>
          ) : (
            p.status === "running" ? (
              <button className="btn btn-primary btn-lg pulse" onClick={pause} style={{ minWidth: 150 }}><Pause size={18} /> Pause</button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={start} style={{ minWidth: 150 }}><Play size={18} /> {p.status === "paused" ? "Resume" : "Start"}</button>
            )
          )}
        </div>

        {mode === "countdown" && p.status === "idle" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
            {[15, 25, 45, 60, 90, 120].map((m) => (
              <button key={m} className={`chip ${Number(cdMin) === m ? "on" : ""}`} onClick={() => setCountdown(m)}>{m}m</button>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                className="input" type="number" min={1} max={600} value={cdMin}
                onChange={(e) => setCountdown(Math.max(1, Math.min(600, Number(e.target.value) || 1)))}
                style={{ width: 80, textAlign: "center" }}
              />
              <span style={{ fontSize: 13, color: "var(--muted)" }}>min</span>
            </div>
          </div>
        )}

        {/* Subject link */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginTop: 4 }}>
          <BookOpen size={15} style={{ color: "var(--muted)" }} />
          <button className={`chip ${p.subjectId === null ? "on" : ""}`} onClick={() => setSubject(null)}>No subject</button>
          {subjects.map((s: any) => (
            <button key={s.id} className={`chip ${p.subjectId === s.id ? "on" : ""}`} onClick={() => setSubject(s.id)}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}` }} /> {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 10 }}>Background mode</h3>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>
            Timers keep counting even if you switch tabs, minimise the window, or reload the page — time is tracked by the clock, not the screen.
            Turn on notifications to be alerted when a phase ends.
          </p>
          <button className={`btn ${notif ? "" : "btn-primary"} btn-block`} onClick={requestNotif}>
            {notif ? <><Bell size={15} /> Notifications enabled</> : <><BellOff size={15} /> Enable notifications</>}
          </button>
        </div>

        {mode === "pomodoro" && (
          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Pomodoro settings</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, fontSize: 13 }}>
              <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 12px" }}>
                <div className="stat-label">Focus</div><b>{settings?.pomo_work ?? 25} min</b>
              </div>
              <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 12px" }}>
                <div className="stat-label">Short break</div><b>{settings?.pomo_short ?? 5} min</b>
              </div>
              <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 12px" }}>
                <div className="stat-label">Long break</div><b>{settings?.pomo_long ?? 15} min</b>
              </div>
              <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "10px 12px" }}>
                <div className="stat-label">Rounds</div><b>{pomoRounds}</b>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10 }}>
              Auto-advance is <b>{autoNext ? "on" : "off"}</b>. Change these in <a href="/settings" style={{ color: "var(--accent)" }}>Settings</a>.
            </p>
            <button className="btn btn-sm btn-block" style={{ marginTop: 10 }} onClick={resetAll}><RotateCcw size={13} /> Reset cycle</button>
          </div>
        )}

        {mode === "stopwatch" && p.laps.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Laps</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
              {p.laps.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "7px 10px", background: "var(--surface-2)", borderRadius: 8 }}>
                  <span style={{ color: "var(--muted)" }}>Lap {p.laps.length - i}</span>
                  <b style={{ fontVariantNumeric: "tabular-nums" }}>{fmtClock(Math.floor(l / 1000))}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>How logging works</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
            <li>Completed pomodoro focus blocks log automatically.</li>
            <li>Finished countdowns log their full duration.</li>
            <li>Press <b>Done</b> on the stopwatch to log elapsed time.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
