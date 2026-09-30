import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, Calendar, Clock, BookOpen, TrendingUp } from "lucide-react";
import { SITE_NAME, SITE_DESCRIPTION, siteBaseUrl } from "@/lib/seo";

const BLOG_POSTS = [
  {
    slug: "spaced-repetition-guide",
    title: "Spaced Repetition for Programmers: The Complete Guide",
    excerpt: "Why SM-2 beats cramming, how to build a revision system that works, and why FocusFlow automates it all.",
    date: "2026-09-15",
    readTime: "8 min",
    tags: ["Learning", "DSA", "Productivity"],
  },
  {
    slug: "pomodoro-vs-deep-work",
    title: "Pomodoro vs. Deep Work: Which Actually Works for Coding?",
    excerpt: "The science behind time-boxing, when 25/5 fails, and how to adapt the technique for complex problem-solving.",
    date: "2026-09-08",
    readTime: "6 min",
    tags: ["Focus", "Productivity", "Timer"],
  },
  {
    slug: "dsa-roadmap-self-taught",
    title: "The Self-Taught Developer's DSA Roadmap: 18 Modules to Interview Ready",
    excerpt: "Exactly what to study, in what order, with lecture-level granularity. No more tutorial hell.",
    date: "2026-09-01",
    readTime: "12 min",
    tags: ["DSA", "Career", "Roadmap"],
  },
  {
    slug: "habit-stacking-students",
    title: "Habit Stacking for Students: Tiny Routines, Massive Results",
    excerpt: "How to attach study habits to existing routines, use streak freeze days wisely, and build consistency that lasts.",
    date: "2026-08-25",
    readTime: "7 min",
    tags: ["Habits", "Consistency", "Psychology"],
  },
  {
    slug: "webdev-roadmap-2026",
    title: "Web Development Roadmap 2026: From HTML to AI-Integrated Apps",
    excerpt: "The complete path: semantic HTML → TypeScript → Next.js 14 → 3 production projects (SaaS, real-time, AI).",
    date: "2026-08-18",
    readTime: "15 min",
    tags: ["WebDev", "Career", "Roadmap"],
  },
  {
    slug: "analytics-driven-study",
    title: "Data-Driven Studying: What Your Heatmap Isn't Telling You",
    excerpt: "Reading your hourly heatmap, weekly deltas, and subject radar to actually improve — not just stare at charts.",
    date: "2026-08-11",
    readTime: "9 min",
    tags: ["Analytics", "Productivity", "Insights"],
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "FocusFlow Blog — Study Smarter, Not Harder",
    description: "Deep-dive guides on spaced repetition, Pomodoro technique, DSA roadmaps, WebDev learning paths, habit building, and study analytics. Written by developers, for developers.",
    alternates: { canonical: `${base}/blog` },
    openGraph: { type: "website", siteName: SITE_NAME, title: "FocusFlow Blog", description: "Study smarter guides: spaced repetition, DSA, WebDev, habits, analytics.", url: "/blog", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FocusFlow Blog" }] },
    twitter: { card: "summary_large_image", title: "FocusFlow Blog", description: "Study smarter guides for developers.", images: ["/opengraph-image"] },
  };
}

const base = siteBaseUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Blog", "@id": `${base}/blog#blog`, name: "FocusFlow Blog", description: "Study smarter guides for developers", url: `${base}/blog` },
    { "@type": "BreadcrumbList", "@id": `${base}/blog#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }, { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/blog` }] },
    { "@type": "ItemList", "@id": `${base}/blog#posts`, name: "Blog Posts", itemListElement: BLOG_POSTS.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${base}/blog/${p.slug}`, name: p.title })) },
  ],
};

export default function BlogPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav"><Link href="/" className="land-logo"><span className="land-logo-icon"><GraduationCap size={22} /></span>Focus<span className="glow-text">Flow</span></Link><nav className="land-links" aria-label="Primary"><Link href="/dsa">DSA</Link><Link href="/webdev">WebDev</Link><Link href="/revision">Revision</Link><Link href="/habits">Habits</Link><Link href="/progress">Analytics</Link><Link href="/achievements">Achievements</Link><Link href="/timer">Timer</Link><Link href="/login">Sign in</Link><Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link></nav></header>
        <main>
          <section className="land-hero" style={{ textAlign: "center", padding: "60px 20px" }}>
            <p className="land-badge"><BookOpen size={14} /> {BLOG_POSTS.length} guides · Updated weekly</p>
            <h1>Blog.<br /><span className="glow-text">Study smarter.</span></h1>
            <p className="land-sub" style={{ maxWidth: 700, margin: "16px auto 0" }}>Deep-dive guides on spaced repetition, Pomodoro technique, DSA roadmaps, WebDev paths, habit building, and study analytics. No fluff.</p>
          </section>

          <section className="land-section" aria-labelledby="posts-h">
            <h2 id="posts-h" style={{ textAlign: "center", marginBottom: 8 }}>Latest Guides</h2>
            <div className="land-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
              {BLOG_POSTS.map((post) => (
                <article key={post.slug} className="card land-card" style={{ maxWidth: "none", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {post.tags.map((tag) => (<span key={tag} className="badge" style={{ fontSize: 11 }}>{tag}</span>))}
                  </div>
                  <h3 style={{ marginBottom: 8 }}><Link href={`/blog/${post.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{post.title}</Link></h3>
                  <p style={{ color: "var(--muted)", lineHeight: 1.6, flex: 1 }}>{post.excerpt}</p>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 16, fontSize: 12.5, color: "var(--muted)" }}>
                    <span><Calendar size={14} style={{ verticalAlign: -2 }} /> {new Date(post.date).toLocaleDateString()}</span>
                    <span><Clock size={14} style={{ verticalAlign: -2 }} /> {post.readTime}</span>
                    <Link href={`/blog/${post.slug}`} style={{ color: "var(--accent)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>Read <ArrowRight size={14} /></Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="land-final card" style={{ textAlign: "center", background: "linear-gradient(135deg, var(--accent-soft) 0%, transparent 60%), var(--surface)" }}>
            <h2>Want these guides in your inbox?</h2>
            <p>Weekly study tips, roadmap updates, and productivity deep-dives. No spam. Unsubscribe anytime.</p>
            <div className="land-cta land-cta-center"><Link href="/signup" className="btn btn-primary btn-lg">Subscribe free <ArrowRight size={17} /></Link></div>
          </section>
        </main>
        <footer className="land-footer"><p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></nav></footer>
      </div>
    </>
  );
}