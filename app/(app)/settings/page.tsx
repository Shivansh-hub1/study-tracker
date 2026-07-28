"use client";

import React, { useEffect, useState } from "react";
import { Download, Database, User, Save, Palette, Check, FileJson, FileSpreadsheet } from "lucide-react";
import { useFetch, api } from "@/lib/client";
import { Spinner } from "@/components/ui";
import { THEMES, useTheme, useToast } from "@/components/Providers";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { data: me } = useFetch("/api/auth/me");
  const { data: settingsData, loading, setData } = useFetch("/api/settings");
  const s = settingsData?.settings;

  const [work, setWork] = useState("25");
  const [short, setShort] = useState("5");
  const [long, setLong] = useState("15");
  const [rounds, setRounds] = useState("4");
  const [autoNext, setAutoNext] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (s) {
      setWork(String(s.pomo_work));
      setShort(String(s.pomo_short));
      setLong(String(s.pomo_long));
      setRounds(String(s.pomo_rounds));
      setAutoNext(s.auto_next === 1);
    }
  }, [s]);

  const savePomo = async () => {
    setBusy(true);
    const prev = s;
    const optimistic = { ...s, pomo_work: Number(work), pomo_short: Number(short), pomo_long: Number(long), pomo_rounds: Number(rounds), auto_next: autoNext ? 1 : 0 };
    setData({ settings: optimistic } as any);
    try {
      const { settings } = await api("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({ pomo_work: Number(work), pomo_short: Number(short), pomo_long: Number(long), pomo_rounds: Number(rounds), auto_next: autoNext }),
      });
      setData({ settings } as any);
      toast("Pomodoro defaults saved", "success");
    } catch (e: any) {
      setData({ settings: prev } as any);
      toast(e.message, "error");
    }
    setBusy(false);
  };

  return (
    <div className="grid grid-2" style={{ alignItems: "start" }}>
      {/* Pomodoro */}
      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Pomodoro defaults</h3>
        {loading && !s ? (
          <Spinner />
        ) : (
          <>
            <div className="grid grid-2">
              <div className="field">
                <label className="label">Focus length (min)</label>
                <input className="input" type="number" min={5} max={180} value={work} onChange={(e) => setWork(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Rounds before long break</label>
                <input className="input" type="number" min={1} max={12} value={rounds} onChange={(e) => setRounds(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Short break (min)</label>
                <input className="input" type="number" min={1} max={60} value={short} onChange={(e) => setShort(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Long break (min)</label>
                <input className="input" type="number" min={5} max={120} value={long} onChange={(e) => setLong(e.target.value)} />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, cursor: "pointer", marginBottom: 14 }}>
              <input type="checkbox" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
              Auto-start the next phase when one ends
            </label>
            <button className="btn btn-primary" onClick={savePomo} disabled={busy}><Save size={15} /> Save timer defaults</button>
          </>
        )}
      </div>

      {/* Appearance */}
      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Palette size={16} /> Appearance</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>Pick a vibe — from clean daylight to full neon.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="card"
              style={{
                padding: 12, cursor: "pointer", textAlign: "center",
                border: theme === t.id ? "2px solid var(--accent)" : "1px solid var(--border)",
                boxShadow: theme === t.id ? "var(--glow)" : "none",
              }}
            >
              <div style={{ height: 44, borderRadius: 10, background: t.swatch, marginBottom: 8, display: "grid", placeItems: "center", color: "#fff" }}>
                {theme === t.id && <Check size={18} strokeWidth={3} />}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><User size={16} /> Account</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-grad)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, boxShadow: "var(--glow)" }}>
            {(me?.user?.name || "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{me?.user?.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{me?.user?.email}</div>
          </div>
        </div>
      </div>

      {/* Data export */}
      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Database size={16} /> Your data</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
          Everything is stored in a local SQLite database. Export it any time — sessions as a spreadsheet-friendly CSV, or the full account (subjects, sessions, goals, timetables) as JSON.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn" href="/api/export?format=csv"><FileSpreadsheet size={15} /> Sessions CSV</a>
          <a className="btn" href="/api/export?format=json"><FileJson size={15} /> Full JSON export</a>
        </div>
      </div>
    </div>
  );
}
