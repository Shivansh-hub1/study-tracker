import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Check, ArrowRight, ChevronDown, Target, Brain, Layers, Globe, Zap, Trophy } from "lucide-react";
import { SITE_DESCRIPTION, SITE_NAME, siteBaseUrl } from "@/lib/seo";

const WEBDEV_TOPICS = [
  { title: "HTML & Semantic Foundations", blurb: "Semantic tags, accessibility basics, forms, meta tags, SEO fundamentals, deployment to Netlify/Vercel" },
  { title: "CSS Mastery", blurb: "Box model, Flexbox, Grid, custom properties, animations, responsive design, container queries, CSS layers" },
  { title: "JavaScript Core", blurb: "ES6+, closures, async/await, modules, DOM manipulation, fetch API, error handling, event loop" },
  { title: "TypeScript Fundamentals", blurb: "Types, interfaces, generics, utility types, discriminated unions, strict mode, type narrowing" },
  { title: "React Essentials", blurb: "Components, props, state, effects, hooks, context, forms, routing, performance optimization" },
  { title: "State Management", blurb: "Zustand, Redux Toolkit, React Query/TanStack Query, server state vs client state, caching strategies" },
  { title: "Next.js App Router", blurb: "Server components, actions, streaming, Suspense, middleware, ISR, metadata API, parallel routes" },
  { title: "Database & ORM", blurb: "PostgreSQL, Prisma/Drizzle, migrations, relationships, transactions, connection pooling, seeding" },
  { title: "Authentication", blurb: "NextAuth.js, JWT, OAuth providers, middleware protection, role-based access, session handling" },
  { title: "API Design", blrb: "REST vs GraphQL vs tRPC, Zod validation, rate limiting, OpenAPI docs, versioning, error handling" },
  { title: "Testing", blurb: "Vitest, React Testing Library, Playwright, unit/integration/e2e, CI pipelines, coverage thresholds" },
  { title: "Deployment & DevOps", blurb: "Vercel, Docker, GitHub Actions, environment vars, preview deployments, monitoring, logging" },
  { title: "Performance", blurb: "Core Web Vitals, bundle analysis, lazy loading, image optimization, caching headers, ISR/SSG/SSR strategies" },
  { title: "Full-Stack Project 1: SaaS Starter", blurb: "Auth, billing (Stripe), dashboard, settings, team invites, email, webhooks, admin panel" },
  { title: "Full-Stack Project 2: Real-time App", blurb: "WebSockets, Server-Sent Events, presence, notifications, collaborative editing, scaling" },
  { title: "Full-Stack Project 3: AI Integration", blrb: "Vercel AI SDK, OpenAI/Anthropic, streaming responses, RAG, embeddings, function calling" },
  { title: "System Design Basics", blrb: "Load balancing, caching, databases, message queues, microservices vs monolith, CAP theorem, scaling patterns" },
  { title: "Career & Portfolio", blrb: "Portfolio projects, technical blogging, open source, interview prep, negotiation, personal branding" },
];

const WEBDEV_FEATURES = [
  { icon: Target, title: "18 modules — HTML to AI", text: "Semantic HTML through full-stack projects with AI integration. Every step builds on the last." },
  { icon: Brain, title: "Project-based, not tutorial-based", text: "You build 3 production-grade apps: SaaS, real-time, AI-powered. Portfolio-ready code." },
  { icon: Layers, title: "Modern stack by default", text: "Next.js 14 App Router, TypeScript, Tailwind, Prisma, NextAuth, TanStack Query — what teams actually use." },
  { icon: Globe, title: "Deploy as you learn", text: "Every module ends with a deployed URL. Vercel, Docker, GitHub Actions — real ops experience." },
  { icon: Zap, title: "Timer + roadmap sync", text: "Pick 'Web Dev' subject. Timer auto-logs to current module. Revision queues for concepts." },
  { icon: Trophy, title: "Achievements & levels", text: "Unlock badges: First Deploy, Full-Stack Builder, AI Engineer, System Designer, Open Source Contributor." },
];

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "WebDev Roadmap — Free Full-Stack Journey HTML to AI | FocusFlow",
    description: "Master web development with a free 18-module roadmap. Build 3 production apps (SaaS, real-time, AI). Next.js, TypeScript, Prisma, deployed. Timer integration included.",
    alternates: { canonical: `${base}/webdev` },
    openGraph: { type: "website", siteName: SITE_NAME, title: "WebDev Roadmap — Free Full-Stack Journey", description: "Build 3 production apps: SaaS, real-time, AI. Next.js, TypeScript, Prisma. Timer integration. Free forever.", url: "/webdev", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FocusFlow WebDev Roadmap — HTML to AI full-stack journey" }] },
    twitter: { card: "summary_large_image", title: "WebDev Roadmap — Free Full-Stack Journey", description: "18 modules, 3 production apps, deployed. Next.js, TypeScript, Prisma. Free forever.", images: ["/opengraph-image"] },
  };
}

