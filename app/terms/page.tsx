import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, FileText, Scale, Clock, AlertCircle } from "lucide-react";
import { SITE_NAME, siteBaseUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "Terms of Service — FocusFlow",
    description: "FocusFlow terms of service. Simple, fair, and readable.",
    alternates: { canonical: `${base}/terms` },
    openGraph: { type: "website", siteName: SITE_NAME, title: "Terms of Service", description: "Simple, fair, and readable terms.", url: "/terms" },
    twitter: { card: "summary", title: "Terms of Service", description: "FocusFlow terms of service." },
    robots: { index: true, follow: true },
  };
}

const base = siteBaseUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebPage", "@id": `${base}/terms#page`, name: "Terms of Service", description: "FocusFlow terms of service", url: `${base}/terms` },
    { "@type": "BreadcrumbList", "@id": `${base}/terms#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }, { "@type": "ListItem", position: 2, name: "Terms", item: `${base}/terms` }] },
  ],
};

export default function TermsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav"><Link href="/" className="land-logo"><span className="land-logo-icon"><GraduationCap size={22} /></span>Focus<span className="glow-text">Flow</span></Link><nav className="land-links" aria-label="Primary"><Link href="/dsa">DSA</Link><Link href="/webdev">WebDev</Link><Link href="/revision">Revision</Link><Link href="/habits">Habits</Link><Link href="/progress">Analytics</Link><Link href="/achievements">Achievements</Link><Link href="/timer">Timer</Link><Link href="/login">Sign in</Link><Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link></nav></header>
        <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Terms of Service</h1>
          <p style={{ color: "var(--muted)", marginBottom: 32 }}>Last updated: {new Date().toLocaleDateString()}</p>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}><FileText size={20} style={{ verticalAlign: -4 }} /> Agreement</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>By using FocusFlow, you agree to these terms. If you don't agree, please don't use the service.</p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}><Scale size={20} style={{ verticalAlign: -4 }} /> The Service</h2>
            <ul style={{ lineHeight: 1.8, color: "var(--muted)" }}>
              <li>FocusFlow is a free study tracker with timer, roadmaps, revision, habits, analytics, and achievements</li>
              <li>Provided "as is" without warranties of any kind</li>
              <li>We may modify or discontinue features with notice</li>
              <li>No SLA, no uptime guarantee — it's a free tool</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}><AlertCircle size={20} style={{ verticalAlign: -4 }} /> Your Responsibilities</h2>
            <ul style={{ lineHeight: 1.8, color: "var(--muted)" }}>
              <li>Don't break the law, don't abuse the service, don't try to hack it</li>
              <li>One account per person (no bots, no bulk accounts)</li>
              <li>Keep your login credentials secure</li>
              <li>Export your data before deleting your account if you want to keep it</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}><Clock size={20} style={{ verticalAlign: -4 }} /> Account Termination</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>You can delete your account anytime from Settings. We may suspend accounts for abuse (spam, automation, illegal activity). Data deleted within 30 days of termination.</p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>No Liability</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>FocusFlow is free. We're not liable for any damages, data loss, missed deadlines, failed exams, or any consequences of using (or not being able to use) the service. Use at your own risk.</p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Changes</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>We may update these terms. Continued use = acceptance. Material changes announced via app banner or email.</p>
          </section>

          <div className="card" style={{ marginTop: 40, padding: 24, background: "var(--surface-2)" }}>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
              <strong>TL;DR:</strong> Free tool. Use responsibly. Don't abuse. Your data, your control. No liability. Terms may change.
            </p>
          </div>
        </main>
        <footer className="land-footer"><p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></nav></footer>
      </div>
    </>
  );
}