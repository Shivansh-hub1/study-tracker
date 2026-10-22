"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "40px 20px", background: "var(--bg, #191919)", color: "var(--fg, #ebebeb)", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center", padding: 32, background: "var(--surface, #202020)", borderRadius: 18, border: "1px solid var(--border, #2e2e2e)" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <AlertCircle size={24} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>Something went wrong</h2>
        <p style={{ fontSize: 13.5, color: "var(--muted, #999)", lineHeight: 1.5, margin: "0 0 24px" }}>
          The page encountered an unexpected issue. You can try refreshing or jump back to the dashboard.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, background: "var(--accent, #2e8cff)", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            <RotateCcw size={14} /> Try again
          </button>
          <Link
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, background: "var(--surface-2, #292929)", color: "var(--fg, #ebebeb)", textDecoration: "none", border: "1px solid var(--border, #333)", fontWeight: 700, fontSize: 13 }}
          >
            <Home size={14} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
