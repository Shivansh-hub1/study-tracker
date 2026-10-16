"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap, MailCheck, ArrowLeft } from "lucide-react";
import { FieldError } from "@/components/ui";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || "Something went wrong");
      return;
    }
    setSent(true);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-hero">
          <div className="logo"><GraduationCap size={28} /></div>
          <h1 style={{ fontSize: 26 }}>Focus<span className="glow-text">Flow</span></h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Reset your password</p>
        </div>
        <div className="card">
          {sent ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <MailCheck size={30} style={{ color: "var(--accent)", marginBottom: 10 }} />
              <p style={{ fontSize: 14.5, lineHeight: 1.7 }}>
                If an account exists for <b>{email}</b>, a reset link is on its way.
                It expires in <b>60 minutes</b>.
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 10 }}>
                Didn&apos;t get it? Check spam, or ask an admin to change your email/password directly.
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <FieldError msg={err} />
              <div className="field">
                <label className="label">Your account email</label>
                <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </div>
              <button className="btn btn-primary btn-lg btn-block" disabled={busy} style={{ marginTop: 6 }}>
                {busy ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
          <hr className="divider" />
          <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--muted)" }}>
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ArrowLeft size={13} /> Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
