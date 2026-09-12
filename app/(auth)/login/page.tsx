"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, LogIn, Sparkles, KeyRound } from "lucide-react";
import { FieldError } from "@/components/ui";
import { useToast } from "@/components/Providers";
import { supa, supaConfigured, callbackUrl } from "@/lib/supabase-client";

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [legacy, setLegacy] = useState(false);
  const [needResend, setNeedResend] = useState(false);
  const cloud = supaConfigured() && !legacy;

  const goDashboard = () => {
    toast("Welcome back!", "success");
    router.push("/dashboard");
    router.refresh();
  };

  const legacyLogin = async (em: string, pw: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: em, password: pw }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || "Login failed");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setNeedResend(false);
    try {
      if (!cloud) {
        await legacyLogin(email, password);
      } else {
        const { data, error } = await supa().auth.signInWithPassword({ email, password });
        if (error) {
          if (/confirm|verif/i.test(error.message)) setNeedResend(true);
          throw error;
        }
        const token = data.session?.access_token;
        if (!token) throw new Error("Login didn't complete — try again");
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (j.needVerify) setNeedResend(true);
          throw new Error(j.error || "Login failed");
        }
      }
      goDashboard();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setErr(null);
    try {
      const { error } = await supa().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl() },
      });
      if (error) throw error;
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
    }
  };

  const resend = async () => {
    setErr(null);
    try {
      const { error } = await supa().auth.resend({ type: "signup", email });
      if (error) throw error;
      toast("Verification email sent — check your inbox!", "success");
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const demo = async () => {
    setBusy(true);
    setErr(null);
    try {
      await legacyLogin("demo@study.app", "demo1234");
      toast("Welcome to the demo!", "success");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErr("Demo unavailable right now");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-hero">
          <div className="logo"><GraduationCap size={28} /></div>
          <h1 style={{ fontSize: 26 }}>Focus<span className="glow-text">Flow</span></h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Sign in to continue your learning streak</p>
        </div>
        <div className="card">
          {cloud && (
            <>
              <button className="btn btn-lg btn-block" disabled={busy} onClick={google}>
                <GoogleIcon /> Continue with Google
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0", color: "var(--muted)", fontSize: 12.5 }}>
                <hr className="divider" style={{ flex: 1, margin: 0 }} /> or with email <hr className="divider" style={{ flex: 1, margin: 0 }} />
              </div>
            </>
          )}
          <form onSubmit={submit}>
            <FieldError msg={err} />
            <div className="field">
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </div>
            <button className="btn btn-primary btn-lg btn-block" disabled={busy} style={{ marginTop: 6 }}>
              {busy ? <span className="spinner" style={{ borderColor: "rgba(255,255,255,.3)", borderTopColor: "#fff" }} /> : <LogIn size={17} />}
              Sign in
            </button>
          </form>
          {needResend && cloud && (
            <button className="btn btn-block" style={{ marginTop: 10 }} onClick={resend}>
              Resend verification email
            </button>
          )}
          <button className="btn btn-block" style={{ marginTop: 10 }} disabled={busy} onClick={demo}>
            <Sparkles size={16} /> Try the demo account
          </button>
          <hr className="divider" />
          <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--muted)" }}>
            New here?{" "}
            <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>Create an account</Link>
          </p>
          {supaConfigured() && (
            <p style={{ textAlign: "center", marginTop: 10 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => { setLegacy(!legacy); setErr(null); }}>
                <KeyRound size={13} /> {legacy ? "Back to Supabase login" : "Use password instead"}
              </button>
            </p>
          )}
        </div>
        <p style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "var(--muted)" }}>
          Demo login: <b>demo@study.app</b> / <b>demo1234</b>
        </p>
      </div>
    </div>
  );
}
