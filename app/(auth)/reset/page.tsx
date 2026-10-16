"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, KeyRound, ArrowLeft } from "lucide-react";
import { FieldError } from "@/components/ui";
import { useToast } from "@/components/Providers";

function ResetInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) { setErr("Passwords don't match"); return; }
    setBusy(true); setErr(null);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || "Reset failed");
      return;
    }
    toast("Password updated — sign in with your new password", "success");
    router.push("/login");
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-hero">
          <div className="logo"><GraduationCap size={28} /></div>
          <h1 style={{ fontSize: 26 }}>Focus<span className="glow-text">Flow</span></h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>Choose a new password</p>
        </div>
        <div className="card">
          {token ? (
            <form onSubmit={submit}>
              <FieldError msg={err} />
              <div className="field">
                <label className="label">New password</label>
                <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" autoComplete="new-password" />
              </div>
              <div className="field">
                <label className="label">Confirm new password</label>
                <input className="input" type="password" required minLength={6} value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Repeat it" autoComplete="new-password" />
              </div>
              <button className="btn btn-primary btn-lg btn-block" disabled={busy} style={{ marginTop: 6 }}>
                {busy ? "Saving…" : <><KeyRound size={16} /> Set new password</>}
              </button>
            </form>
          ) : (
            <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>
              This link is missing its token.<br />Request a fresh one on the <Link href="/forgot" style={{ color: "var(--accent)", fontWeight: 600 }}>forgot password</Link> page.
            </p>
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

export default function ResetPage() {
  return (
    <Suspense>
      <ResetInner />
    </Suspense>
  );
}
