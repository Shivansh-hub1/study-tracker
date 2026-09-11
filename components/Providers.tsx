"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* ---------------- Theme ---------------- */
export const THEMES = [
  { id: "light", name: "Daylight", swatch: "linear-gradient(135deg,#6366f1,#ec4899)" },
  { id: "dark", name: "Midnight", swatch: "linear-gradient(135deg,#818cf8,#f472b6)" },
  { id: "nebula", name: "Nebula Neon", swatch: "linear-gradient(135deg,#a855f7,#fb7185)" },
  { id: "matrix", name: "Matrix Neon", swatch: "linear-gradient(135deg,#10b981,#a3e635)" },
  { id: "cyber", name: "Cyber Neon", swatch: "linear-gradient(135deg,#22d3ee,#f0abfc)" },
  { id: "ember", name: "Ember Neon", swatch: "linear-gradient(135deg,#ef4444,#fbbf24)" },
  { id: "glass-light", name: "Frost Light", swatch: "linear-gradient(135deg,#c7d2fe,#f9a8d4,#a5f3fc)" },
  { id: "glass-dark", name: "Frost Dark", swatch: "linear-gradient(135deg,#4c1d95,#9d174d,#0e7490)" },
] as const;

type ThemeCtx = { theme: string; setTheme: (t: string) => void };
const ThemeContext = createContext<ThemeCtx>({ theme: "dark", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

/* ---------------- Toast ---------------- */
type Toast = { id: number; msg: string; kind: "success" | "error" | "info" };
type ToastCtx = { toast: (msg: string, kind?: Toast["kind"]) => void };
const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState("dark");
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const t = localStorage.getItem("ff_theme") || "dark";
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  const setTheme = useCallback((t: string) => {
    setThemeState(t);
    localStorage.setItem("ff_theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  const toast = useCallback((msg: string, kind: Toast["kind"] = "info") => {
    const id = ++toastId;
    setToasts((ts) => [...ts, { id, msg, kind }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4200);
  }, []);

  const themeVal = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  const toastVal = useMemo(() => ({ toast }), [toast]);

  return (
    <ThemeContext.Provider value={themeVal}>
      <ToastContext.Provider value={toastVal}>
        {children}
        <div className="toasts">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.kind}`}>
              {t.msg}
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </ThemeContext.Provider>
  );
}
