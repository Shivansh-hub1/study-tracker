import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, Timer, Route, Code2, CalendarCheck, Flame, BarChart3, Trophy, ChevronRight, Check } from "lucide-react";
import { SITE_NAME, CANONICAL_SITE_URL, AUTHOR_INFO } from "@/lib/seo";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return {
    title: "FocusFlow — Your Free Study Tracker & Focus Timer Online",
    description: "FocusFlow (Your Study Tracker) is the #1 free study tracker for students and developers. Pomodoro focus timers, DSA & WebDev roadmaps, SM-2 spaced repetition revision, and progress analytics.",
    keywords: [
      "study tracker",
      "studytracker",
      "focus flow",
      "focusflow",
      "focus flow tracker",
      "focusflow tracker",
      "your study tracker",
      "yourstudytracker",
      "free study tracker",
      "online study tracker",
      "developer study tracker",
      "pomodoro study timer"
    ],
    alternates: { canonical: `${CANONICAL_SITE_URL}/study-tracker` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: "FocusFlow — Your Free Study Tracker & Focus Timer Online",
      description: "Everything you need to study consistently: focus timers, subject logging, curriculum roadmaps, and streak heatmaps.",
      url: `${CANONICAL_SITE_URL}/study-tracker`,
      images: [{ url: `${CANONICAL_SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "FocusFlow - Your Study Tracker" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "FocusFlow — Your Study Tracker",
      description: "Free study tracker with focus timers, developer roadmaps, and spaced repetition.",
      images: [`${CANONICAL_SITE_URL}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

const FAQS = [
  {
    q: "What is FocusFlow (Your Study Tracker)?",
    a: "FocusFlow is a free, modern study tracker designed for deep work. It combines Pomodoro timers, subject tracking, structured developer roadmaps (DSA & WebDev), SM-2 spaced repetition flashcards, and consistency heatmaps into one unified workspace."
  },
  {
    q: "Is FocusFlow 100% free to use?",
    a: "Yes. Every single tool, roadmap, timer block, and analytics feature in FocusFlow is completely free for learners with no ads and no credit card required."
  },
  {
    q: "How does the focus timer integrate with my subjects?",
    a: "Unlike standalone clock apps, FocusFlow lets you link your timer directly to your active subject or roadmap topic. Completed sessions log automatically into your database, updating your streak, XP level, and progress heatmaps."
  },
  {
    q: "What is spaced repetition in FocusFlow?",
    a: "FocusFlow implements the SuperMemo SM-2 algorithm. When you mark topics as mastered, the app calculates the ideal review intervals (e.g. 1 day, 3 days, 7 days) and notifies you right when your memory curve dips."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${CANONICAL_SITE_URL}/study-tracker#page`,
      name: "FocusFlow — Your Free Study Tracker & Focus Timer",
      description: "Complete study operating system for students and developers.",
      url: `${CANONICAL_SITE_URL}/study-tracker`,
      isPartOf: { "@id": `${CANONICAL_SITE_URL}/#website` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${CANONICAL_SITE_URL}/study-tracker#app`,
      name: "FocusFlow",
      alternateName: ["Focus Flow", "FocusFlow Tracker", "Focus Flow Tracker", "Your Study Tracker", "YourStudyTracker", "Study Tracker", "StudyTracker"],
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: `${CANONICAL_SITE_URL}/study-tracker`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: "Focus timer, Pomodoro, DSA roadmap, WebDev roadmap, Spaced repetition revision, Consistency heatmap, XP rewards",
    },
    {
      "@type": "FAQPage",
      "@id": `${CANONICAL_SITE_URL}/study-tracker#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL_SITE_URL}/study-tracker#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Study Tracker", item: `${CANONICAL_SITE_URL}/study-tracker` },
      ],
    },
  ],
};

export default function StudyTrackerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav">
          <Link href="/" className="land-logo">
            <span className="land-logo-icon"><GraduationCap size={18} /></span>
            Focus<span className="land-logo-flow">Flow</span>
          </Link>
          <nav className="land-links" aria-label="Primary">
            <Link href="/dsa-tracker">DSA Tracker</Link>
            <Link href="/webdev-tracker">WebDev Tracker</Link>
            <Link href="/study-tracker" className="active">Study Tracker</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/login" className="btn-notion-utility">Sign in</Link>
            <Link href="/signup" className="btn-notion-primary" style={{ padding: "8px 18px", fontSize: "14px" }}>
              Start tracking free <ArrowRight size={14} />
            </Link>
          </nav>
        </header>

        <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px 80px" }}>
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", marginBottom: 28 }}>
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={14} />
            <span style={{ color: "var(--fg)", fontWeight: 600 }}>Study Tracker</span>
          </nav>

          <section className="land-hero" style={{ textAlign: "center", padding: "10px 0 40px" }}>
            <p className="land-badge"><Timer size={14} /> The All-In-One Study Ecosystem</p>
            <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 800, margin: "14px 0 16px", color: "var(--fg)", lineHeight: 1.15 }}>
              Your Free <span className="land-hero-accent">Study Tracker</span> &amp; Focus Timer
            </h1>
            <p className="land-sub" style={{ maxWidth: 720, margin: "0 auto 28px", color: "var(--muted)", fontSize: 16, lineHeight: 1.6 }}>
              Whether you call it <b>Focus Flow</b>, <b>FocusFlow Tracker</b>, or <b>Your Study Tracker</b> — this is your quiet, distraction-free environment to track study hours, build streaks, and master engineering.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/signup" className="btn-notion-primary" style={{ padding: "12px 28px", fontSize: 15 }}>
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="btn-notion-secondary" style={{ padding: "12px 24px", fontSize: 15 }}>
                Sign In
              </Link>
            </div>
          </section>

          {/* Feature Showcase Grid */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, margin: "40px 0" }}>
            <div className="card" style={{ padding: 24, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <Timer size={22} style={{ color: "var(--notion-primary)", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>Pomodoro &amp; Focus Timers</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Stopwatch, countdown, and customizable Pomodoro cycles (25/5, 50/10) with background tab counting and audio notifications.
              </p>
            </div>

            <div className="card" style={{ padding: 24, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <Route size={22} style={{ color: "#10b981", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>Curriculum Roadmaps</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Built-in 18-module journeys for Data Structures &amp; Algorithms and Full-Stack Web Development so you always know what to study.
              </p>
            </div>

            <div className="card" style={{ padding: 24, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <CalendarCheck size={22} style={{ color: "#0ea5e9", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>SM-2 Spaced Repetition</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Automated spaced revision queues calculate recall intervals so you review hard topics right before forgetting them.
              </p>
            </div>

            <div className="card" style={{ padding: 24, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <Flame size={22} style={{ color: "#f97316", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>Streaks &amp; Heatmaps</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Visual 20-week consistency heatmap, day streaks, and streak freeze protections keep your study momentum strong.
              </p>
            </div>

            <div className="card" style={{ padding: 24, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <BarChart3 size={22} style={{ color: "#ec4899", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>Deep Analytics</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Analyze hourly study distributions, subject time splits, and week-over-week deltas to discover your peak cognitive hours.
              </p>
            </div>

            <div className="card" style={{ padding: 24, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <Trophy size={22} style={{ color: "#f59e0b", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>XP &amp; Achievements</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Gamified XP system with 84 unlockable badges, level titles, theme customizations, and exportable progress cards.
              </p>
            </div>
          </section>

          {/* FAQs */}
          <section style={{ margin: "60px 0" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginBottom: 20 }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FAQS.map((f, i) => (
                <div key={i} className="card" style={{ padding: "20px 24px", border: "1px solid var(--border)", background: "var(--surface)" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>{f.q}</h3>
                  <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="card" style={{ padding: 40, textAlign: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, color: "var(--fg)" }}>
              Start Tracking Your Studies on FocusFlow Today
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 14.5, maxWidth: 560, margin: "0 auto 24px" }}>
              Join learners and software developers leveling up their study consistency with 100% free, private tracking.
            </p>
            <Link href="/signup" className="btn-notion-primary" style={{ padding: "12px 28px", fontSize: 15 }}>
              Open Your Study Tracker <ArrowRight size={16} />
            </Link>
          </section>
        </main>
      </div>
    </>
  );
}
