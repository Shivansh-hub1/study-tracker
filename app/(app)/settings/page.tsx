"use client";

import React, { useEffect, useState } from "react";
import { Download, Database, User, Save, Palette, Check, FileJson, FileSpreadsheet, LogOut, Smile, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFetch, api } from "@/lib/client";
import { Spinner } from "@/components/ui";
import { THEMES, useTheme, useToast } from "@/components/Providers";
import { playSound } from "@/lib/sounds";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { data: shopData } = useFetch("/api/shop");
  const ownedThemes = new Set((shopData?.items || []).filter((i: any) => i.key.startsWith("theme_") && i.owned).map((i: any) => i.key.replace("theme_", "")));
  const ownedAvatars = (shopData?.items || []).filter((i: any) => i.key.startsWith("avatar_") && i.owned);
  const ownedTitles = (shopData?.items || []).filter((i: any) => i.key.startsWith("title_") && i.owned);
  const ownedExport = (shopData?.items || []).some((i: any) => i.key === "unlock_export" && i.owned);
  const [avatar, setAvatar] = useState("");
  const [title, setTitle] = useState("");
  useEffect(() => {
    try {
      setAvatar(localStorage.getItem("ff_avatar") || "");
      setTitle(localStorage.getItem("ff_title") || "");
    } catch {}
  }, [shopData]);
  const pickFlair = (kind: "avatar" | "title", key: string) => {
    playSound("click");
    if (kind === "avatar") { setAvatar(key); localStorage.setItem("ff_avatar", key); }
    else { setTitle(key); localStorage.setItem("ff_title", key); }
  };
  const pickTheme = (t: any) => {
    if (t.shop && !ownedThemes.has(t.id)) {
      playSound("error");
      toast(`🔒 ${t.name} is a premium theme — unlock it in the Shop for ${t.shop} XP`, "error");
      return;
    }
    playSound("click");
    setTheme(t.id);
  };
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
      }, { queueOffline: true });
      setData({ settings } as any);
      playSound("success"); toast("Pomodoro defaults saved", "success");
    } catch (e: any) {
      setData({ settings: prev } as any);
      toast(e.message, "error");
    }
    setBusy(false);
  };

  const logout = async () => {
    playSound("whoosh");
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Signed out. See you soon!", "success");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="grid grid-2" style={{ alignItems: "start" }}>
      {/* Pomodoro */}
      <div className="card">
        <h2 style={{ fontSize: 15, marginBottom: 14 }}>Pomodoro defaults</h2>
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
        <h2 style={{ fontSize: 15, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Palette size={16} /> Appearance</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>Pick a vibe — from clean daylight to full neon.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {THEMES.map((t: any) => (
            <button
              key={t.id}
              onClick={() => pickTheme(t)}
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
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.shop && !ownedThemes.has(t.id as any) ? `🔒 ${t.name} · ${t.shop} XP` : t.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile flair */}
      <div className="card">
        <h2 style={{ fontSize: 15, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Smile size={16} /> Profile flair</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>Avatars and titles you unlock in the Shop appear here and show next to your name.</p>
        {ownedAvatars.length === 0 && ownedTitles.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Nothing unlocked yet — grab avatars and titles in the <Link href="/shop" style={{ color: "var(--accent)", fontWeight: 700 }}>XP Shop</Link>.</div>
        ) : (
          <div className="grid" style={{ gap: 16 }}>
            {ownedAvatars.length > 0 && (
              <div>
                <div className="label" style={{ marginBottom: 8 }}>Avatar</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn" style={avatar ? {} : { borderColor: "var(--accent)", borderWidth: 2 }} onClick={() => pickFlair("avatar", "")}>None</button>
                  {ownedAvatars.map((a: any) => (
                    <button key={a.key} className="btn" style={{ fontSize: 17, ...(avatar === a.key ? { borderColor: "var(--accent)", borderWidth: 2 } : {}) }} onClick={() => pickFlair("avatar", a.key)}>{a.icon}</button>
                  ))}
                </div>
              </div>
            )}
            {ownedTitles.length > 0 && (
              <div>
                <div className="label" style={{ marginBottom: 8 }}>Title</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn" style={title ? {} : { borderColor: "var(--accent)", borderWidth: 2 }} onClick={() => pickFlair("title", "")}>None</button>
                  {ownedTitles.map((t: any) => (
                    <button key={t.key} className="btn" style={{ fontWeight: 700, ...(title === t.key ? { borderColor: "var(--accent)", borderWidth: 2 } : {}) }} onClick={() => pickFlair("title", t.key)}>{t.icon} {t.name.replace("Title: ", "")}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account */}
      <div className="card">
        <h2 style={{ fontSize: 15, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><User size={16} /> Account</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-grad)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, boxShadow: "var(--glow)" }}>
            {(me?.user?.name || "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{me?.user?.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{me?.user?.email}</div>
          </div>
        </div>
        <button className="btn" style={{ marginTop: 14 }} onClick={logout}><LogOut size={15} /> Sign out</button>
      </div>

      {/* Data export */}
      <div className="card">
        <h2 style={{ fontSize: 15, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Database size={16} /> Your data</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
          Everything is stored in a local SQLite database. Export it any time — sessions as a spreadsheet-friendly CSV, or the full account (subjects, sessions, goals, timetables) as JSON.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {ownedExport ? (
            <>
              <a className="btn" href="/api/export?format=csv"><FileSpreadsheet size={15} /> Sessions CSV</a>
              <a className="btn" href="/api/export?format=json"><FileJson size={15} /> Full JSON export</a>
            </>
          ) : (
            <button className="btn" onClick={() => { playSound("error"); toast("🔒 Data Export is a Shop unlock — grab it in the XP Shop for 150 XP", "error"); }}>
              <Lock size={15} /> 🔒 Unlock in the XP Shop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
