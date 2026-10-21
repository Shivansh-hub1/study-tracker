import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCap, ArrowRight, Calendar, Clock, ChevronRight, Tag, HelpCircle, CheckCircle2 } from "lucide-react";
import { SITE_NAME, CANONICAL_SITE_URL, AUTHOR_INFO } from "@/lib/seo";
import { BLOG_POSTS, type BlogPost } from "@/lib/blogData";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-static";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return {};

  const url = `${CANONICAL_SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: post.title,
      description: post.metaDescription,
      url,
      publishedTime: post.date,
      authors: [AUTHOR_INFO.name],
      tags: post.tags,
      images: [{ url: `${CANONICAL_SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: [`${CANONICAL_SITE_URL}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  const articleUrl = `${CANONICAL_SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#article`,
        isPartOf: { "@id": `${CANONICAL_SITE_URL}/blog#blog` },
        headline: post.title,
        description: post.metaDescription,
        url: articleUrl,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          "@type": "Person",
          name: AUTHOR_INFO.name,
          jobTitle: AUTHOR_INFO.role,
          url: AUTHOR_INFO.url,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: `${CANONICAL_SITE_URL}/`,
          logo: `${CANONICAL_SITE_URL}/icon-512.webp`,
        },
        mainEntityOfPage: articleUrl,
        keywords: post.tags.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${CANONICAL_SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${articleUrl}#faq`,
        mainEntity: post.faqs.map((f) => ({
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

        <main style={{ maxWidth: 840, margin: "0 auto", padding: "40px 20px" }}>
          {/* Breadcrumbs Navigation */}
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", marginBottom: 24, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={14} />
            <Link href="/blog" style={{ color: "var(--muted)", textDecoration: "none" }}>Blog</Link>
            <ChevronRight size={14} />
            <span style={{ color: "var(--fg)", fontWeight: 600 }}>{post.title}</span>
          </nav>

          {/* Article Header & One H1 */}
          <header style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {post.tags.map((tag) => (
                <span key={tag} className="badge" style={{ fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>

            <h1 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.75rem)", fontWeight: 800, lineHeight: 1.25, color: "var(--fg)", margin: "8px 0 16px" }}>
              {post.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "var(--muted)", borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Calendar size={14} /> {post.date}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Clock size={14} /> {post.readTime}
              </span>
              <span>•</span>
              <span>By {AUTHOR_INFO.name}</span>
            </div>
          </header>

          {/* Article Body Content */}
          <article style={{ lineHeight: 1.8, fontSize: 16, color: "var(--fg)", marginBottom: 48 }}>
            {post.content.map((paragraph, index) => (
              <p key={index} style={{ marginBottom: 20, color: "var(--fg)" }}>
                {paragraph}
              </p>
            ))}

            <div className="card" style={{ padding: 24, margin: "32px 0", background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.25)" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "var(--fg)" }}>
                Ready to put this into practice?
              </h2>
              <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 16px" }}>
                FocusFlow automates your focus timers, revision intervals, and study metrics in one unified dashboard.
              </p>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Open Free Study Tracker <ArrowRight size={14} />
              </Link>
            </div>
          </article>

          {/* FAQ Section with Schema Sync */}
          <section style={{ marginBottom: 48 }} aria-labelledby="faq-heading">
            <h2 id="faq-heading" style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <HelpCircle size={20} className="glow-text" /> Frequently Asked Questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {post.faqs.map((faq, idx) => (
                <details key={idx} className="card" style={{ padding: 16, borderRadius: 10 }}>
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

          {/* Author Bio Card */}
          <section className="card" style={{ padding: 24, marginBottom: 48, display: "flex", alignItems: "flex-start", gap: 16, background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
              S
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <strong style={{ fontSize: 16, color: "var(--fg)" }}>Written by {AUTHOR_INFO.name}</strong>
                <span className="badge" style={{ fontSize: 11 }}>{AUTHOR_INFO.role}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 8px" }}>
                {AUTHOR_INFO.bio}
              </p>
              <a href={AUTHOR_INFO.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                View GitHub Profile →
              </a>
            </div>
          </section>

          {/* Related Articles (Interlinked - No Orphans) */}
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>More Study & Engineering Guides</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {otherPosts.map((op) => (
                <article key={op.slug} className="card" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                    <Link href={`/blog/${op.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {op.title}
                    </Link>
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--muted)", flex: 1, margin: "0 0 12px", lineHeight: 1.5 }}>
                    {op.excerpt}
                  </p>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{op.readTime}</span>
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