const base = siteBaseUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "ItemList", "@id": `${base}/webdev#topics`, name: "WebDev Roadmap Topics", description: "Complete 18-module Full-Stack Web Development curriculum", numberOfItems: WEBDEV_TOPICS.length, itemListElement: WEBDEV_TOPICS.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.title, description: t.blurb })) },
    { "@type": "SoftwareApplication", "@id": `${base}/webdev#app`, name: "FocusFlow WebDev Tracker", url: `${base}/webdev`, applicationCategory: "EducationalApplication", operatingSystem: "Web", description: "Free WebDev roadmap with project-based learning, deployment integration, timer sync, and progress analytics.", offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" }, featureList: WEBDEV_FEATURES.map(f => f.title).join(", ") },
    { "@type": "BreadcrumbList", "@id": `${base}/webdev#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }, { "@type": "ListItem", position: 2, name: "WebDev Roadmap", item: `${base}/webdev` }] },
  ],
};

export default function WebDevPublicPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav"><Link href="/" className="land-logo"><span className="land-logo-icon"><Code2 size={22} /></span>Focus<span className="glow-text">Flow</span></Link><nav className="land-links" aria-label="Primary"><Link href="/dsa">DSA</Link><Link href="/webdev">WebDev</Link><Link href="/revision">Revision</Link><Link href="/habits">Habits</Link><Link href="/progress">Analytics</Link><Link href="/achievements">Achievements</Link><Link href="/timer">Timer</Link><Link href="/login">Sign in</Link><Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link></nav></header>
        <main>
          <section className="land-hero" style={{ background: "linear-gradient(135deg, #22d3ee10 0%, transparent 60%), var(--surface)" }}><p className="land-badge"><Code2 size={14} /> 18 modules · 3 production apps · Deployed URLs</p><h1>WebDev Roadmap.<br /><span className="glow-text" style={{ color: "#22d3ee" }}>Build. Deploy. Ship.</span></h1><p className="land-sub">A complete, free full-stack journey. HTML → TypeScript → Next.js → 3 deployed projects (SaaS, real-time, AI). Timer auto-logs to your current module.</p><div className="land-cta"><Link href="/signup" className="btn btn-primary btn-lg">Start WebDev free <ArrowRight size={17} /></Link><Link href="/login" className="btn btn-lg">Sign in</Link></div><ul className="land-ticks"><li><Check size={14} /> Free forever</li><li><Check size={14} /> No setup required</li><li><Check size={14} /> Real deployed projects</li></ul></section>
          <section className="land-section" aria-labelledby="features-h"><h2 id="features-h">Built for how developers actually learn</h2><p className="land-sec-sub">Not tutorials — production code you ship.</p><div className="land-grid">{WEBDEV_FEATURES.map((f) => (<article key={f.title} className="card land-card"><span className="land-ico"><f.icon size={20} /></span><h3>{f.title}</h3><p>{f.text}</p></article>))}</div></section>
          <section className="land-section" aria-labelledby="curriculum-h"><h2 id="curriculum-h">Complete curriculum — 18 modules, 3 shipped apps</h2><div className="land-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>{WEBDEV_TOPICS.map((t, i) => (<details key={t.title} className="card land-card" style={{ maxWidth: "none" }}><summary style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer"}}><span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</span><span style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</span><ChevronDown size={16} style={{ marginLeft: "auto", color: "var(--muted)" }} /></summary><p style={{ marginTop: 10, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6 }}>{t.blurb}</p></details>))}</div></section>
          <section className="land-section" aria-labelledby="how-h"><h2 id="how-h">Start in 30 seconds</h2><div className="land-steps"><article className="card land-step"><span className="land-num">1</span><h3>Create free account</h3><p>20 seconds. No card. No setup.</p></article><article className="card land-step"><span className="land-num">2</span><h3>Pick "Web Dev" subject</h3><p>Timer auto-selects your current module.</p></article><article className="card land-step"><span className="land-num">3</span><h3>Build & deploy</h3><p>Every module ends with a live URL.</p></article></div><div className="land-cta land-cta-center"><Link href="/signup" className="btn btn-primary btn-lg">Begin your WebDev journey <ArrowRight size={17} /></Link></div></section>
          <section className="land-final card" style={{ background: "linear-gradient(135deg, #22d3ee10 0%, transparent 60%), var(--surface)" }}><h2>Ready to ship production apps?</h2><p>Join thousands learning full-stack the right way. Free, project-based, and built for hiring.</p><div className="land-cta land-cta-center"><Link href="/signup" className="btn btn-primary btn-lg">Start free <ArrowRight size={17} /></Link></div></section>
        </main>
        <footer className="land-footer"><p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></nav></footer>
      </div>
    </>
  );
}