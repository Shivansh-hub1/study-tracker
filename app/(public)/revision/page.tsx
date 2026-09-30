import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Check, ArrowRight, Brain, Clock, RotateCcw, Trophy } from "lucide-react";
import { SITE_DESCRIPTION, SITE_NAME, siteBaseUrl } from "@/lib/seo";

const REVISION_FEATURES = [
  { icon: Brain, title: "Spaced repetition (SM-2)", text: "Again → 1 day, Hard → 3 days, Easy → 7 days. Intervals grow exponentially as you master topics." },
  { icon: CalendarClock, title: "Unified revision queue", text: "DSA + WebDev topics due today in one place. Filter by journey or see everything at once." },
  { icon: Clock, title: "Session mode", text: "Power through all due topics in one focused session. Progress bar, keyboard shortcuts, zero friction." },
  { icon: RotateCcw, title: "Auto-queued from journeys", text: "Mark a DSA/WebDev topic done — it lands in revision automatically. No manual entry needed." },
  { icon: Check, title: "Overdue highlighting", text: "Topics past due show in red. Weekend catch-up sessions keep you on track." },
  { icon: Trophy, title: "Revision achievements", text: "Reviser (10), Revision Machine (25), Revision King (50), Revision God (100) — track your mastery." },
];

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "Smart Revision Planner — Spaced Repetition for DSA & WebDev | FocusFlow",
    description: "Free spaced repetition planner. SM-2 algorithm auto-queues DSA & WebDev topics. Unified revision sessions, overdue tracking, progress analytics. No credit card.",
    alternates: { canonical: `${base}/revision` },
    openGraph: { type: "website", siteName: SITE_NAME, title: "Smart Revision Planner — Spaced Repetition", description: "SM-2 algorithm auto-queues DSA & WebDev topics. Unified sessions, overdue tracking. Free forever.", url: "/revision", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FocusFlow Revision Planner — Spaced repetition for DSA & WebDev" }] },
    twitter: { card: "summary_large_image", title: "Smart Revision Planner", description: "Spaced repetition for DSA & WebDev. SM-2 algorithm, unified queue, session mode. Free.", images: ["/opengraph-image"] },
  };
}

const base = siteBaseUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "SoftwareApplication", "@id": `${base}/revision#app`, name: "FocusFlow Revision Planner", url: `${base}/revision`, applicationCategory: "EducationalApplication", operatingSystem: "Web", description: "Free spaced repetition planner with SM-2 algorithm. Auto-queues DSA & WebDev topics. Unified revision sessions, overdue tracking, progress analytics.", offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" }, featureList: REVISION_FEATURES.map(f => f.title).join(", ") },
    { "@type": "HowTo", "@id": `${base}/revision#howto`, name: "How to use spaced repetition in FocusFlow", description: "Complete topics in DSA/WebDev journeys → they auto-enter revision queue → rate Again/Hard/Easy → intervals grow", step: [{ "@type": "HowToStep", position: 1, name: "Complete a topic", text: "Finish a lecture or module in your DSA or WebDev journey" }, { "@type": "HowToStep", position: 2, name: "Auto-queued", text: "Topic enters revision queue with optimal interval" }, { "@type": "HowToStep", position: 3, name: "Rate honestly", text: "Again (1 day), Hard (3 days), Easy (7 days) — intervals grow with mastery" }, { "@type": "HowToStep", position: 4, name: "Session mode", text: "Power through all due topics in one focused revision session" }] },
    { "@type": "BreadcrumbList", "@id": `${base}/revision#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }, { "@type": "ListItem", position: 2, name: "Revision Planner", item: `${base}/revision` }] },
  ],
};

export default function RevisionPublicPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav"><Link href="/" className="land-logo"><span className="land-logo-icon"><CalendarClock size={22} /></span>Focus<span className="glow-text">Flow</span></Link><nav className="land-links" aria-label="Primary"><Link href="/dsa">DSA</Link><Link href="/webdev">WebDev</Link><Link href="/revision">Revision</Link><Link href="/habits">Habits</Link><Link href="/progress">Analytics</Link><Link href="/achievements">Achievements</Link><Link href="/timer">Timer</Link><Link href="/login">Sign in</Link><Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link></nav></header>
        <main>
          <section className="land-hero" style={{ background: "linear-gradient(135deg, #f59e0b10 0%, transparent 60%), var(--surface)" }}><p className="land-badge"><Brain size={14} /> SM-2 algorithm · Unified queue · Session mode</p><h1>Smart Revision.<br /><span className="glow-text" style={{ color: "#f59e0b" }}>Never forget.</span></h1><p className="land-sub">Spaced repetition planner that auto-queues topics from your DSA & WebDev journeys. SM-2 algorithm. One-click sessions. Overdue tracking. Free forever.</p><div className="land-cta"><Link href="/signup" className="btn btn-primary btn-lg">Start revising free <ArrowRight size={17} /></Link><Link href="/login" className="btn btn-lg">Sign in</Link></div><ul className="land-ticks"><li><Check size={14} /> Free forever</li><li><Check size={14} /> Auto-queued from journeys</li><li><Check size={14} /> Works offline</li></ul></section>
          <section className="land-section" aria-labelledby="features-h"><h2 id="features-h">How it works</h2><p className="land-sec-sub">Zero manual entry. Topics flow from journeys → revision → mastery.</p><div className="land-grid">{REVISION_FEATURES.map((f) => (<article key={f.title} className="card land-card"><span className="land-ico"><f.icon size={20} /></span><h3>{f.title}</h3><p>{f.text}</p></article>))}</div></section>
          <section className="land-section" aria-labelledby="how-h"><h2 id="how-h">The SM-2 algorithm in 3 ratings</h2><div className="land-steps"><article className="card land-step"><span className="land-num">1</span><h3>Again</h3><p>Forgot it → back tomorrow (1 day)</p></article><article className="card land-step"><span className="land-num">2</span><h3>Hard</h3><p>Struggled → back in 3 days</p></article><article className="card land-step"><span className="land-num">3</span><h3>Easy</h3><p>Nailed it → back in 7 days (grows to 14, 30, 60…)</p></article></div></section>
          <section className="land-final card" style={{ background: "linear-gradient(135deg, #f59e0b10 0%, transparent 60%), var(--surface)" }}><h2>Stop forgetting what you learned</h2><p>Join thousands using spaced repetition to retain DSA & WebDev concepts permanently. Free.</p><div className="land-cta land-cta-center"><Link href="/signup" className="btn btn-primary btn-lg">Start free <ArrowRight size={17} /></Link></div></section>
        </main>
        <footer className="land-footer"><p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></nav></footer>
      </div>
    </>
  );
}