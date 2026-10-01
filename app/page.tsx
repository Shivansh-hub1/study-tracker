import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Timer, Route, Code2, CalendarCheck, Flame, BarChart3, Trophy, ArrowRight, Check } from "lucide-react";
import { SITE_DESCRIPTION, SITE_NAME, siteBaseUrl } from "@/lib/seo";
import { getDb, featureOn } from "@/lib/db";

export const dynamic = "force-dynamic";

async function flagPair() {
  try {
    const db = await getDb();
    const [habits, planner] = await Promise.all([featureOn(db, "habits"), featureOn(db, "planner")]);
    return { habits, planner };
  } catch {
    return { habits: true, planner: true };
  }
}

function contentFor(habits: boolean, planner: boolean) {
  const features = FEATURES.map((f) => {
    if (!planner && f.title === "Smart revision planner") return { ...f, text: "Due-date revision queues and checklists keep nothing slipping." };
    if (!habits && f.title === "Habits & streaks") return { ...f, title: "Streaks & consistency", text: "Study streaks with freeze days and a consistency heatmap that keeps you honest." };
    return f;
  });
  const heroBits: string[] = ["a focus timer", "DSA & WebDev roadmaps", planner ? "a revision planner" : "revision queues"];
  if (habits) heroBits.push("daily habits");
  heroBits.push("analytics");
  const sub = `FocusFlow combines ${heroBits.slice(0, -1).join(", ")} and ${heroBits[heroBits.length - 1]} — your complete study system in one place.`;
  const coreBits: string[] = ["timer", "roadmaps"];
  if (planner) coreBits.push("planner");
  if (habits) coreBits.push("habits");
  const featList = coreBits.join(", ") + " and analytics";
  const faqs = FAQS.map((f) => {
    if (!planner && f.q === "Is FocusFlow free?") return { ...f, a: `Yes. Every feature — ${featList} — is free for learners.` };
    if (!habits && f.q === "How is this different from a plain Pomodoro app?")
      return { ...f, a: "Pomodoro apps only time you. FocusFlow connects timing with subjects, roadmaps, revision and analytics — your whole study system in one place." };
    return f;
  });
  return { features, faqs, sub };
}

const FEATURES = [
  { icon: Timer, title: "Focus timer & Pomodoro", text: "Stopwatch, countdown and Pomodoro modes with lap tracking, background mode and one-tap session logging." },
  { icon: Route, title: "DSA roadmap", text: "A step-by-step Data Structures & Algorithms journey — mark topics learning, revising or mastered." },
  { icon: Code2, title: "WebDev roadmap", text: "A guided HTML-to-full-stack journey so you always know what to learn next." },
  { icon: CalendarCheck, title: "Smart revision planner", text: "Due-date revision queues, weekly planner blocks and checklists keep nothing slipping." },
  { icon: Flame, title: "Habits & streaks", text: "Daily habits, study streaks with freeze days, and a consistency heatmap that keeps you honest." },
  { icon: BarChart3, title: "Progress analytics", text: "Daily trends, weekly comparisons, subject split, study-by-hour charts and XP levels." },
  { icon: Trophy, title: "Achievements & sharing", text: "Unlock achievements, climb levels and share beautiful progress cards with one click." },
];

const STEPS = [
  { n: "1", title: "Create your free account", text: "Sign up in 20 seconds — no credit card, no setup." },
  { n: "2", title: "Start a focus session", text: "Pick a subject, start the timer, log what you studied." },
  { n: "3", title: "Watch consistency grow", text: "Streaks, heatmaps and analytics show your progress." },
];

const FAQS = [
  { q: "Is FocusFlow free?", a: "Yes. Every feature — timer, roadmaps, planner, habits and analytics — is free for learners." },
  { q: "Do I need an account?", a: "Yes, a free account keeps your sessions, streaks and roadmaps safe and synced whenever you sign in." },
  { q: "Does it work on mobile?", a: "Yes. FocusFlow is fully responsive and works in any modern mobile or desktop browser — you can even add it to your home screen." },
  { q: "Can I track DSA and web development?", a: "Yes. Guided DSA and WebDev journeys let you mark every topic as learning, revising or mastered, with revision queues so you never forget." },
  { q: "How is this different from a plain Pomodoro app?", a: "Pomodoro apps only time you. FocusFlow connects timing with subjects, roadmaps, revision, habits and analytics — your whole study system in one place." },
];

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "FocusFlow — Free Study Tracker with Focus Timer & Roadmaps",
    description: SITE_DESCRIPTION,
    alternates: { canonical: `${base}/` },
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

const base = siteBaseUrl();
function jsonLdFor(features: typeof FEATURES, faqs: typeof FAQS) {
  return {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      url: `${base}/`,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${base}/search?q={search_term_string}` }, "query-input": "required name=search_term_string" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${base}/#app`,
      name: SITE_NAME,
      url: `${base}/`,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description: SITE_DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
      featureList: features.map((f) => f.title).join(", "),
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "127", bestRating: "5", worstRating: "1" },
    },
    {
      "@type": "FAQPage",
      "@id": `${base}/#faq`,
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${base}/#breadcrumb`,
      itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }],
    },
  ],
  };
}

export default async function Home() {
  const { habits, planner } = await flagPair();
  const { features, faqs, sub } = contentFor(habits, planner);
  const jsonLd = jsonLdFor(features, faqs);
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
            <Link href="#features">Features</Link>
            <Link href="#how">How it works</Link>
            <Link href="#faq">FAQ</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Get started free <ArrowRight size={14} /></Link>
          </nav>
        </header>

        <main>
          <section className="land-hero">
            <p className="land-badge"><Check size={14} /> Free study tracker for students & developers</p>
            <h1>Track every study session.<br /><span className="glow-text">Stay consistent. Grow.</span></h1>
            <p className="land-sub">{sub}</p>
            <div className="land-cta">
              <Link href="/signup" className="btn btn-primary btn-lg">Start tracking free <ArrowRight size={17} /></Link>
              <Link href="/login" className="btn btn-lg">Sign in</Link>
            </div>
            <ul className="land-ticks">
              <li><Check size={14} /> No credit card</li>
              <li><Check size={14} /> Works on mobile</li>
              <li><Check size={14} /> Free forever plan</li>
            </ul>
          </section>

          <section id="features" className="land-section" aria-labelledby="features-h">
            <h2 id="features-h">Everything you need to study smarter</h2>
            <p className="land-sec-sub">One app for timing, planning, revising and reviewing.</p>
            <div className="land-grid">
              {features.map((f) => (
                <article key={f.title} className="card land-card">
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
                <article key={s.n} className="card land-step">
                  <span className="land-num">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>
            <div className="land-cta land-cta-center">
              <Link href="/signup" className="btn btn-primary btn-lg">Create your free account <ArrowRight size={17} /></Link>
            </div>
          </section>

          <section id="faq" className="land-section" aria-labelledby="faq-h">
            <h2 id="faq-h">Frequently asked questions</h2>
            <div className="land-faq">
              {faqs.map((f) => (
                <details key={f.q} className="card">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="land-final card">
            <h2>Ready to build your streak?</h2>
            <p>Join FocusFlow today — free, fast, and made for deep focus.</p>
            <div className="land-cta land-cta-center">
              <Link href="/signup" className="btn btn-primary btn-lg">Get started free <ArrowRight size={17} /></Link>
              <Link href="/login" className="btn btn-lg">Sign in</Link>
            </div>
          </section>
        </main>

        <footer className="land-footer">
          <p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p>
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