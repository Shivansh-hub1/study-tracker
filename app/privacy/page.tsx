import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, Shield, Database, User, Mail, Clock } from "lucide-react";
import { SITE_NAME, siteBaseUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "Privacy Policy — FocusFlow",
    description: "FocusFlow privacy policy. Your data stays yours. No tracking, no selling, no surprises.",
    alternates: { canonical: `${base}/privacy` },
    openGraph: { type: "website", siteName: SITE_NAME, title: "Privacy Policy", description: "Your data stays yours. No tracking, no selling.", url: "/privacy" },
    twitter: { card: "summary", title: "Privacy Policy", description: "FocusFlow privacy policy." },
    robots: { index: true, follow: true },
  };
}

const base = siteBaseUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebPage", "@id": `${base}/privacy#page`, name: "Privacy Policy", description: "FocusFlow privacy policy", url: `${base}/privacy` },
    { "@type": "BreadcrumbList", "@id": `${base}/privacy#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }, { "@type": "ListItem", position: 2, name: "Privacy", item: `${base}/privacy` }] },
  ],
};

export default function PrivacyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav"><Link href="/" className="land-logo"><span className="land-logo-icon"><GraduationCap size={22} /></span>Focus<span className="glow-text">Flow</span></Link><nav className="land-links" aria-label="Primary"><Link href="/dsa">DSA</Link><Link href="/webdev">WebDev</Link><Link href="/revision">Revision</Link><Link href="/habits">Habits</Link><Link href="/progress">Analytics</Link><Link href="/achievements">Achievements</Link><Link href="/timer">Timer</Link><Link href="/login">Sign in</Link><Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link></nav></header>
        <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ color: "var(--muted)", marginBottom: 32 }}>Last updated: {new Date().toLocaleDateString()}</p>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}><Shield size={20} style={{ verticalAlign: -4 }} /> Data We Collect</h2>
            <ul style={{ lineHeight: 1.8, color: "var(--muted)" }}>
              <li><strong>Account:</strong> Name, email (for auth only)</li>
              <li><strong>Study Data:</strong> Sessions, subjects, topics, habits, streaks, achievements — stored in your local SQLite database</li>
              <li><strong>Preferences:</strong> Theme, timer settings, notification permissions — stored locally</li>
              <li><strong>Nothing Else:</strong> No analytics, no tracking pixels, no third-party scripts, no fingerprinting</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}><Database size={20} style={{ verticalAlign: -4 }} /> Where Your Data Lives</h2>
            <ul style={{ lineHeight: 1.8, color: "var(--muted)" }}>
              <li><strong>Local-first:</strong> Primary database lives in your browser (IndexedDB/SQLite)</li>
              <li><strong>Optional sync:</strong> If you enable cloud sync, encrypted backup goes to Turso (libSQL) — you control this</li>
              <li><strong>Export anytime:</strong> CSV (sessions) or JSON (full account) from Settings</li>
              <li><strong>Delete anytime:</strong> Account deletion wipes all data from our servers within 30 days</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}><User size={20} style={{ verticalAlign: -4 }} /> Your Rights</h2>
            <ul style={{ lineHeight: 1.8, color: "var(--muted)" }}>
              <li>Access: Export all your data from Settings → Your Data</li>
              <li>Rectification: Edit any data directly in the app</li>
              <li>Erasure: Delete account from Settings → Account</li>
              <li>Portability: JSON export includes everything</li>
              <li>Object: No profiling, no automated decisions, no marketing</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}><Clock size={20} style={{ verticalAlign: -4 }} /> Retention</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>Local data: forever (until you delete). Synced data: 30 days after account deletion. No backups kept beyond that.</p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}><Mail size={20} style={{ verticalAlign: -4 }} /> Contact</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>Questions? Email: privacy@focusflow.app</p>
          </section>

          <div className="card" style={{ marginTop: 40, padding: 24, background: "var(--surface-2)" }}>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
              <strong>TL;DR:</strong> Your data is yours. We don't track you. We don't sell data. We don't show ads.
              You own everything. Export or delete anytime.
            </p>
          </div>
        </main>
        <footer className="land-footer"><p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></nav></footer>
      </div>
    </>
  );
}