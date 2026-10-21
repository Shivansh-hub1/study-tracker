import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, Calendar, Clock, BookOpen, User, Tag, ChevronRight } from "lucide-react";
import { SITE_NAME, CANONICAL_SITE_URL, AUTHOR_INFO } from "@/lib/seo";
import { BLOG_POSTS } from "@/lib/blogData";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return {
    title: "Engineering & Study Guides",
    description: "Practical engineering guides on spaced repetition SM-2, Pomodoro calibration, self-taught DSA roadmaps, full-stack WebDev, and study analytics. Written by developers, for developers.",
    alternates: { canonical: `${CANONICAL_SITE_URL}/blog` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: "FocusFlow Blog — Engineering & Study Guides",
      description: "Practical guides on spaced repetition, Pomodoro techniques, DSA, WebDev roadmaps, and habit consistency.",
      url: `${CANONICAL_SITE_URL}/blog`,
      images: [{ url: `${CANONICAL_SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "FocusFlow Blog" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "FocusFlow Blog — Engineering & Study Guides",
      description: "Practical guides on spaced repetition, Pomodoro techniques, DSA, WebDev roadmaps, and habit consistency.",
      images: [`${CANONICAL_SITE_URL}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Blog",
      "@id": `${CANONICAL_SITE_URL}/blog#blog`,
      name: "FocusFlow Engineering & Study Blog",
      description: "Practical engineering guides on spaced repetition, Pomodoro techniques, DSA, WebDev roadmaps, and study analytics.",
      url: `${CANONICAL_SITE_URL}/blog`,
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: `${CANONICAL_SITE_URL}/`,
        logo: `${CANONICAL_SITE_URL}/icon-512.webp`,
      },
      author: {
        "@type": "Person",
        name: AUTHOR_INFO.name,
        jobTitle: AUTHOR_INFO.role,
        url: AUTHOR_INFO.url,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL_SITE_URL}/blog#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${CANONICAL_SITE_URL}/blog` },
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${CANONICAL_SITE_URL}/blog#posts`,
      name: "Published Guides",
      itemListElement: BLOG_POSTS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${CANONICAL_SITE_URL}/blog/${p.slug}`,
        name: p.title,
      })),
    },
  ],
};

export default function BlogPage() {
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
            <Link href="/#features">Features</Link>
            <Link href="/#how">How it works</Link>
            <Link href="/about">About</Link>
            <Link href="/blog" className="active">Blog</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link>
          </nav>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", marginBottom: 28 }}>
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={14} />
            <span style={{ color: "var(--fg)", fontWeight: 600 }}>Blog</span>
          </nav>

          {/* Single H1 on page */}
          <section className="land-hero" style={{ textAlign: "center", padding: "20px 0 40px" }}>
            <p className="land-badge"><BookOpen size={14} /> {BLOG_POSTS.length} In-Depth Engineering Guides</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.2, margin: "12px 0" }}>
              FocusFlow Engineering & Study Blog
            </h1>
            <p className="land-sub" style={{ maxWidth: 680, margin: "0 auto", fontSize: 16, color: "var(--muted)" }}>
              No marketing fluff. Practical guides on spaced repetition algorithms, deep-work focus calibration, self-taught DSA roadmaps, and full-stack development.
            </p>
          </section>

          {/* Author Card */}
          <section className="card" style={{ padding: "20px 24px", marginBottom: 36, display: "flex", alignItems: "center", gap: 16, background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.18)" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
              S
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 15, color: "var(--fg)" }}>{AUTHOR_INFO.name}</strong>
                <span className="badge" style={{ fontSize: 11 }}>{AUTHOR_INFO.role}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0", lineHeight: 1.5 }}>
                {AUTHOR_INFO.bio}
              </p>
            </div>
          </section>

          {/* Posts Grid */}
          <section aria-labelledby="posts-heading">
            <h2 id="posts-heading" style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Latest Articles</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {BLOG_POSTS.map((post) => (
                <article key={post.slug} className="card land-card" style={{ display: "flex", flexDirection: "column", padding: 24 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    {post.tags.map((tag) => (
                      <span key={tag} className="badge" style={{ fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.35, marginBottom: 10 }}>
                    <Link href={`/blog/${post.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {post.title}
                    </Link>
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, flex: 1, marginBottom: 16 }}>
                    {post.excerpt}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={13} /> {post.date}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Clock size={13} /> {post.readTime}
                    </span>
                  </div>
                </article>
              ))}
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
