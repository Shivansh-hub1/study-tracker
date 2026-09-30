import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Check, ArrowRight, TrendingUp, Award, Clock, Trophy } from "lucide-react";
import { SITE_DESCRIPTION, SITE_NAME, siteBaseUrl } from "@/lib/seo";

const PROGRESS_FEATURES = [
  { icon: TrendingUp, title: "Daily trend (30 days)", text: "Minutes or sessions toggle. Gradient area chart with hover tooltips. Spot gaps instantly." },
  { icon: Award, title: "Weekly comparison (12 weeks)", text: "Bar chart with week-over-week delta percentages. See momentum at a glance." },
  { icon: Clock, title: "Monthly totals (6 months)", text: "Dual-axis line chart: focus time + session count. Correlation insight built in." },
  { icon: BarChart3, title: "Subject split (pie + radar)", text: "Pie chart for allocation, radar chart for balance. 5+ subjects unlocks radar." },
  { icon: Trophy, title: "Hourly heatmap (20 weeks)", text: "GitHub-style contribution grid. Color intensity = focus minutes. Find your peak hours." },
  { icon: Check, title: "Timer type breakdown", text: "Pomodoro vs timer vs stopwatch vs manual. See which mode drives your progress." },
];

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "Progress Analytics — Study Charts, Heatmaps & Insights | FocusFlow",
    description: "Free progress analytics: daily/weekly/monthly trends, subject radar, hourly heatmap, timer type breakdown. Visualize your consistency. No credit card.",
    alternates: { canonical: `${base}/progress` },
    openGraph: { type: "website", siteName: SITE_NAME, title: "Progress Analytics — Study Charts & Heatmaps", description: "Daily trends, weekly comparison, subject radar, 20-week heatmap, timer breakdown. Free forever.", url: "/progress", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FocusFlow Progress Analytics — Charts, heatmaps, insights" }] },
    twitter: { card: "summary_large_image", title: "Progress Analytics", description: "Daily/weekly/monthly charts, subject radar, hourly heatmap. Free.", images: ["/opengraph-image"] },
  };
}

const base = siteBaseUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "SoftwareApplication", "@id": `${base}/progress#app`, name: "FocusFlow Analytics", url: `${base}/progress`, applicationCategory: "EducationalApplication", operatingSystem: "Web", description: "Free study analytics with daily/weekly/monthly trends, subject radar, 20-week hourly heatmap, and timer type breakdown.", offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" }, featureList: PROGRESS_FEATURES.map(f => f.title).join(", ") },
    { "@type": "BreadcrumbList", "@id": `${base}/progress#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }, { "@type": "ListItem", position: 2, name: "Progress Analytics", item: `${base}/progress` }] },
  ],
};

export default function ProgressPublicPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav"><Link href="/" className="land-logo"><span className="land-logo-icon"><BarChart3 size={22} /></span>Focus<span className="glow-text">Flow</span></Link><nav className="land-links" aria-label="Primary"><Link href="/dsa">DSA</Link><Link href="/webdev">WebDev</Link><Link href="/revision">Revision</Link><Link href="/habits">Habits</Link><Link href="/progress">Analytics</Link><Link href="/achievements">Achievements</Link><Link href="/timer">Timer</Link><Link href="/login">Sign in</Link><Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link></nav></header>
        <main>
          <section className="land-hero" style={{ background: "linear-gradient(135deg, #6366f110 0%, transparent 60%), var(--surface)" }}><p className="land-badge"><TrendingUp size={14} /> Daily/weekly/monthly · Subject radar · 20-week heatmap</p><h1>Progress Analytics.<br /><span className="glow-text" style={{ color: "#6366f1" }}>See your growth.</span></h1><p className="land-sub">Comprehensive study analytics: 30-day trends, 12-week comparison, 6-month totals, subject balance radar, 20-week hourly heatmap. All free.</p><div className="land-cta"><Link href="/signup" className="btn btn-primary btn-lg">View analytics free <ArrowRight size={17} /></Link><Link href="/login" className="btn btn-lg">Sign in</Link></div><ul className="land-ticks"><li><Check size={14} /> Free forever</li><li><Check size={14} /> No data limits</li><li><Check size={14} /> Export CSV/JSON</li></ul></section>
          <section className="land-section" aria-labelledby="features-h"><h2 id="features-h">Every chart you need, zero setup</h2><p className="land-sec-sub">Just study. Charts build themselves.</p><div className="land-grid">{PROGRESS_FEATURES.map((f) => (<article key={f.title} className="card land-card"><span className="land-ico"><f.icon size={20} /></span><h3>{f.title}</h3><p>{f.text}</p></article>))}</div></section>
          <section className="land-final card" style={{ background: "linear-gradient(135deg, #6366f110 0%, transparent 60%), var(--surface)" }}><h2>Your data, visualized</h2><p>Join thousands tracking progress with beautiful, actionable charts. Free, private, exportable.</p><div className="land-cta land-cta-center"><Link href="/signup" className="btn btn-primary btn-lg">Start free <ArrowRight size={17} /></Link></div></section>
        </main>
        <footer className="land-footer"><p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></nav></footer>
      </div>
    </>
  );
}