import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, Check, Users, Code2, Heart, Target } from "lucide-react";
import { SITE_NAME, SITE_DESCRIPTION, siteBaseUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "About FocusFlow — Mission, Team & Philosophy",
    description: "Learn about FocusFlow's mission to make deep-focus study tools free for every student. Built by developers, for developers.",
    alternates: { canonical: `${base}/about` },
    openGraph: { type: "website", siteName: SITE_NAME, title: "About FocusFlow", description: "Mission, team, and philosophy behind the free study tracker.", url: "/about", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "About FocusFlow" }] },
    twitter: { card: "summary_large_image", title: "About FocusFlow", description: "Free study tracker built by developers, for developers.", images: ["/opengraph-image"] },
  };
}

const base = siteBaseUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "AboutPage", "@id": `${base}/about#page`, name: "About FocusFlow", description: "Mission, team, and philosophy behind the free study tracker.", url: `${base}/about` },
    { "@type": "Organization", "@id": `${base}/#organization`, name: SITE_NAME, url: `${base}/`, description: SITE_DESCRIPTION, logo: `${base}/icon-512.png`, sameAs: [], contactPoint: { "@type": "ContactPoint", contactType: "customer support", availableLanguage: ["English"] } },
    { "@type": "BreadcrumbList", "@id": `${base}/about#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }, { "@type": "ListItem", position: 2, name: "About", item: `${base}/about` }] },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav"><Link href="/" className="land-logo"><span className="land-logo-icon"><GraduationCap size={22} /></span>Focus<span className="glow-text">Flow</span></Link><nav className="land-links" aria-label="Primary"><Link href="/#features">Features</Link><Link href="/#how">How it works</Link><Link href="/#faq">FAQ</Link><Link href="/login">Sign in</Link><Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link></nav></header>
        <main>
          <section className="land-hero" style={{ textAlign: "center", padding: "60px 20px" }}>
            <p className="land-badge"><Heart size={14} /> Built by developers, for developers</p>
            <h1>About <span className="glow-text">FocusFlow</span></h1>
            <p className="land-sub" style={{ maxWidth: 700, margin: "16px auto 0" }}>We believe every student deserves powerful study tools — free, forever. No paywalls. No data selling. Just deep focus.</p>
          </section>

          <section className="land-section" aria-labelledby="mission-h">
            <h2 id="mission-h" style={{ textAlign: "center" }}>Our Mission</h2>
            <p className="land-sec-sub" style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 32px" }}>FocusFlow exists because existing tools were either too simple (just timers) or too expensive (subscription walls). We merged the best of both worlds.</p>
            <div className="land-grid">
              <article className="card land-card"><span className="land-ico"><Target size={20} /></span><h3>Free Forever</h3><p>Every feature — timer, roadmaps, planner, habits, analytics, achievements — is free. No trials, no upsells.</p></article>
              <article className="card land-card"><span className="land-ico"><Code2 size={20} /></span><h3>Open Philosophy</h3><p>Your data belongs to you. Export anytime (CSV/JSON). No vendor lock-in. Self-hostable if you want.</p></article>
              <article className="card land-card"><span className="land-ico"><Users size={20} /></span><h3>Community First</h3><p>Built with feedback from students worldwide. Feature requests welcomed. No corporate roadmap.</p></article>
            </div>
          </section>

          <section className="land-section" aria-labelledby="why-h">
            <h2 id="why-h" style={{ textAlign: "center" }}>Why FocusFlow?</h2>
            <div className="land-grid">
              <article className="card land-card"><h3>🎯 Deep Focus, Not Just Timing</h3><p>Pomodoro apps only time you. FocusFlow connects timing with subjects, roadmaps, revision, habits, and analytics — your whole study system in one place.</p></article>
              <article className="card land-card"><h3>📚 Structured Learning Paths</h3><p>DSA (18 modules) and WebDev (18 modules) roadmaps with lecture-level granularity. Always know what to study next.</p></article>
              <article className="card land-card"><h3>🔁 Spaced Repetition Built-In</h3><p>Mark topics done → they auto-enter SM-2 revision queue. Again/Hard/Easy ratings. Never forget what you learned.</p></article>
              <article className="card land-card"><h3>📊 Analytics That Drive Action</h3><p>Daily trends, weekly comparison, subject radar, 20-week hourly heatmap. See exactly where your time goes.</p></article>
              <article className="card land-card"><h3>🏆 Gamification That Works</h3><p>84 achievements across 10 categories. Streaks, levels, XP, shareable progress cards. Motivation that compounds.</p></article>
              <article className="card land-card"><h3>🔧 Works Offline, Syncs Online</h3><p>PWA with service worker. Timers run in background. Data syncs when you're back online. No interruptions.</p></article>
            </div>
          </section>

          <section className="land-section" aria-labelledby="tech-h">
            <h2 id="tech-h" style={{ textAlign: "center" }}>Tech Stack</h2>
            <p className="land-sec-sub" style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 32px" }}>Modern, performant, and built to last.</p>
            <div className="land-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", justifyItems: "center" }}>
              {["Next.js 14 (App Router)", "React 18", "TypeScript", "Tailwind CSS", "SQLite (Turso)", "Recharts", "PWA/Service Worker", "Vercel"].map((tech) => (
                <div key={tech} className="card" style={{ padding: "20px", textAlign: "center", minWidth: 180 }}><strong>{tech}</strong></div>
              ))}
            </div>
          </section>

          <section className="land-final card" style={{ textAlign: "center", background: "linear-gradient(135deg, var(--accent-soft) 0%, transparent 60%), var(--surface)" }}>
            <h2>Ready to study smarter?</h2>
            <p>Join thousands of students using FocusFlow daily. Free, powerful, and built for you.</p>
            <div className="land-cta land-cta-center"><Link href="/signup" className="btn btn-primary btn-lg">Get started free <ArrowRight size={17} /></Link></div>
          </section>
        </main>
        <footer className="land-footer"><p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></nav></footer>
      </div>
    </>
  );
}