import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "var(--bg, #0e1424)", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="card" style={{ padding: 34, maxWidth: 430, textAlign: "center", margin: "0 auto" }}>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 14 }}><div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--muted)" }}><WifiOff size={26} /></div></div>
        <h1 style={{ fontSize: 22, letterSpacing: -0.5, marginBottom: 6 }}>You&apos;re offline</h1>
        <p style={{ color: "var(--muted, #9aa3b5)", fontSize: 14.5, marginBottom: 22 }}>
          FocusFlow needs internet to load your data. Your sessions are saved locally and will sync
          when you&apos;re back online.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a className="btn btn-primary" href="/dashboard" style={{ textDecoration: "none" }}>Try Again</a>
          <Link className="btn" href="/about" style={{ textDecoration: "none" }}>About FocusFlow</Link>
        </div>
      </div>
    </main>
  );
}
