import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, FileText, Scale, ChevronRight } from "lucide-react";
import { SITE_NAME, CANONICAL_SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return {
    title: "Terms of Service",
    description: "FocusFlow terms of service: straightforward, fair, and free forever study tracking for students and developers.",
    alternates: { canonical: `${CANONICAL_SITE_URL}/terms` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: "Terms of Service — FocusFlow",
      description: "Simple, fair terms for the free FocusFlow study ecosystem.",
      url: `${CANONICAL_SITE_URL}/terms`,
    },
    twitter: { card: "summary", title: "Terms of Service — FocusFlow", description: "FocusFlow terms of service." },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${CANONICAL_SITE_URL}/terms#page`,
      name: "Terms of Service",
      description: "FocusFlow terms of service.",
      url: `${CANONICAL_SITE_URL}/terms`,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL_SITE_URL}/terms#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Terms", item: `${CANONICAL_SITE_URL}/terms` },
      ],
    },
  ],
};

export default function TermsPage() {
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
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link>
          </nav>
        </header>

        <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={14} />
            <span style={{ color: "var(--fg)", fontWeight: 600 }}>Terms of Service</span>
          </nav>

          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: "var(--fg)" }}>Terms of Service</h1>
          <p style={{ color: "var(--muted)", marginBottom: 32, fontSize: 14 }}>Last updated: October 2026</p>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: "var(--fg)" }}>
              <FileText size={20} className="glow-text" /> 1. Agreement
            </h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
              By accessing or using FocusFlow, you agree to be bound by these Terms. If you do not agree with any part, you may discontinue use immediately.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: "var(--fg)" }}>
              <Scale size={20} className="glow-text" /> 2. Fair & Free Service
            </h2>
            <ul style={{ lineHeight: 1.8, color: "var(--muted)", paddingLeft: 20 }}>
              <li>FocusFlow is provided as a free educational productivity suite.</li>
              <li>You may use FocusFlow for personal, academic, or professional study management.</li>
              <li>We do not charge subscriptions or insert advertisements into your workflow.</li>
              <li>Provided &ldquo;as is&rdquo; without warranties of any kind. You remain responsible for exporting regular data backups.</li>
            </ul>
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
