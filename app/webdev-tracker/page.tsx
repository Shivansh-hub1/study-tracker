import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, Code2, CheckCircle2, ChevronRight, Server, Database, Globe, Laptop, Sparkles } from "lucide-react";
import { SITE_NAME, CANONICAL_SITE_URL, AUTHOR_INFO } from "@/lib/seo";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return {
    title: "Web Dev Tracker — Free Full-Stack Web Development Roadmap & Progress Tracker | FocusFlow",
    description: "The #1 free web dev tracker. Track your journey from HTML/CSS and JavaScript to React, Next.js, Node APIs, SQL, and Full-Stack production deployment.",
    keywords: [
      "web dev tracker",
      "webdev tracker",
      "web development tracker",
      "webdev study tracker",
      "web dev roadmap tracker",
      "full stack roadmap tracker",
      "focusflow webdev tracker",
      "focus flow webdev tracker",
      "frontend study tracker",
      "learn full stack web development"
    ],
    alternates: { canonical: `${CANONICAL_SITE_URL}/webdev-tracker` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: "Web Dev Tracker — Free Full-Stack Web Development Roadmap & Progress Tracker",
      description: "Structured web development curriculum tracker: Semantic HTML, strict TypeScript, REST APIs, databases, and full-stack projects.",
      url: `${CANONICAL_SITE_URL}/webdev-tracker`,
      images: [{ url: `${CANONICAL_SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "FocusFlow WebDev Tracker" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Web Dev Tracker — FocusFlow",
      description: "Free Full-Stack Web Development roadmap and milestone progress tracker.",
      images: [`${CANONICAL_SITE_URL}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

const WEBDEV_MODULES = [
  { id: "01", name: "Semantic HTML5 & Accessibility", desc: "Page structure, ARIA accessibility landmarks, metadata, OpenGraph, and web standards." },
  { id: "02", name: "Modern CSS & Responsive Design", desc: "Box model, Flexbox layouts, CSS Grid, media queries, mobile-first styling." },
  { id: "03", name: "JavaScript Fundamentals", desc: "Scope, closures, prototypes, event loops, DOM manipulation, ES6+ arrow functions & destructuring." },
  { id: "04", name: "Async JS, Promises & Fetch", desc: "Event loop, asynchronous callbacks, Promises, async/await, error handling, and RESTful HTTP." },
  { id: "05", name: "Terminal, Git & GitHub", desc: "CLI workflows, SSH keys, branch management, merge conflict resolution, and pull requests." },
  { id: "06", name: "Node.js & Modular Architecture", desc: "CommonJS vs ESM, Node runtime internals, file system APIs, npm package management." },
  { id: "07", name: "Express.js & REST API Design", desc: "Routing, request/response lifecycle, middleware chains, error handling, status codes." },
  { id: "08", name: "Relational Databases & SQL", desc: "PostgreSQL / SQLite schemas, normalization, primary & foreign keys, joins, index tuning." },
  { id: "09", name: "NoSQL & Document Stores", desc: "MongoDB / Mongoose schemas, document models, aggregation pipelines, and indexing." },
  { id: "10", name: "Authentication & Security", desc: "Sessions, cookies, JWTs, password hashing (bcrypt), CSRF/CORS prevention, rate limiting." },
  { id: "11", name: "React Fundamentals", desc: "JSX, virtual DOM, components, props, useState, useEffect, and component lifecycles." },
  { id: "12", name: "Advanced React & State", desc: "useReducer, useContext, custom hooks, memoization (useMemo/useCallback), and performance." },
  { id: "13", name: "TypeScript for Full-Stack", desc: "Type inference, interfaces, generics, utility types, strict configuration, API typings." },
  { id: "14", name: "Next.js App Router & SSR", desc: "Server Components, Client Components, dynamic routing, streaming SSR, metadata optimization." },
  { id: "15", name: "Tailwind CSS & Design Systems", desc: "Utility-first architecture, component design tokens, dark mode schemes, Notion aesthetics." },
  { id: "16", name: "Testing & Code Quality", desc: "Unit testing, integration testing, end-to-end testing with Vitest/Playwright, linting." },
  { id: "17", name: "Deployment, CI/CD & DevOps", desc: "Docker basics, GitHub Actions pipelines, Vercel/Cloudflare deployment, environment variables." },
  { id: "18", name: "Production Capstone Project", desc: "Shipping a complete multi-user full-stack application with real auth, database, and analytics." },
];

const FAQS = [
  {
    q: "Who designed and engineered FocusFlow Web Dev Tracker?",
    a: "The FocusFlow Web Dev Tracker was created and developed by Shivansh, a full-stack engineer who built this structured 18-module milestone roadmap to help developers systematically level up their frontend and backend skills."
  },
  {
    q: "What is a Web Dev Tracker?",
    a: "A Web Dev Tracker is a step-by-step progress and milestone tracking tool for web developers. It breaks the overwhelming full-stack curriculum down into manageable modules so you know exactly what to learn next."
  },
  {
    q: "Why use FocusFlow for web development study tracking?",
    a: "FocusFlow provides an interactive 18-module web dev syllabus, links your study sessions with a focus timer, and reminds you when it is time to revise earlier topics with built-in spaced repetition."
  },
  {
    q: "Can I use this alongside bootcamps or self-taught courses?",
    a: "Yes. FocusFlow is course-agnostic. Whether you are learning through Delta, The Odin Project, freeCodeCamp, or university coursework, you can mark milestones and log your study hours."
  },
  {
    q: "Is FocusFlow's WebDev Tracker completely free?",
    a: "Yes. FocusFlow is 100% free with no hidden fees, subscriptions, or credit card requirements."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${CANONICAL_SITE_URL}/webdev-tracker#page`,
      name: "Web Dev Tracker — Free Full-Stack Web Development Roadmap & Progress Tracker",
      description: "Structured 18-module web development journey from semantic HTML to production Next.js and databases.",
      url: `${CANONICAL_SITE_URL}/webdev-tracker`,
      isPartOf: { "@id": `${CANONICAL_SITE_URL}/#website` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${CANONICAL_SITE_URL}/webdev-tracker#app`,
      name: "FocusFlow Web Dev Tracker",
      alternateName: ["Web Dev Tracker", "WebDev Tracker", "Web Development Tracker", "FocusFlow WebDev", "Focus Flow Web Dev Tracker"],
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: `${CANONICAL_SITE_URL}/webdev-tracker`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@type": "Person", "@id": `${CANONICAL_SITE_URL}/#author`, name: "Shivansh", url: AUTHOR_INFO.url },
      creator: { "@type": "Person", "@id": `${CANONICAL_SITE_URL}/#author`, name: "Shivansh" },
      featureList: "18-module web development roadmap, session timers, milestone tracking, streak analytics, spaced repetition",
    },
    {
      "@type": "Person",
      "@id": `${CANONICAL_SITE_URL}/#author`,
      name: "Shivansh",
      jobTitle: AUTHOR_INFO.role,
      description: AUTHOR_INFO.bio,
      url: AUTHOR_INFO.url,
      sameAs: [AUTHOR_INFO.url],
    },
    {
      "@type": "FAQPage",
      "@id": `${CANONICAL_SITE_URL}/webdev-tracker#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL_SITE_URL}/webdev-tracker#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Web Dev Tracker", item: `${CANONICAL_SITE_URL}/webdev-tracker` },
      ],
    },
  ],
};

export default function WebDevTrackerPage() {
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
            <Link href="/webdev-tracker" className="active">WebDev Tracker</Link>
            <Link href="/timer">Focus Timer</Link>
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
            <span style={{ color: "var(--fg)", fontWeight: 600 }}>Web Dev Tracker</span>
          </nav>

          <section className="land-hero" style={{ textAlign: "center", padding: "10px 0 40px" }}>
            <p className="land-badge"><Code2 size={14} /> From First HTML Tag to Production Full-Stack</p>
            <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 800, margin: "14px 0 16px", color: "var(--fg)", lineHeight: 1.15 }}>
              Free Online <span className="land-hero-accent">Web Dev Tracker</span> &amp; Roadmap
            </h1>
            <p className="land-sub" style={{ maxWidth: 720, margin: "0 auto 28px", color: "var(--muted)", fontSize: 16, lineHeight: 1.6 }}>
              Escape tutorial hell. Track every step of your full-stack journey from frontend fundamentals to server-side APIs and production databases with FocusFlow (Your Study Tracker).
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/signup" className="btn-notion-primary" style={{ padding: "12px 28px", fontSize: 15 }}>
                Open Free Web Dev Tracker <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="btn-notion-secondary" style={{ padding: "12px 24px", fontSize: 15 }}>
                Sign in to Resume
              </Link>
            </div>
          </section>

          {/* Core Feature Pillars */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, margin: "40px 0" }}>
            <div className="card" style={{ padding: 24, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(46, 140, 255, 0.12)", color: "#2e8cff", display: "grid", placeItems: "center", marginBottom: 14 }}>
                <Globe size={20} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>Full-Stack Progression</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Master the entire modern web stack: HTML/CSS, JavaScript, TypeScript, React, Next.js, Express, and Databases.
              </p>
            </div>

            <div className="card" style={{ padding: 24, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(26, 174, 57, 0.12)", color: "#1aae39", display: "grid", placeItems: "center", marginBottom: 14 }}>
                <Database size={20} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>Relational &amp; NoSQL</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Deep dives into real data modeling: SQL queries, joins, indexes, schema design, and document stores.
              </p>
            </div>

            <div className="card" style={{ padding: 24, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", display: "grid", placeItems: "center", marginBottom: 14 }}>
                <Laptop size={20} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>Production Capstones</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Build portfolio-grade software with auth, caching, and CI/CD deployment rather than simple toy apps.
              </p>
            </div>
          </section>

          {/* 18 Modules Grid */}
          <section style={{ margin: "60px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--fg)", marginBottom: 8 }}>
                The Complete 18-Module Web Engineering Curriculum
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>
                Every milestone tracked in FocusFlow with progress states and automated review intervals.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {WEBDEV_MODULES.map((m) => (
                <div key={m.id} className="card" style={{ padding: "16px 20px", border: "1px solid var(--border)", background: "var(--surface)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "rgba(46, 140, 255, 0.15)", color: "#2e8cff" }}>
                      MOD {m.id}
                    </span>
                    <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: 0, color: "var(--fg)" }}>{m.name}</h3>
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.45, margin: 0 }}>
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section style={{ margin: "60px 0" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginBottom: 20 }}>
              Frequently Asked Questions About Web Development Tracking
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

          {/* Bottom CTA */}
          <section className="card" style={{ padding: 40, textAlign: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, color: "var(--fg)" }}>
              Start Building Full-Stack Confidence Today
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 14.5, maxWidth: 560, margin: "0 auto 24px" }}>
              Organize your roadmap, log deep focus hours, and watch your consistency grow into real engineering ability.
            </p>
            <Link href="/signup" className="btn-notion-primary" style={{ padding: "12px 28px", fontSize: 15 }}>
              Start Your Free Web Dev Tracker <ArrowRight size={16} />
            </Link>
          </section>
        </main>

        <footer className="land-footer">
          <p><strong>Focus<span className="land-logo-flow">Flow</span></strong> — Deep-focus study tracker created by <strong>Shivansh</strong>.</p>
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
