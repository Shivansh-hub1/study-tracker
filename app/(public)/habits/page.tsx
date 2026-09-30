import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Check, ArrowRight, Target, Calendar, Trophy, Zap } from "lucide-react";
import { SITE_DESCRIPTION, SITE_NAME, siteBaseUrl } from "@/lib/seo";

const HABITS_FEATURES = [
  { icon: Target, title: "Daily habits, your way", text: "Create any habit — 'Read 20 pages', 'Code 1 hour', 'Review Anki'. Custom colors, flexible goals." },
  { icon: Calendar, title: "7-day streak heatmap", text: "Visual week view shows consistency at a glance. Green = done, gray = missed. Streak counter keeps you honest." },
  { icon: Flame, title: "Streak freeze days", text: "Life happens. Freeze days protect your streak when you genuinely can't study. Earn them with consistency." },
  { icon: Zap, title: "Timer integration", text: "Start a focus session → habit auto-ticks if duration matches. No double-entry." },
  { icon: Check, title: "Progress stats", text: "Current streak, longest streak, total completions, completion rate. Export to CSV." },
  { icon: Trophy, title: "Habit achievements", text: "Week Warrior (7-day), Month Master (30-day), Consistency King (90-day), Year of Focus (365-day)." },
];

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "Habits & Streaks — Daily Consistency Tracker with Freeze Days | FocusFlow",
    description: "Free habit tracker with streaks, freeze days, heatmap, and timer integration. Build daily consistency for DSA, WebDev, or any goal. No credit card.",
    alternates: { canonical: `${base}/habits` },
    openGraph: { type: "website", siteName: SITE_NAME, title: "Habits & Streaks — Daily Consistency Tracker", description: "Free habit tracker with streaks, freeze days, heatmap, timer integration. Build consistency.", url: "/habits", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FocusFlow Habits — Streaks, heatmap, freeze days" }] },
    twitter: { card: "summary_large_image", title: "Habits & Streaks", description: "Daily habits, streaks, freeze days, heatmap, timer sync. Free forever.", images: ["/opengraph-image"] },
  };
}

const base = siteBaseUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "SoftwareApplication", "@id": `${base}/habits#app`, name: "FocusFlow Habits", url: `${base}/habits`, applicationCategory: "LifestyleApplication", operatingSystem: "Web", description: "Free habit tracker with daily streaks, freeze days, 7-day heatmap, timer integration, and progress analytics.", offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" }, featureList: HABITS_FEATURES.map(f => f.title).join(", ") },
    { "@type": "BreadcrumbList", "@id": `${base}/habits#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }, { "@type": "ListItem", position: 2, name: "Habits & Streaks", item: `${base}/habits` }] },
  ],
};

export default function HabitsPublicPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav"><Link href="/" className="land-logo"><span className="land-logo-icon"><Flame size={22} /></span>Focus<span className="glow-text">Flow</span></Link><nav className="land-links" aria-label="Primary"><Link href="/dsa">DSA</Link><Link href="/webdev">WebDev</Link><Link href="/revision">Revision</Link><Link href="/habits">Habits</Link><Link href="/progress">Analytics</Link><Link href="/achievements">Achievements</Link><Link href="/timer">Timer</Link><Link href="/login">Sign in</Link><Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link></nav></header>
        <main>
          <section className="land-hero" style={{ background: "linear-gradient(135deg, #ef444410 0%, transparent 60%), var(--surface)" }}><p className="land-badge"><Flame size={14} /> Streaks · Freeze days · Heatmap · Timer sync</p><h1>Habits & Streaks.<br /><span className="glow-text" style={{ color: "#ef4444" }}>Consistency compounds.</span></h1><p className="land-sub">Daily habits with visual streaks, freeze days for life, 7-day heatmap, and timer auto-tick. Build the consistency that compounds into mastery.</p><div className="land-cta"><Link href="/signup" className="btn btn-primary btn-lg">Start habit free <ArrowRight size={17} /></Link><Link href="/login" className="btn btn-lg">Sign in</Link></div><ul className="land-ticks"><li><Check size={14} /> Free forever</li><li><Check size={14} /> Streak freeze days</li><li><Check size={14} /> Timer auto-tick</li></ul></section>
          <section className="land-section" aria-labelledby="features-h"><h2 id="features-h">Built for daily consistency</h2><p className="land-sec-sub">Small daily actions beat rare heroic efforts.</p><div className="land-grid">{HABITS_FEATURES.map((f) => (<article key={f.title} className="card land-card"><span className="land-ico"><f.icon size={20} /></span><h3>{f.title}</h3><p>{f.text}</p></article>))}</div></section>
          <section className="land-final card" style={{ background: "linear-gradient(135deg, #ef444410 0%, transparent 60%), var(--surface)" }}><h2>Your streak starts today</h2><p>Join thousands building daily consistency. Free, flexible, and forgiving when life happens.</p><div className="land-cta land-cta-center"><Link href="/signup" className="btn btn-primary btn-lg">Start free <ArrowRight size={17} /></Link></div></section>
        </main>
        <footer className="land-footer"><p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></nav></footer>
      </div>
    </>
  );
}