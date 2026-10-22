"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, LayoutDashboard } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div style={{ padding: "60px 20px", display: "grid", placeItems: "center", textAlign: "center" }}>
      <div style={{ maxWidth: 440, width: "100%", padding: 32, background: "var(--surface)", borderRadius: 18, border: "1px solid var(--border)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <AlertCircle size={22} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", color: "var(--fg)" }}>Unable to load view</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, margin: "0 0 20px" }}>
          We hit an unexpected error while loading this section.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ fontSize: 13 }}
          >
            <RotateCcw size={14} /> Retry
          </button>
          <Link
            href="/dashboard"
            className="btn btn-secondary"
            style={{ fontSize: 13 }}
          >
            <LayoutDashboard size={14} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
