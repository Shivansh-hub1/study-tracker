"use client";

import React, { useEffect, useState } from "react";
import { Download, Database, User, Save, Palette, Check, FileJson, FileSpreadsheet, LogOut, Smile, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFetch, api, bustCache } from "@/lib/client";
import { Spinner } from "@/components/ui";
import { THEMES, useTheme, useToast } from "@/components/Providers";
import { playSound, soundEngine } from "@/lib/sounds";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { data: shopData } = useFetch("/api/shop");
  const ownedThemes = new Set((shopData?.items || []).filter((i: any) => i.key.startsWith("theme_") && i.owned).map((i: any) => i.key.replace("theme_", "")));
  const ownedAvatars = (shopData?.items || []).filter((i: any) => i.key.startsWith("avatar_") && i.owned);
  const ownedTitles = (shopData?.items || []).filter((i: any) => i.key.startsWith("title_") && i.owned);
  const ownedPets = (shopData?.items || []).filter((i: any) => i.key.startsWith("pet_") && i.owned);
  const ownedExport = (shopData?.items || []).some((i: any) => i.key === "unlock_export" && i.owned);
  const [avatar, setAvatar] = useState("");
  const [title, setTitle] = useState("");
  const [pet, setPet] = useState("");
  const [nameVal, setNameVal] = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [acctBusy, setAcctBusy] = useState(false);
  useEffect(() => {
    try {
      setAvatar(localStorage.getItem("ff_avatar") || "");
      setTitle(localStorage.getItem("ff_title") || "");
      setPet(localStorage.getItem("ff_pet") || "");
    } catch {}
  }, [shopData]);
  const pickFlair = (kind: "avatar" | "title" | "pet", key: string) => {
    playSound("click");
    if (kind === "avatar") { setAvatar(key); localStorage.setItem("ff_avatar", key); }
    else if (kind === "title") { setTitle(key); localStorage.setItem("ff_title", key); }
    else { setPet(key); localStorage.setItem("ff_pet", key); }
    try { window.dispatchEvent(new Event("ff:flair")); } catch {}
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
  const { data: me, reload: reloadMe } = useFetch("/api/auth/me");
  useEffect(() => {
    if (me?.user?.name) setNameVal(me.user.name);
  }, [me?.user?.name]);
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

  const uploadPfp = async (dataUrl: string) => {
    setAcctBusy(true);
    try {
      await api("/api/account", { method: "PATCH", body: JSON.stringify({ pfp: dataUrl }) });
      playSound("success");
      toast("Profile picture updated", "success");
      bustCache("/api/auth/me");
      reloadMe();
      router.refresh();
    } catch (e: any) { playSound("error"); toast(e.message, "error"); }
    finally { setAcctBusy(false); }
  };
  const onPickPfp = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { playSound("error"); toast("Please pick an image file", "error"); return; }
    const img = new Image();
    img.onload = () => {
      const size = 160;
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const min = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
      URL.revokeObjectURL(img.src);
      uploadPfp(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { playSound("error"); toast("Could not read that image", "error"); };
    img.src = URL.createObjectURL(file);
    e.target.value = "";
  };
  const removePfp = async () => {
    soundEngine.trash();
    setAcctBusy(true);
    try {
      await api("/api/account", { method: "PATCH", body: JSON.stringify({ pfp: null }) });
      toast("Picture removed", "success");
      bustCache("/api/auth/me");
      reloadMe();
      router.refresh();
    } catch (e: any) { playSound("error"); toast(e.message, "error"); }
    finally { setAcctBusy(false); }
  };
  const saveAccount = async () => {
    const trimmed = nameVal.trim();
    const body: any = {};
    if (trimmed && trimmed !== me?.user?.name) body.name = trimmed;
    if (newPw || newPw2) {
      if (!oldPw) { playSound("error"); toast("Enter your current password to change it", "error"); return; }
      if (newPw !== newPw2) { playSound("error"); toast("New passwords do not match", "error"); return; }
      if (newPw.length < 6) { playSound("error"); toast("New password must be at least 6 characters", "error"); return; }
      body.oldPassword = oldPw;
      body.newPassword = newPw;
    }
    if (!Object.keys(body).length) { toast("Nothing to save", "info"); return; }
    setAcctBusy(true);
    try {
      await api("/api/account", { method: "PATCH", body: JSON.stringify(body) });
      playSound("success");
      toast(body.newPassword ? "Account updated — password changed" : "Account updated", "success");
      setOldPw(""); setNewPw(""); setNewPw2("");
      bustCache("/api/auth/me");
      reloadMe();
      router.refresh();
    } catch (e: any) { playSound("error"); toast(e.message, "error"); }
    finally { setAcctBusy(false); }
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
        {ownedAvatars.length === 0 && ownedTitles.length === 0 && ownedPets.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Nothing unlocked yet — grab avatars and titles in the <Link href="/shop" style={{ color: "var(--accent)", fontWeight: 700 }}>XP Shop</Link>.</div>
        ) : (
          <div className="grid" style={{ gap: 16 }}>
            {ownedPets.length > 0 && (
              <div>
                <div className="label" style={{ marginBottom: 8 }}>Pet (sits on your pages)</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn" style={pet ? {} : { borderColor: "var(--accent)", borderWidth: 2 }} onClick={() => pickFlair("pet", "")}>None</button>
                  {ownedPets.map((p: any) => (
                    <button key={p.key} className="btn" style={{ fontSize: 17, ...(pet === p.key ? { borderColor: "var(--accent)", borderWidth: 2 } : {}) }} onClick={() => pickFlair("pet", p.key)}>{p.icon}</button>
                  ))}
                </div>
              </div>
            )}
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
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <label
            title="Change profile picture"
            style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-grad)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 18, boxShadow: "var(--glow)", cursor: acctBusy ? "wait" : "pointer", overflow: "hidden", flexShrink: 0 }}
          >
            {me?.user?.pfp ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.user.pfp} alt="Profile picture" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (me?.user?.name || "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
            )}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={onPickPfp} disabled={acctBusy} />
          </label>
          <div style={{ flex: 1, minWidth: 170 }}>
            <div style={{ fontWeight: 700 }}>{me?.user?.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{me?.user?.email} · 🔒 email can&apos;t be changed</div>
          </div>
          {me?.user?.pfp && (
            <button className="btn" disabled={acctBusy} onClick={removePfp}>Remove picture</button>
          )}
        </div>

        <div className="grid" style={{ gap: 12, marginTop: 16 }}>
          <div className="field">
            <label className="label">Display name</label>
            <input className="input" value={nameVal} maxLength={60} onChange={(e) => setNameVal(e.target.value)} placeholder="Your name" />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label className="label">New password</label>
              <input className="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="min 6 characters" autoComplete="new-password" />
            </div>
            <div className="field">
              <label className="label">Confirm new password</label>
              <input className="input" type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          <div className="field">
            <label className="label">Current password (only needed to change password)</label>
            <input className="input" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} autoComplete="current-password" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
          <button className="btn btn-primary" disabled={acctBusy} onClick={saveAccount}><Save size={15} /> Save changes</button>
          <button className="btn" disabled={acctBusy} onClick={logout}><LogOut size={15} /> Sign out</button>
        </div>
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
            <button className="btn" onClick={() => { playSound("error"); toast("🔒 Data Export is a Shop unlock — grab it in the XP Shop for 175 XP", "error"); }}>
              <Lock size={15} /> 🔒 Unlock in the XP Shop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
