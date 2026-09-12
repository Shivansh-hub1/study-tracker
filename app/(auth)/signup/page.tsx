"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, UserPlus, MailCheck } from "lucide-react";
import { FieldError } from "@/components/ui";
import { useToast } from "@/components/Providers";
import { supa, supaConfigured, callbackUrl } from "@/lib/supabase-client";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const cloud = supaConfigured();

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (!cloud) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Signup failed");
        }
        toast("Account created — let's get studying!", "success");
        router.push("/dashboard");
        router.refresh();
        return;
      }
      const { data, error } = await supa().auth.signUp({
        email,
        password,
        options: { data: { full_name: name }, emailRedirectTo: callbackUrl() },
      });
      if (error) {
        if (/already|registered|exists/i.test(error.message)) {
          throw new Error("This email already has an account — sign in instead.");
        }
        throw error;
      }
      // If email confirmation is OFF in Supabase, we get a session immediately.
      if (data.session?.access_token) {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: data.session.access_token }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error || "Signup failed");
        toast("Account created — let's get studying!", "success");
        router.push("/dashboard");
        router.refresh();
      } else {
        setSent(true);
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
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
          {sent ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <MailCheck size={40} style={{ color: "var(--success)" }} />
              <h3 style={{ margin: "10px 0 6px" }}>Check your inbox ✉️</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
                We sent a verification link to <b style={{ color: "var(--text)" }}>{email}</b>.
                Click it, then sign in.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
                <button className="btn" onClick={resend}>Resend email</button>
                <Link className="btn btn-primary" href="/login">Go to login</Link>
              </div>
              <FieldError msg={err} />
            </div>
          ) : (
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
          )}
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
