"use client";

import React, { useState } from "react";
import { getActive6HourQuote } from "@/lib/devQuotes";

export default function DevQuoteBar() {
  const [offset, setOffset] = useState(0);
  const [copied, setCopied] = useState(false);
  const { quote, index, hoursRemaining } = getActive6HourQuote(offset);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(quote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "6px 14px",
        margin: "10px 18px 4px",
        borderRadius: 12,
        background: "rgba(99, 102, 241, 0.06)",
        border: "1px solid rgba(99, 102, 241, 0.16)",
        fontSize: 12,
        color: "var(--fg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "rgba(99, 102, 241, 0.15)",
            color: "var(--accent)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5"></polyline>
            <line x1="12" y1="19" x2="20" y2="19"></line>
          </svg>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: "var(--accent)",
            fontFamily: "monospace",
            flexShrink: 0,
          }}
        >
          Dev Shift #{index}
        </span>
        <span style={{ color: "var(--muted)", flexShrink: 0 }}>•</span>
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "var(--fg)",
            fontWeight: 500,
          }}
        >
          {quote}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 10,
            fontFamily: "monospace",
            color: "var(--muted)",
            padding: "2px 6px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          ~{hoursRemaining}h left
        </span>
        <button
          onClick={handleCopy}
          title="Copy quote"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            padding: 4,
            display: "grid",
            placeItems: "center",
          }}
        >
          {copied ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
        <button
          onClick={() => setOffset((o) => o + 1)}
          title="Shuffle quote (1000 dev memes)"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            padding: 4,
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
