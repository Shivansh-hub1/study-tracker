import type { Metadata } from "next";
import Link from "next/link";
import { Timer, Check, ArrowRight, Zap, Coffee, Moon, Flag, Play, Hourglass, Watch } from "lucide-react";
import { SITE_NAME, siteBaseUrl } from "@/lib/seo";

const TIMER_FEATURES = [
  { icon: Zap, title: "Pomodoro (customizable)", text: "Focus / short break / long break cycles. Configurable rounds, auto-advance, phase notifications." },
  { icon: Hourglass, title: "Countdown timer", text: "Presets: 15/25/45/60/90/120 min + custom. One-tap session logging on finish." },
  { icon: Watch, title: "Stopwatch with laps", text: "Precision timing, lap flags, background mode. Press Done to log elapsed time." },
  { icon: Flag, title: "Background mode", text: "Timers keep counting even if you switch tabs, minimize, or reload. Time tracked by clock, not screen." },
  { icon: Play, title: "Subject & topic tagging", text: "Pick a subject → timer auto-logs to it. DSA/WebDev journey topics auto-selected." },
  { icon: Coffee, title: "Smart notifications", text: "Browser notifications + gentle audio cues. Phase changes, timer end, break over." },
];

const TIMER_MODES = [
  { icon: Zap, name: "Pomodoro", desc: "25m focus / 5m break / 15m long break", color: "var(--accent)" },
  { icon: Hourglass, name: "Countdown", desc: "Set any duration, get notified, auto-log", color: "#ec4899" },
  { icon: Watch, name: "Stopwatch", desc: "Lap timing, background mode, manual log", color: "#0ea5e9" },
];

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "Focus Timer — Pomodoro, Countdown & Stopwatch Demo | FocusFlow",
    description: "Free focus timer with Pomodoro, countdown, stopwatch. Background mode, subject tagging, lap timing, notifications. Try the live demo — no account needed.",
    alternates: { canonical: `${base}/timer` },
    openGraph: { type: "website", siteName: SITE_NAME, title: "Focus Timer — Pomodoro, Countdown & Stopwatch", description: "Three timer modes, background tracking, subject tagging, lap timing. Free demo, no signup.", url: "/timer", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FocusFlow Timer — Pomodoro, countdown, stopwatch demo" }] },
    twitter: { card: "summary_large_image", title: "Focus Timer Demo", description: "Pomodoro, countdown, stopwatch. Background mode, subject tagging. Try free.", images: ["/opengraph-image"] },
  };
}

const base = siteBaseUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "SoftwareApplication", "@id": `${base}/timer#app`, name: "FocusFlow Timer", url: `${base}/timer`, applicationCategory: "UtilityApplication", operatingSystem: "Web", description: "Free focus timer with Pomodoro, countdown, and stopwatch modes. Background tracking, subject tagging, lap timing, browser notifications.", offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" }, featureList: TIMER_FEATURES.map(f => f.title).join(", ") },
    { "@type": "BreadcrumbList", "@id": `${base}/timer#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }, { "@type": "ListItem", position: 2, name: "Focus Timer Demo", item: `${base}/timer` }] },
  ],
};

export default function TimerPublicPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav"><Link href="/" className="land-logo"><span className="land-logo-icon"><Timer size={22} /></span>Focus<span className="glow-text">Flow</span></Link><nav className="land-links" aria-label="Primary"><Link href="/dsa">DSA</Link><Link href="/webdev">WebDev</Link><Link href="/revision">Revision</Link><Link href="/habits">Habits</Link><Link href="/progress">Analytics</Link><Link href="/achievements">Achievements</Link><Link href="/timer">Timer</Link><Link href="/login">Sign in</Link><Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link></nav></header>
        <main>
          <section className="land-hero" style={{ background: "linear-gradient(135deg, #ec489910 0%, transparent 60%), var(--surface)" }}><p className="land-badge"><Play size={14} /> Pomodoro · Countdown · Stopwatch · Background mode</p><h1>Focus Timer.<br /><span className="glow-text" style={{ color: "#ec4899" }}>Three modes. Zero friction.</span></h1><p className="land-sub">Try the live timer demo — no account needed. Pomodoro cycles, countdown presets, stopwatch with laps. Background mode keeps time even when you switch tabs.</p><div className="land-cta"><Link href="/signup" className="btn btn-primary btn-lg">Get full timer free <ArrowRight size={17} /></Link><Link href="/login" className="btn btn-lg">Sign in</Link></div><ul className="land-ticks"><li><Check size={14} /> Free forever</li><li><Check size={14} /> Works offline</li><li><Check size={14} /> Background mode</li></ul></section>
          <section className="land-section" aria-labelledby="modes-h"><h2 id="modes-h">Three timer modes, one goal: deep focus</h2><div className="land-grid">{TIMER_MODES.map((m) => (<article key={m.name} className="card land-card" style={{ borderLeft: `4px solid ${m.color}` }}><span className="land-ico"><m.icon size={20} style={{ color: m.color }} /></span><h3>{m.name}</h3><p>{m.desc}</p></article>))}</div></section>
          <section className="land-section" aria-labelledby="features-h"><h2 id="features-h">Built for how you actually focus</h2><p className="land-sec-sub">Background mode. Subject tagging. Smart notifications. Zero friction.</p><div className="land-grid">{TIMER_FEATURES.map((f) => (<article key={f.title} className="card land-card"><span className="land-ico"><f.icon size={20} /></span><h3>{f.title}</h3><p>{f.text}</p></article>))}</div></section>
          <section className="land-final card" style={{ background: "linear-gradient(135deg, #ec489910 0%, transparent 60%), var(--surface)" }}><h2>Try the timer now</h2><p>Experience background mode, phase notifications, and subject tagging. Create an account to save sessions forever.</p><div className="land-cta land-cta-center"><Link href="/signup" className="btn btn-primary btn-lg">Get full timer free <ArrowRight size={17} /></Link></div></section>
        </main>
        <footer className="land-footer"><p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></nav></footer>
      </div>
    </>
  );
}