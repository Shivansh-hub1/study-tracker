"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supa } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const c = supa();
        // supabase-js auto-exchanges the ?code in the URL (PKCE) — wait for the session.
        let session = (await c.auth.getSession()).data.session;
        for (let i = 0; i < 20 && !session && on; i++) {
          await new Promise((r) => setTimeout(r, 300));
          session = (await c.auth.getSession()).data.session;
        }
        if (!session) throw new Error("Login didn't complete — please try again");
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: session.access_token }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error || "Login failed");
        router.push("/dashboard");
        router.refresh();
      } catch (e: any) {
        if (on) setErr(e.message);
      }
    })();
    return () => { on = false; };
  }, [router]);

  return (
    <div className="auth-wrap">
      <div className="card" style={{ textAlign: "center", maxWidth: 380 }}>
        {err ? (
          <>
            <h3 style={{ marginBottom: 8 }}>Couldn&apos;t sign you in</h3>
            <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 14 }}>{err}</p>
            <a className="btn btn-primary" href="/login">Back to login</a>
          </>
        ) : (
          <>
            <span className="spinner spinner-lg" style={{ margin: "6px auto 14px" }} />
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Signing you in…</p>
          </>
        )}
      </div>
    </div>
  );
}
