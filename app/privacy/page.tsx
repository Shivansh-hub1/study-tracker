import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, Shield, Database, User, ChevronRight } from "lucide-react";
import { SITE_NAME, CANONICAL_SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return {
    title: "Privacy Policy",
    description: "FocusFlow privacy policy: 100% private, local-first study tracking. Zero third-party analytics, zero ad trackers, and zero data selling.",
    alternates: { canonical: `${CANONICAL_SITE_URL}/privacy` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: "Privacy Policy — FocusFlow",
      description: "Your study data stays yours. Local-first storage, no tracking, and no data selling.",
      url: `${CANONICAL_SITE_URL}/privacy`,
    },
    twitter: { card: "summary", title: "Privacy Policy — FocusFlow", description: "Your study data stays yours." },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${CANONICAL_SITE_URL}/privacy#page`,
      name: "Privacy Policy",
      description: "FocusFlow privacy policy: local-first study tracking with zero third-party telemetry.",
      url: `${CANONICAL_SITE_URL}/privacy`,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL_SITE_URL}/privacy#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Privacy", item: `${CANONICAL_SITE_URL}/privacy` },
      ],
    },
  ],
};

export default function PrivacyPage() {
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
            <span style={{ color: "var(--fg)", fontWeight: 600 }}>Privacy Policy</span>
          </nav>

          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: "var(--fg)" }}>Privacy Policy</h1>
          <p style={{ color: "var(--muted)", marginBottom: 32, fontSize: 14 }}>Last updated: October 2026</p>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: "var(--fg)" }}>
              <Shield size={20} className="glow-text" /> Data We Collect
            </h2>
            <ul style={{ lineHeight: 1.8, color: "var(--muted)", paddingLeft: 20 }}>
              <li><strong>Account Credentials:</strong> Email address and password hash (used strictly for authentication).</li>
              <li><strong>Study History:</strong> Sessions, elapsed time, subjects, roadmap statuses, and habits — stored in your local browser database.</li>
              <li><strong>Preferences:</strong> Theme settings, sound toggles, and Pomodoro intervals — stored strictly on your device.</li>
              <li><strong>Zero Telemetry:</strong> No Google Analytics, no Facebook pixels, no fingerprinting, and no marketing cookies.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: "var(--fg)" }}>
              <Database size={20} className="glow-text" /> Where Your Data Lives
            </h2>
            <ul style={{ lineHeight: 1.8, color: "var(--muted)", paddingLeft: 20 }}>
              <li><strong>Local-First:</strong> All study calculations and timers run inside your browser.</li>
              <li><strong>Export Anytime:</strong> Export your full dataset anytime as CSV or JSON from the Settings tab.</li>
              <li><strong>Instant Deletion:</strong> Deleting your account wipes all server-side session tokens immediately.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: "var(--fg)" }}>
              <User size={20} className="glow-text" /> Your Rights
            </h2>
            <p style={{ lineHeight: 1.8, color: "var(--muted)" }}>
              You own your study metrics. We do not sell, rent, or share personal information with any third party under any circumstances.
            </p>
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
