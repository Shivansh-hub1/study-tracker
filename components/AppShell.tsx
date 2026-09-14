"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useToast } from "./Providers";
import { useOfflineStatus, flushOutbox, loadOutbox } from "@/lib/offline";
import {
  LayoutDashboard, Timer, BookOpen, TrendingUp, ShieldCheck,
  ListChecks, Settings, GraduationCap, Menu, X, Route, Code2, History,
  Trophy, CalendarClock, CalendarDays, Sprout, Crown,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timer", label: "Focus Timers", icon: Timer },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/dsa", label: "DSA Journey", icon: Route },
  { href: "/webdev", label: "Web Dev", icon: Code2 },
  { href: "/revision", label: "Revision", icon: History },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/exams", label: "Exams", icon: CalendarClock },
  { href: "/habits", label: "Habits", icon: Sprout },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/leaderboard", label: "Leaderboard", icon: Crown },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/sessions", label: "Sessions", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

type Me = { id: number; name: string; email: string; role?: string };

function OfflineBadge() {
  const { online, pending } = useOfflineStatus();
  const { toast } = useToast();
  useEffect(() => {
    const tryFlush = async () => {
      if (!navigator.onLine) return;
      const r = await flushOutbox();
      if (r.synced > 0) toast(`Synced ${r.synced} offline change${r.synced === 1 ? "" : "s"}`, "success");
    };
    tryFlush();
    window.addEventListener("online", tryFlush);
    const t = setInterval(() => { if (loadOutbox().length) tryFlush(); }, 60000);
    return () => { window.removeEventListener("online", tryFlush); clearInterval(t); };
  }, [toast]);
  if (!online) {
    return <span className="badge" style={{ background: "#ef444422", color: "#f87171", whiteSpace: "nowrap" }}>● Offline</span>;
  }
  if (pending > 0) {
    return (
      <button className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "none", cursor: "pointer", whiteSpace: "nowrap" }} onClick={async () => {
        const r = await flushOutbox();
        if (r.synced > 0) toast(`Synced ${r.synced} offline change${r.synced === 1 ? "" : "s"}`, "success");
      }}>
        ⏳ {pending} to sync
      </button>
    );
  }
  return null;
}

export default function AppShell({ user, children }: { user: Me; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dueCount, setDueCount] = useState(0);
  const now = new Date();
  const daysLeft = Math.ceil((new Date(now.getFullYear() + 1, 0, 1).getTime() - now.getTime()) / 86400000);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const [a, b] = await Promise.all([
          fetch("/api/dsa").then((r) => r.json()),
          fetch("/api/webdev").then((r) => r.json()),
        ]);
        if (on) setDueCount((a.revision_due?.length || 0) + (b.revision_due?.length || 0));
      } catch {}
    })();
    return () => { on = false; };
  }, [pathname]);

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
              {n.href === "/revision" && dueCount > 0 && (
                <span className="badge" style={{ marginLeft: "auto", fontSize: 11, padding: "2px 9px" }}>{dueCount}</span>
              )}
            </Link>
          );
        })}
        {user.role === "admin" && (
          <Link href="/admin" className={`snav ${pathname.startsWith("/admin") ? "active" : ""}`}>
            <ShieldCheck size={17} /> Admin Panel
          </Link>
        )}
        <div className="sspacer" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 12px" }}>
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
      </aside>

      <div className="main">
        <div className="topbar no-print">
          <button className="iconbtn hamb" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1>{NAV.find((n) => pathname.startsWith(n.href))?.label ?? (pathname.startsWith("/admin") ? "Admin Panel" : "FocusFlow")}</h1>
            <div className="sub">{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {daysLeft} days left in {now.getFullYear()}</div>
          </div>
          <OfflineBadge />
        </div>
        {children}
      </div>
    </div>
  );
}
