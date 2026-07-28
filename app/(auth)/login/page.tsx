"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, LogIn, Sparkles } from "lucide-react";
import { FieldError } from "@/components/ui";
import { useToast } from "@/components/Providers";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e?: React.FormEvent, creds?: { email: string; password: string }) => {
    e?.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds || { email, password }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || "Login failed");
      return;
    }
    toast("Welcome back!", "success");
    router.push("/dashboard");
    router.refresh();
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
          <button
            className="btn btn-block"
            style={{ marginTop: 10 }}
            disabled={busy}
            onClick={() => submit(undefined, { email: "demo@study.app", password: "demo1234" })}
          >
            <Sparkles size={16} /> Try the demo account
          </button>
          <hr className="divider" />
          <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--muted)" }}>
            New here?{" "}
            <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
        <p style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "var(--muted)" }}>
          Demo login: <b>demo@study.app</b> / <b>demo1234</b>
        </p>
      </div>
    </div>
  );
}
