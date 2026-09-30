import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Check, ArrowRight, Target, Sparkles, Zap } from "lucide-react";
import { SITE_NAME, siteBaseUrl } from "@/lib/seo";

const ACHIEVEMENT_CATEGORIES = [
  { name: "Sessions", count: 10, icon: "📚", desc: "First Steps → Immortal (1,000 sessions)" },
  { name: "Streaks", count: 12, icon: "🔥", desc: "On a Roll (3-day) → Year of Focus (365-day)" },
  { name: "Hours", count: 9, icon: "⏱️", desc: "Deep Diver (10h) → Millennium (1,000h)" },
  { name: "Level & XP", count: 12, icon: "⭐", desc: "Rising Star (Lv3) → Infinity (Lv30)" },
  { name: "Deep Focus", count: 7, icon: "🌊", desc: "First Hour (1h/day) → Beast Week (40h/week)" },
  { name: "Consistency", count: 7, icon: "📈", desc: "Consistent (20/30) → Perfect Month (30/30)" },
  { name: "Time of Day", count: 10, icon: "🌅", desc: "Early Bird → Around the Clock (all 24h)" },
  { name: "Subjects", count: 5, icon: "🎨", desc: "Polymath (5) → Omniscient (50)" },
  { name: "Timers", count: 6, icon: "🍅", desc: "Pomodoro Master → Pomodoro Universe (1,000)" },
  { name: "Journey", count: 6, icon: "🔁", desc: "Reviser (10) → Revision Universe (500)" },
];

const TOTAL_BADGES = ACHIEVEMENT_CATEGORIES.reduce((sum, c) => sum + c.count, 0);

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "Achievements & Gamification — 84 Badges to Unlock | FocusFlow",
    description: `Free gamified study tracker with ${TOTAL_BADGES} achievements across 10 categories. Sessions, streaks, hours, levels, focus, consistency, time-of-day, subjects, timers, journey. Share progress cards.`,
    alternates: { canonical: `${base}/achievements` },
    openGraph: { type: "website", siteName: SITE_NAME, title: "Achievements & Gamification — 84 Badges", description: `${TOTAL_BADGES} achievements across 10 categories. Streaks, hours, levels, Pomodoro mastery, journey progress. Free forever.`, url: "/achievements", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FocusFlow Achievements — 84 badges, 10 categories, shareable cards" }] },
    twitter: { card: "summary_large_image", title: "Achievements — 84 Badges", description: "10 categories, legendary tiers, shareable progress cards. Free.", images: ["/opengraph-image"] },
  };
}

const base = siteBaseUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "SoftwareApplication", "@id": `${base}/achievements#app`, name: "FocusFlow Achievements", url: `${base}/achievements`, applicationCategory: "GameApplication", operatingSystem: "Web", description: "Free gamified study tracker with 84 achievements across 10 categories. Streaks, hours, levels, Pomodoro mastery, journey progress. Shareable progress cards.", offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" }, featureList: ACHIEVEMENT_CATEGORIES.map(c => c.name).join(", ") },
    { "@type": "ItemList", "@id": `${base}/achievements#categories`, name: "Achievement Categories", numberOfItems: ACHIEVEMENT_CATEGORIES.length, itemListElement: ACHIEVEMENT_CATEGORIES.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, description: `${c.count} badges: ${c.desc}` })) },
    { "@type": "BreadcrumbList", "@id": `${base}/achievements#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }, { "@type": "ListItem", position: 2, name: "Achievements", item: `${base}/achievements` }] },
  ],
};

export default function AchievementsPublicPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav"><Link href="/" className="land-logo"><span className="land-logo-icon"><Trophy size={22} /></span>Focus<span className="glow-text">Flow</span></Link><nav className="land-links" aria-label="Primary"><Link href="/dsa">DSA</Link><Link href="/webdev">WebDev</Link><Link href="/revision">Revision</Link><Link href="/habits">Habits</Link><Link href="/progress">Analytics</Link><Link href="/achievements">Achievements</Link><Link href="/timer">Timer</Link><Link href="/login">Sign in</Link><Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link></nav></header>
        <main>
          <section className="land-hero" style={{ background: "linear-gradient(135deg, #fbbf2410 0%, transparent 60%), var(--surface)" }}><p className="land-badge"><Sparkles size={14} /> 84 badges · 10 categories · 4 rarity tiers · Share cards</p><h1>Achievements.<br /><span className="glow-text" style={{ color: "#fbbf24" }}>Level up your study.</span></h1><p className="land-sub">Gamified motivation that works. 84 badges across Sessions, Streaks, Hours, Levels, Focus, Consistency, Time-of-Day, Subjects, Timers, Journey. Rarity: Common → Legendary.</p><div className="land-cta"><Link href="/signup" className="btn btn-primary btn-lg">Start earning free <ArrowRight size={17} /></Link><Link href="/login" className="btn btn-lg">Sign in</Link></div><ul className="land-ticks"><li><Check size={14} /> Free forever</li><li><Check size={14} /> Shareable progress cards</li><li><Check size={14} /> No paywalls</li></ul></section>
          <section className="land-section" aria-labelledby="categories-h"><h2 id="categories-h">10 categories, 84 badges, 4 rarity tiers</h2><p className="land-sec-sub">Common · Rare · Epic · Legendary. Every milestone recognized.</p><div className="land-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>{ACHIEVEMENT_CATEGORIES.map((c) => (<article key={c.name} className="card land-card" style={{ maxWidth: "none" }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 28 }}>{c.icon}</span><div><h3 style={{ margin: 0, fontSize: 15 }}>{c.name}</h3><div style={{ fontSize: 11, color: "var(--muted)" }}>{c.count} badges</div></div></div><p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>{c.desc}</p></article>))}</div></section>
          <section className="land-section" aria-labelledby="rarity-h"><h2 id="rarity-h">Four rarity tiers</h2><div className="land-steps"><article className="card land-step"><span className="land-num">⚪</span><h3>Common</h3><p>First milestones — easy wins to build momentum</p></article><article className="card land-step"><span className="land-num">🔵</span><h3>Rare</h3><p>Consistency paying off — week/month milestones</p></article><article className="card land-step"><span className="land-num">🟣</span><h3>Epic</h3><p>Serious dedication — 100s of sessions, deep focus</p></article><article className="card land-step"><span className="land-num">🟡</span><h3>Legendary</h3><p>Mastery tier — 365-day streaks, 1000+ hours, all hours</p></article></div></section>
          <section className="land-final card" style={{ background: "linear-gradient(135deg, #fbbf2410 0%, transparent 60%), var(--surface)" }}><h2>Your progress, visualized</h2><p>Unlock badges, climb levels, share beautiful progress cards. Every milestone celebrated.</p><div className="land-cta land-cta-center"><Link href="/signup" className="btn btn-primary btn-lg">Start free <ArrowRight size={17} /></Link></div></section>
        </main>
        <footer className="land-footer"><p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></nav></footer>
      </div>
    </>
  );
}