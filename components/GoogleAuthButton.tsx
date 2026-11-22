"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Providers";

export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

export default function GoogleAuthButton({
  mode = "signin",
  nextUrl,
}: {
  mode?: "signin" | "signup";
  nextUrl?: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const targetHref = `/api/auth/google${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ""}`;
  const label = mode === "signup" ? "Sign up with Google" : "Continue with Google";

  // Optional: Listen for Google One Tap if client ID script is loaded
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || typeof window === "undefined") return;

    // Load Google GSI script dynamically if client ID is set
    const scriptId = "google-gsi-client";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initOneTap(clientId);
      document.head.appendChild(script);
    } else if ((window as any).google?.accounts?.id) {
      initOneTap(clientId);
    }

    function initOneTap(cid: string) {
      try {
        const google = (window as any).google;
        if (!google?.accounts?.id) return;
        google.accounts.id.initialize({
          client_id: cid,
          callback: async (res: { credential?: string }) => {
            if (!res.credential) return;
            setLoading(true);
            try {
              const resp = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: res.credential }),
              });
              if (resp.ok) {
                toast(mode === "signup" ? "Account created!" : "Welcome back!", "success");
                const dest = nextUrl && nextUrl.startsWith("/") && !nextUrl.startsWith("//") ? nextUrl : "/dashboard";
                router.push(dest);
                router.refresh();
              } else {
                setLoading(false);
                toast("Google sign-in failed", "error");
              }
            } catch {
              setLoading(false);
              toast("Network error during Google sign-in", "error");
            }
          },
        });
        google.accounts.id.prompt();
      } catch {
        // One tap prompt ignored or blocked
      }
    }
  }, [mode, nextUrl, router, toast]);

  return (
    <a
      href={targetHref}
      onClick={() => setLoading(true)}
      className="btn btn-block"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        color: "var(--text)",
        fontWeight: 500,
        fontSize: 14,
        padding: "10px 16px",
        borderRadius: 8,
        textDecoration: "none",
        transition: "all 0.15s ease",
        opacity: loading ? 0.7 : 1,
        pointerEvents: loading ? "none" : "auto",
      }}
    >
      {loading ? (
        <span
          className="spinner"
          style={{ width: 16, height: 16, borderColor: "var(--muted)", borderTopColor: "var(--accent)" }}
        />
      ) : (
        <GoogleIcon size={18} />
      )}
      <span>{label}</span>
    </a>
  );
}
