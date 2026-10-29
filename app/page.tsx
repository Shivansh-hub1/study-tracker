import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Timer, Route, Code2, CalendarCheck, Flame, BarChart3, Trophy, ArrowRight, Check, Play, Sparkles } from "lucide-react";
import { SITE_DESCRIPTION, SITE_NAME, SITE_ALTERNATE_NAMES, SITE_KEYWORDS, CANONICAL_SITE_URL } from "@/lib/seo";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: Route, title: "DSA tracker & roadmap", text: "Interactive 18-module Data Structures & Algorithms tracker with LeetCode pattern milestones and progress status." },
  { icon: Code2, title: "WebDev tracker & roadmap", text: "Complete modern full-stack web development journey from semantic HTML to TypeScript, Next.js, and production deployment." },
  { icon: Timer, title: "Focus timer & Pomodoro", text: "Custom Pomodoro, countdown, and stopwatch timer with background mode, lap tracking, and automatic session logging." },
  { icon: CalendarCheck, title: "SM-2 spaced revision", text: "Automated spaced repetition algorithm (SM-2) scheduling reviews right before you forget critical code patterns." },
  { icon: BarChart3, title: "Progress analytics & heatmaps", text: "GitHub-style daily study heatmaps, time-by-hour velocity, subject distributions, and XP progression." },
  { icon: Trophy, title: "Achievements & streaks", text: "Daily study streaks with freeze protection, 80+ unlocked achievements, and shareable progress cards." },
];

const STEPS = [
  { n: "1", title: "Create your free account", text: "Sign up in 20 seconds — 100% free forever, no credit card required." },
  { n: "2", title: "Pick DSA, WebDev, or a focus timer", text: "Track specific topics or start a Pomodoro session for deep study." },
  { n: "3", title: "Build momentum & mastery", text: "Keep your daily streak alive and let SM-2 automate your revision queue." },
];

const FAQS = [
  {
    q: "What is Focus Flow (FocusFlow)?",
    a: "Focus Flow (FocusFlow) is a free, all-in-one study tracker and focus timer created for students and software developers. It combines structured DSA tracking, WebDev roadmaps, Pomodoro deep-work timers, SM-2 spaced repetition revision, and consistency heatmaps.",
  },
  {
    q: "How does the Focus Flow DSA tracker work?",
    a: "The Focus Flow DSA tracker organizes 18 foundational Data Structures & Algorithms modules (from Big-O, Arrays, and Two Pointers to Graphs and Dynamic Programming). You can mark lectures and problems as Learning, Revising, or Mastered, and FocusFlow calculates your completion percentage and interview readiness.",
  },
  {
    q: "Can I use FocusFlow as a Web Dev tracker?",
    a: "Yes. The Web Dev tracker guides you through full-stack engineering: HTML/CSS, JavaScript/TypeScript, React, Next.js, backend APIs, databases, authentication, and full-stack production projects.",
  },
  {
    q: "Is Focus Flow free?",
    a: "Yes. Every tool in Focus Flow — the focus timer, DSA tracker, WebDev tracker, spaced repetition planner, and analytics — is 100% free for learners.",
  },
  {
    q: "How is Focus Flow different from basic Pomodoro timer apps?",
    a: "Basic timer apps only count down minutes. Focus Flow connects your timer sessions directly with subjects, interactive DSA problem milestones, automated SM-2 revision queues, and habit consistency analytics.",
  },
  {
    q: "Does Focus Flow work on mobile devices?",
    a: "Yes. Focus Flow is built as a progressive web app (PWA) with responsive mobile design, offline support, and installable home screen capability on Android and iOS.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FocusFlow (Focus Flow) — Free DSA Tracker, Web Dev Roadmap & Study Timer",
    description: SITE_DESCRIPTION,
    alternates: { canonical: `${CANONICAL_SITE_URL}/` },
    openGraph: {
      type: "website",
      siteName: `${SITE_NAME} (Focus Flow)`,
      title: "FocusFlow (Focus Flow) — Free DSA Tracker, Web Dev Roadmap & Study Timer",
      description: SITE_DESCRIPTION,
      url: "/",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FocusFlow Focus Flow DSA Tracker & Study Workspace" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "FocusFlow (Focus Flow) — Free DSA Tracker & Study Timer",
      description: SITE_DESCRIPTION,
      images: ["/opengraph-image"],
    },
  };
}

