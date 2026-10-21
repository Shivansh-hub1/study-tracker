import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, Heart, Target, Code2, Users, ChevronRight, HelpCircle } from "lucide-react";
import { SITE_NAME, SITE_DESCRIPTION, CANONICAL_SITE_URL, AUTHOR_INFO } from "@/lib/seo";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return {
    title: "About — Mission, Creator & Engineering Philosophy",
    description: "Learn why FocusFlow was built: a distraction-free, 100% free study ecosystem for developers and students with Pomodoro timers, DSA roadmaps, and spaced repetition.",
    alternates: { canonical: `${CANONICAL_SITE_URL}/about` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: "About FocusFlow — Mission & Creator",
      description: "Distraction-free, 100% free study ecosystem for developers and students. Built by developers, for developers.",
      url: `${CANONICAL_SITE_URL}/about`,
      images: [{ url: `${CANONICAL_SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "About FocusFlow" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "About FocusFlow",
      description: "Free study tracker built by developers, for developers.",
      images: [`${CANONICAL_SITE_URL}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

const ABOUT_FAQS = [
  {
    q: "Why is FocusFlow completely free?",
    a: "Education and focused study tools shouldn't be locked behind paywalls. FocusFlow was built out of frustration with expensive subscription timers and fragmented tools. It is free forever with no ads and no upsells."
  },
  {
    q: "Who builds and maintains FocusFlow?",
    a: "FocusFlow is built and maintained by Shivansh, a full-stack software engineer who uses the application daily for DSA sprints, system design prep, and spaced repetition learning."
  },
  {
    q: "How does FocusFlow keep user data private?",
    a: "Your study history and timer sessions are stored locally in your browser SQLite database. No third-party trackers, telemetry, or advertising pixels exist in the codebase."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${CANONICAL_SITE_URL}/about#page`,
      name: "About FocusFlow",
      description: "Mission, creator, and engineering philosophy behind the free study tracker.",
      url: `${CANONICAL_SITE_URL}/about`,
    },
    {
      "@type": "Person",
      "@id": `${CANONICAL_SITE_URL}/#author`,
      name: AUTHOR_INFO.name,
      jobTitle: AUTHOR_INFO.role,
      url: AUTHOR_INFO.url,
      description: AUTHOR_INFO.bio,
    },
    {
      "@type": "Organization",
      "@id": `${CANONICAL_SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${CANONICAL_SITE_URL}/`,
      description: SITE_DESCRIPTION,
      logo: `${CANONICAL_SITE_URL}/icon-512.webp`,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL_SITE_URL}/about#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "About", item: `${CANONICAL_SITE_URL}/about` },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${CANONICAL_SITE_URL}/about#faq`,
      mainEntity: ABOUT_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav">
          <Link href="/" className="land-logo">
            <span className="land-logo-icon"><GraduationCap size={22} /></span>
            Focus<span className="glow-text">Flow</span>
          </Link>
          <nav className="land-links" aria-label="Primary">
            <Link href="/dsa-tracker">DSA Tracker</Link>
            <Link href="/webdev-tracker">WebDev Tracker</Link>
            <Link href="/study-tracker">Study Tracker</Link>
            <Link href="/about" className="active">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link>
          </nav>
        </header>

        <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", marginBottom: 28 }}>
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={14} />
            <span style={{ color: "var(--fg)", fontWeight: 600 }}>About</span>
          </nav>

          <section className="land-hero" style={{ textAlign: "center", padding: "20px 0 40px" }}>
            <p className="land-badge"><Heart size={14} /> Built by developers, for developers</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, margin: "12px 0", color: "var(--fg)" }}>
              About <span className="glow-text">FocusFlow</span>
            </h1>
            <p className="land-sub" style={{ maxWidth: 680, margin: "0 auto", color: "var(--muted)" }}>
              We believe every student and engineer deserves powerful study tools — fast, private, and 100% free. No paywalls. No data selling. Just deep focus.
            </p>
          </section>

          {/* Author Bio Section */}
          <section className="card" style={{ padding: 28, marginBottom: 40, display: "flex", alignItems: "flex-start", gap: 20, background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.22)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 24, flexShrink: 0 }}>
              S
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--fg)" }}>Meet the Creator: {AUTHOR_INFO.name}</h2>
                <span className="badge" style={{ fontSize: 11 }}>{AUTHOR_INFO.role}</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 12px" }}>
                {AUTHOR_INFO.bio}
              </p>
              <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                <a href={AUTHOR_INFO.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                  GitHub Profile →
                </a>
                <Link href="/blog" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                  Read Study Guides →
                </Link>
              </div>
            </div>
          </section>

          <section className="land-section" aria-labelledby="mission-h">
            <h2 id="mission-h" style={{ textAlign: "center", fontSize: 24, marginBottom: 12 }}>Our Mission</h2>
            <p className="land-sec-sub" style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 32px" }}>
              Most study apps are either toy timers or bloated subscription traps. FocusFlow brings professional engineering workflows — modular roadmaps, spaced repetition algorithms, and telemetry — into a free app.
            </p>
            <div className="land-grid">
              <article className="card land-card">
                <span className="land-ico"><Target size={20} /></span>
                <h3>Free Forever</h3>
                <p>Every feature — timer, roadmaps, spaced revision queues, analytics, achievements — is free. No trials, no upsells.</p>
              </article>
              <article className="card land-card">
                <span className="land-ico"><Code2 size={20} /></span>
                <h3>Open & Private</h3>
                <p>Your study history is stored in local SQLite/IndexedDB. Export anytime as CSV or JSON. Zero tracking.</p>
              </article>
              <article className="card land-card">
                <span className="land-ico"><Users size={20} /></span>
                <h3>Built for Deep Work</h3>
                <p>Designed around real engineering rhythms: 50-minute blocks, dark theme by default, and keyboard shortcuts.</p>
              </article>
            </div>
          </section>

          {/* About FAQs */}
          <section style={{ margin: "48px 0" }} aria-labelledby="faq-h">
            <h2 id="faq-h" style={{ textAlign: "center", fontSize: 24, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <HelpCircle size={22} className="glow-text" /> Frequently Asked Questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ABOUT_FAQS.map((faq, idx) => (
                <details key={idx} className="card" style={{ padding: 18, borderRadius: 10 }}>
                  <summary style={{ fontWeight: 600, cursor: "pointer", fontSize: 15, color: "var(--fg)" }}>
                    {faq.q}
                  </summary>
                  <p style={{ marginTop: 10, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </main>

        <footer className="land-footer">
          <p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p>
          <nav aria-label="Footer">
            <Link href="/about">About</Link>
            <Link href="/dsa-tracker">DSA Tracker</Link>
            <Link href="/webdev-tracker">WebDev Tracker</Link>
            <Link href="/study-tracker">Study Tracker</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/signup">Create account</Link>
            <Link href="/login">Sign in</Link>
          </nav>
        </footer>
      </div>
    </>
  );
}
