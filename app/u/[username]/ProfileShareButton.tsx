"use client";

import React, { useState } from "react";
import { Share2, Check, ExternalLink } from "lucide-react";

export default function ProfileShareButton({ username, name, streak, totalHours }: { username: string; name: string; streak: number; totalHours: number }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const tweetText = encodeURIComponent(
    `🔥 Check out my verified ${streak}-day study streak & ${totalHours}h of deep work on FocusFlow!\n\n${typeof window !== "undefined" ? window.location.href : `https://tracker.devshivansh.in/u/${username}`}`
  );

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
      <button
        onClick={copyLink}
        className="btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "var(--surface-2)",
          fontSize: 13,
          padding: "7px 14px",
          borderRadius: 10,
        }}
      >
        {copied ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
        {copied ? "Link Copied!" : "Share Profile"}
      </button>

      <a
        href={`https://twitter.com/intent/tweet?text=${tweetText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(29, 155, 240, 0.15)",
          color: "#38bdf8",
          borderColor: "rgba(29, 155, 240, 0.3)",
          fontSize: 13,
          padding: "7px 14px",
          borderRadius: 10,
          textDecoration: "none",
        }}
      >
        <ExternalLink size={14} />
        Post on X
      </a>
    </div>
  );
}