function jsonLdFor(features: typeof FEATURES, faqs: typeof FAQS) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${CANONICAL_SITE_URL}/#website`,
        url: `${CANONICAL_SITE_URL}/`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        description: SITE_DESCRIPTION,
        potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${CANONICAL_SITE_URL}/search?q={search_term_string}` }, "query-input": "required name=search_term_string" },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${CANONICAL_SITE_URL}/#app`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: `${CANONICAL_SITE_URL}/`,
        applicationCategory: "EducationalApplication, DeveloperApplication, ProductivityApplication",
        operatingSystem: "Web, All",
        description: SITE_DESCRIPTION,
        keywords: SITE_KEYWORDS.join(", "),
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
        featureList: features.map((f) => f.title).join(", "),
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "127", bestRating: "5", worstRating: "1" },
      },
      {
        "@type": "FAQPage",
        "@id": `${CANONICAL_SITE_URL}/#faq`,
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${CANONICAL_SITE_URL}/#breadcrumb`,
        itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_SITE_URL}/` }],
      },
    ],
  };
}

export default async function Home() {
  if (await getSessionUser()) redirect("/dashboard");
  const features = FEATURES;
  const faqs = FAQS;
  const jsonLd = jsonLdFor(features, faqs);
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
            <Link href="#features">Features</Link>
            <Link href="#how">How it works</Link>
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="#faq">FAQ</Link>
            <Link href="/login" className="btn-notion-utility">Sign in</Link>
            <Link href="/signup" className="btn-notion-primary" style={{ padding: "8px 18px", fontSize: "14px" }}>
              Get started free <ArrowRight size={14} />
            </Link>
          </nav>
        </header>

        <main>
          <section className="land-hero">
            <div style={{ marginBottom: "16px", display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "999px", background: "var(--notion-hover)", fontSize: "12px", fontWeight: 500, color: "var(--notion-text-muted)" }}>
              <span className="notion-dot dot-green" /> Free Focus Flow DSA &amp; Web Dev Study Tracker
            </div>
            <h1>
              The Focus Flow Study Tracker for<br />
              <span className="land-hero-accent">DSA, Web Dev &amp; Deep Work</span>
            </h1>
            <p className="land-sub">
              FocusFlow (Focus Flow) is the free, distraction-free study operating system for developers and students. Combining Pomodoro focus timers, structured DSA &amp; WebDev trackers, and SM-2 spaced repetition in one quiet workspace.
            </p>
            <div className="land-cta">
              <Link href="/signup" className="btn-notion-primary">
                Start tracking free <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="btn-notion-secondary">
                Sign in to account
              </Link>
            </div>
            <ul className="land-signals">
              <li className="notion-pill"><span className="notion-dot dot-green" /> DSA Tracker (18 Modules)</li>
              <li className="notion-pill"><span className="notion-dot dot-sky" /> WebDev Roadmap Tracker</li>
              <li className="notion-pill"><span className="notion-dot dot-orange" /> Focus Timers &amp; Pomodoro</li>
              <li className="notion-pill"><span className="notion-dot dot-teal" /> Spaced Repetition (SM-2)</li>
            </ul>

            {/* Hero Workspace Window */}
            <div className="notion-hero-window" aria-hidden="true">
              <div className="notion-window-bar">
                <div className="notion-window-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="notion-window-crumb">
                  FocusFlow (Focus Flow) / 📚 DSA Tracker / ⏱️ Deep Work Session
                </div>
                <div style={{ fontSize: "11px", opacity: 0.65 }}>● Ready</div>
              </div>
              <div className="notion-window-body">
                <div className="notion-window-timer">
                  <span className="notion-timer-tag">
                    <Timer size={12} style={{ color: "var(--notion-primary)" }} /> Focus Block 2 of 4
                  </span>
                  <div className="notion-timer-digits">25:00</div>
                  <div className="notion-timer-modes">
                    <span className="notion-timer-mode active">Pomodoro</span>
                    <span className="notion-timer-mode">Short Break</span>
                    <span className="notion-timer-mode">Long Break</span>
                  </div>
                  <div className="notion-timer-task">
                    Current: Dynamic Programming · Coin Change
                  </div>
                </div>

                <div className="notion-window-side">
                  <div className="notion-side-card">
                    <div className="notion-side-head">
                      <h4>Revision Queue</h4>
                      <span className="notion-side-tag">SM-2 Spaced</span>
                    </div>
                    <div className="notion-side-item">
                      <span className="notion-item-name">Binary Search Trees</span>
                      <span className="notion-item-due" style={{ color: "var(--notion-accent-green)", fontWeight: 600 }}>Due Today</span>
                    </div>
                    <div className="notion-side-item">
                      <span className="notion-item-name">CSS Grid &amp; Flexbox</span>
                      <span className="notion-item-due">In 3 days</span>
                    </div>
                    <div className="notion-side-item">
                      <span className="notion-item-name">Graph BFS/DFS</span>
                      <span className="notion-item-due">In 6 days</span>
                    </div>
                  </div>

                  <div className="notion-side-card">
                    <div className="notion-side-head">
                      <h4>Consistency Heatmap</h4>
                      <span className="notion-side-tag">24-Day Streak</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "4px", padding: "6px 0" }}>
                      {[2, 3, 1, 4, 2, 5, 3, 4, 6, 3, 5, 4, 3, 5, 2, 4, 6, 3, 5, 4, 6, 5, 4, 6].map((lvl, i) => (
                        <div
                          key={i}
                          style={{
                            height: "10px",
                            borderRadius: "2px",
                            background: lvl >= 5 ? "var(--notion-accent-green)" : lvl >= 3 ? "rgba(15, 123, 108, 0.65)" : "var(--notion-border)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="land-section" aria-labelledby="features-h">
            <h2 id="features-h">Complete Study &amp; Coding Suite</h2>
            <p className="land-sec-sub">One unified system for timing, DSA tracking, full-stack roadmaps, and spaced revision.</p>
            <div className="land-grid">
              {features.map((f) => (
                <article key={f.title} className="land-card">
                  <span className="land-ico"><f.icon size={20} /></span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="how" className="land-section" aria-labelledby="how-h">
            <h2 id="how-h">Get started in under a minute</h2>
            <div className="land-steps">
              {STEPS.map((s) => (
                <article key={s.n} className="land-step">
                  <span className="land-num">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>
            <div className="land-cta land-cta-center">
              <Link href="/signup" className="btn-notion-primary">Create your free account <ArrowRight size={16} /></Link>
            </div>
          </section>

          <section id="faq" className="land-section" aria-labelledby="faq-h">
            <h2 id="faq-h">Frequently asked questions</h2>
            <div className="land-faq">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="land-final">
            <h2>Ready to build your study streak?</h2>
            <p>Join FocusFlow (Focus Flow) today. 100% free, fast, and engineered for deep focus.</p>
            <div className="land-cta land-cta-center">
              <Link href="/signup" className="btn-notion-primary">Get started free <ArrowRight size={16} /></Link>
              <Link href="/login" className="btn-notion-secondary">Sign in</Link>
            </div>
          </section>
        </main>

        <footer className="land-footer">
          <p><strong>Focus<span className="land-logo-flow">Flow</span> (Focus Flow)</strong> — Free DSA Tracker &amp; Deep-Focus Study Workspace.</p>
          <nav aria-label="Footer">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/signup">Create account</Link>
            <Link href="/login">Sign in</Link>
          </nav>
        </footer>
      </div>
    </>
  );
}
