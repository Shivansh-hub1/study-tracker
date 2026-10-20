import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, Home, BookOpen, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found (404) — FocusFlow",
  description: "The page you are looking for does not exist or has been moved. Explore FocusFlow's study timer, roadmaps, and blog guides.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="land" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="land-nav">
        <Link href="/" className="land-logo">
          <span className="land-logo-icon"><GraduationCap size={22} /></span>
          Focus<span className="glow-text">Flow</span>
        </Link>
        <nav className="land-links" aria-label="Primary">
          <Link href="/#features">Features</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link>
        </nav>
      </header>

      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 540 }}>
          <p className="land-badge" style={{ margin: "0 auto 16px" }}>
            <Compass size={14} /> Error 404
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, margin: "0 0 16px", color: "var(--fg)" }}>
            Page Not Found
          </h1>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.6, marginBottom: 32 }}>
            The page you requested doesn't exist or may have been relocated. Jump back into your study sprint or explore our engineering blog.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-primary btn-lg">
              <Home size={16} /> Return to Home
            </Link>
            <Link href="/blog" className="btn btn-lg">
              <BookOpen size={16} /> Read Blog Guides
            </Link>
          </div>
        </div>
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
  );
}
