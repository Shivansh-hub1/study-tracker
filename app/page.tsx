import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Timer, Route, Code2, CalendarCheck, Flame, BarChart3, Trophy, ArrowRight, Check, Play, Sparkles } from "lucide-react";
import { SITE_DESCRIPTION, SITE_NAME, SITE_ALIASES, CANONICAL_SITE_URL } from "@/lib/seo";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";


const FEATURES = [
  { icon: Timer, title: "Focus timer & Pomodoro", text: "Stopwatch, countdown and Pomodoro modes with lap tracking, background mode and one-tap session logging." },
  { icon: Route, title: "DSA roadmap", text: "A step-by-step Data Structures & Algorithms journey — mark topics learning, revising or mastered." },
  { icon: Code2, title: "WebDev roadmap", text: "A guided HTML-to-full-stack journey so you always know what to learn next." },
  { icon: CalendarCheck, title: "SM-2 spaced revision", text: "Due-date spaced repetition queues so you review topics right when memory retention curves dip." },
  { icon: BarChart3, title: "Progress analytics", text: "Daily trends, weekly comparisons, subject split, study-by-hour charts and XP levels." },
  { icon: Trophy, title: "Achievements & sharing", text: "Unlock achievements, climb levels and share beautiful progress cards with one click." },
];

const STEPS = [
  { n: "1", title: "Create your free account", text: "Sign up in 20 seconds — no credit card, no setup." },
  { n: "2", title: "Start a focus session", text: "Pick a subject, start the timer, log what you studied." },
  { n: "3", title: "Watch consistency grow", text: "Streaks, heatmaps and analytics show your progress." },
];

const FAQS = [
  { q: "Is FocusFlow free?", a: "Yes. Every feature — timer, roadmaps, revision and analytics — is free for learners." },
  { q: "Do I need an account?", a: "Yes, a free account keeps your sessions, streaks and roadmaps safe and synced whenever you sign in." },
  { q: "Does it work on mobile?", a: "Yes. FocusFlow is fully responsive and works in any modern mobile or desktop browser — you can even add it to your home screen." },
  { q: "Can I track DSA and web development?", a: "Yes. Guided DSA and WebDev journeys let you mark every topic as learning, revising or mastered, with revision queues so you never forget." },
  { q: "How is this different from a plain Pomodoro app?", a: "Pomodoro apps only time you. FocusFlow connects timing with subjects, roadmaps, revision and analytics — your whole study system in one place." },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FocusFlow — Free Study Tracker with Focus Timer & Roadmaps",
    description: SITE_DESCRIPTION,
    alternates: { canonical: `${CANONICAL_SITE_URL}/` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: "FocusFlow — Free Study Tracker with Focus Timer & Roadmaps",
      description: SITE_DESCRIPTION,
      url: "/",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FocusFlow — Deep-focus study tracker with timer, roadmaps and analytics" }],
    },
    twitter: { card: "summary_large_image", title: "FocusFlow — Free Study Tracker", description: SITE_DESCRIPTION, images: ["/opengraph-image"] },
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
      alternateName: SITE_ALIASES,
      description: SITE_DESCRIPTION,
      potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${CANONICAL_SITE_URL}/search?q={search_term_string}` }, "query-input": "required name=search_term_string" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${CANONICAL_SITE_URL}/#app`,
      name: SITE_NAME,
      alternateName: SITE_ALIASES,
      url: `${CANONICAL_SITE_URL}/`,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description: SITE_DESCRIPTION,
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
  // Already signed in? Go straight to the app — never show the landing/login again.
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
            <Link href="/dsa-tracker">DSA Tracker</Link>
            <Link href="/webdev-tracker">WebDev Tracker</Link>
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
            <h1>
              Track every study session.<br />
              <span className="land-hero-accent">Stay consistent. Master your craft.</span>
            </h1>
            <p className="land-sub">
              A distraction-free study operating system for developers and students. Combining Pomodoro focus timers, structured DSA &amp; WebDev roadmaps, and SM-2 spaced repetition in one quiet workspace.
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
              <li className="notion-pill"><span className="notion-dot dot-green" /> Spaced repetition (SM-2)</li>
              <li className="notion-pill"><span className="notion-dot dot-sky" /> DSA &amp; WebDev roadmaps</li>
              <li className="notion-pill"><span className="notion-dot dot-orange" /> Focus timers &amp; Pomodoro</li>
              <li className="notion-pill"><span className="notion-dot dot-teal" /> 100% free &amp; local-first</li>
            </ul>

            {/* Hero Workspace Window (Notion Document / Product Canvas) */}
            <div className="notion-hero-window" aria-hidden="true">
              <div className="notion-window-bar">
                <div className="notion-window-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="notion-window-crumb">
                  FocusFlow / ðŸ“š Data Structures &amp; Algorithms / â±ï¸ Deep Work Session
                </div>
                <div style={{ fontSize: "11px", opacity: 0.65 }}>â— Ready</div>
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
                    Current: Dynamic Programming Â· Coin Change
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
                      <h4>14-Day Study Streak</h4>
                      <span style={{ fontSize: "11.5px", color: "var(--notion-accent-orange)", fontWeight: 600 }}>ðŸ”¥ Active</span>
                    </div>
                    <div className="notion-heat-row">
                      <span className="notion-heat-sq lvl-2" title="Mon: 2.5h" />
                      <span className="notion-heat-sq lvl-3" title="Tue: 4h" />
                      <span className="notion-heat-sq lvl-2" title="Wed: 3h" />
                      <span className="notion-heat-sq lvl-1" title="Thu: 1.5h" />
                      <span className="notion-heat-sq lvl-3" title="Fri: 4.5h" />
                      <span className="notion-heat-sq lvl-3" title="Sat: 5h" />
                      <span className="notion-heat-sq lvl-2" title="Today: 3h" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="land-section" aria-labelledby="features-h">
            <h2 id="features-h">Everything you need to study smarter</h2>
            <p className="land-sec-sub">One quiet workspace for timing, planning, revising, and tracking.</p>
            <div className="land-grid">
              {features.map((f) => (
                <article key={f.title} className="land-card">
                  <div className="land-card-head">
                    <span className="land-card-icon"><f.icon size={20} /></span>
                    <h3>{f.title}</h3>
                  </div>
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
            <h2>Ready to build your streak?</h2>
            <p>Join FocusFlow today. Free, fast, and made for deep focus.</p>
            <div className="land-cta land-cta-center">
              <Link href="/signup" className="btn-notion-primary">Get started free <ArrowRight size={16} /></Link>
              <Link href="/login" className="btn-notion-secondary">Sign in</Link>
            </div>
          </section>
        </main>

        <footer className="land-footer">
          <p><strong>Focus<span className="land-logo-flow">Flow</span></strong> â€” Deep-focus study tracker.</p>
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