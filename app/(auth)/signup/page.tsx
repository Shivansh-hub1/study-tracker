"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, UserPlus } from "lucide-react";
import { FieldError } from "@/components/ui";
import { useToast } from "@/components/Providers";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || "Signup failed");
      return;
    }
    toast("Account created — let's get studying!", "success");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-hero">
          <div className="logo"><GraduationCap size={28} /></div>
          <h1 style={{ fontSize: 26 }}>Join Focus<span className="glow-text">Flow</span></h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Track sessions, follow DSA + WebDev journeys, watch yourself grow</p>
        </div>
        <div className="card">
          <form onSubmit={submit}>
            <FieldError msg={err} />
            <div className="field">
              <label className="label">Name</label>
              <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
            </div>
            <button className="btn btn-primary btn-lg btn-block" disabled={busy} style={{ marginTop: 6 }}>
              {busy ? <span className="spinner" style={{ borderColor: "rgba(255,255,255,.3)", borderTopColor: "#fff" }} /> : <UserPlus size={17} />}
              Create account
            </button>
          </form>
          <hr className="divider" />
          <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--muted)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
