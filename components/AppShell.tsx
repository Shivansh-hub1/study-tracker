"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Timer, BookOpen, TrendingUp, ShieldCheck,
  ListChecks, Settings, LogOut, GraduationCap, Menu, X, Check, Palette, Route, Code2,
} from "lucide-react";
import { THEMES, useTheme, useToast } from "./Providers";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timer", label: "Focus Timers", icon: Timer },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/dsa", label: "DSA Journey", icon: Route },
  { href: "/webdev", label: "Web Dev", icon: Code2 },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/sessions", label: "Sessions", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

type Me = { id: number; name: string; email: string; role?: string };

export default function AppShell({ user, children }: { user: Me; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Signed out. See you soon!", "success");
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="app-shell">
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sbrand">
          <div className="logo">
            <GraduationCap size={19} />
          </div>
          <span>
            Focus<span className="glow-text">Flow</span>
          </span>
        </div>
        <div className="ssection">Menu</div>
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={`snav ${active ? "active" : ""}`}>
              <Icon size={17} /> {n.label}
            </Link>
          );
        })}
        {user.role === "admin" && (
          <Link href="/admin" className={`snav ${pathname.startsWith("/admin") ? "active" : ""}`}>
            <ShieldCheck size={17} /> Admin Panel
          </Link>
        )}
        <div className="sspacer" />
        <div className="ssection">Appearance</div>
        <div style={{ padding: "0 10px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              title={t.name}
              onClick={() => setTheme(t.id)}
              style={{
                height: 34, borderRadius: 9, border: theme === t.id ? "2px solid var(--text)" : "1px solid var(--border)",
                background: t.swatch, cursor: "pointer", display: "grid", placeItems: "center", color: "#fff",
                boxShadow: theme === t.id ? "var(--glow)" : "none", transition: "all .15s ease",
              }}
            >
              {theme === t.id && <Check size={14} strokeWidth={3} />}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", padding: "8px 0 2px" }}>
          {THEMES.find((t) => t.id === theme)?.name}
        </div>
        <hr className="divider" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px" }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: "50%", background: "var(--accent-grad)", color: "#fff",
              display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flexShrink: 0, boxShadow: "var(--glow)",
            }}
          >
            {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
          </div>
        </div>
        <button className="snav" style={{ background: "none", border: "1px solid transparent", width: "100%", cursor: "pointer" }} onClick={logout}>
          <LogOut size={17} /> Sign out
        </button>
      </aside>

      <div className="main">
        <div className="topbar no-print">
          <button className="iconbtn hamb" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1>{NAV.find((n) => pathname.startsWith(n.href))?.label ?? (pathname.startsWith("/admin") ? "Admin Panel" : "FocusFlow")}</h1>
            <div className="sub">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
          </div>
          <div style={{ position: "relative" }} ref={menuRef}>
            <button className="iconbtn" onClick={() => setMenuOpen((o) => !o)} title="Theme">
              <Palette size={17} />
            </button>
            {menuOpen && (
              <div className="menu">
                {THEMES.map((t) => (
                  <button key={t.id} className={`menu-item ${theme === t.id ? "on" : ""}`} onClick={() => setTheme(t.id)}>
                    <span style={{ width: 18, height: 18, borderRadius: 6, background: t.swatch, display: "inline-block" }} />
                    {t.name}
                    {theme === t.id && <Check size={14} style={{ marginLeft: "auto" }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
