import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, Route, CheckCircle2, ChevronRight, Brain, Clock, ShieldCheck, Sparkles, Layers, Award } from "lucide-react";
import { SITE_NAME, CANONICAL_SITE_URL, AUTHOR_INFO } from "@/lib/seo";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  return {
    title: "DSA Tracker — Free Data Structures & Algorithms Practice & Revision Tracker | FocusFlow",
    description: "The #1 free DSA tracker for coders. Track 18 modules from Arrays and Trees to Dynamic Programming. Includes SM-2 spaced repetition revision and LeetCode logging.",
    keywords: [
      "DSA tracker",
      "dsa tracker",
      "DSA sheet tracker",
      "dsa practice tracker",
      "dsa study tracker",
      "dsa progress tracker",
      "data structures and algorithms tracker",
      "focusflow dsa tracker",
      "focus flow dsa tracker",
      "leetcode study tracker",
      "coding interview roadmap"
    ],
    alternates: { canonical: `${CANONICAL_SITE_URL}/dsa-tracker` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: "DSA Tracker — Free Data Structures & Algorithms Practice & Revision Tracker",
      description: "Master Data Structures and Algorithms with structured 18-module milestone tracking, SM-2 spaced repetition, and focus session logging.",
      url: `${CANONICAL_SITE_URL}/dsa-tracker`,
      images: [{ url: `${CANONICAL_SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "FocusFlow DSA Tracker" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "DSA Tracker — FocusFlow",
      description: "Free Data Structures and Algorithms progress sheet and spaced repetition tracker.",
      images: [`${CANONICAL_SITE_URL}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

const DSA_MODULES = [
  { id: "01", name: "Complexity Analysis & Math", desc: "Big-O, Big-Theta, space complexity, logarithmics, and recurrence relations." },
  { id: "02", name: "Arrays & Dynamic Sizing", desc: "Contiguous memory, insertion, deletions, two pointers, and sliding window patterns." },
  { id: "03", name: "Strings & Pattern Matching", desc: "ASCII, unicode manipulation, anagrams, palindromes, and rolling hash techniques." },
  { id: "04", name: "Recursion & Backtracking", desc: "Call stack mechanics, base cases, permutations, subsets, and N-Queens archetypes." },
  { id: "05", name: "Sorting & Searching", desc: "Binary search on answers, merge sort, quick sort, and order statistics." },
  { id: "06", name: "Linked Lists", desc: "Singly, doubly linked lists, cycle detection (Floyd's algorithm), and in-place reversal." },
  { id: "07", name: "Stacks & Queues", desc: "Monotonic stacks, next greater element, sliding window maximum, and circular buffers." },
  { id: "08", name: "Binary Trees", desc: "Tree traversals (inorder, preorder, postorder, level-order), LCA, and maximum depth." },
  { id: "09", name: "Binary Search Trees (BST)", desc: "Validation, balanced BSTs (AVL/Red-Black fundamentals), predecessor & successor." },
  { id: "10", name: "Heaps & Priority Queues", desc: "Min/Max heaps, heapify in O(n), top-K elements, and two-heap median stream." },
  { id: "11", name: "Hashing & Hash Tables", desc: "Collision resolution, frequency maps, prefix sums, and two-sum generalizations." },
  { id: "12", name: "Graphs — Traversal & Topo Sort", desc: "Adjacency lists, BFS, DFS, cycle detection in directed/undirected graphs, Kahn's algorithm." },
  { id: "13", name: "Graphs — Shortest Paths & MST", desc: "Dijkstra, Bellman-Ford, Prim's and Kruskal's with Disjoint Set Union (DSU)." },
  { id: "14", name: "Dynamic Programming (1D)", desc: "Memoization vs tabulation, Fibonacci, climbing stairs, house robber, coin change." },
  { id: "15", name: "Dynamic Programming (2D & Strings)", desc: "Longest common subsequence, edit distance, 0/1 knapsack, matrix chain multiplication." },
  { id: "16", name: "Tries & Advanced Prefix Trees", desc: "Autocomplete search engines, prefix matching, bitwise tries for maximum XOR." },
  { id: "17", name: "Greedy Algorithms", desc: "Interval scheduling, jump game, gas station, and Huffman coding fundamentals." },
  { id: "18", name: "Bit Manipulation", desc: "Bitwise operators, bitmasks, finding single numbers, and subsets via power sets." },
];

const FAQS = [
  {
    q: "What is a DSA Tracker and why do I need one?",
    a: "A DSA tracker is a structured progress and revision system for Data Structures and Algorithms. Rather than solving random LeetCode problems, a DSA tracker organizes problems by topic dependencies and schedules automated reviews so you don't forget solutions after two weeks."
  },
  {
    q: "How does FocusFlow differ from traditional DSA sheets like Striver SDE or NeetCode 150?",
    a: "Static spreadsheets only let you check off a box. FocusFlow connects your practice with an active Pomodoro timer, calculates SuperMemo SM-2 spaced repetition intervals, tracks day streaks, and automatically schedules overdue topics onto your dashboard."
  },
  {
    q: "Can I use this DSA tracker for free?",
    a: "Yes. FocusFlow's DSA tracker is 100% free forever with no subscription paywalls, no limits on logged sessions, and no advertising."
  },
  {
    q: "Does the DSA tracker work offline?",
    a: "Yes. FocusFlow is built local-first. You can time your sessions and mark topics even without an active internet connection; your data syncs automatically when you re-connect."
  }
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${CANONICAL_SITE_URL}/dsa-tracker#page`,
      name: "DSA Tracker — Free Data Structures & Algorithms Practice & Revision Tracker",
      description: "Structured 18-module DSA journey with SM-2 spaced repetition revision and focus timers.",
      url: `${CANONICAL_SITE_URL}/dsa-tracker`,
      isPartOf: { "@id": `${CANONICAL_SITE_URL}/#website` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${CANONICAL_SITE_URL}/dsa-tracker#app`,
      name: "FocusFlow DSA Tracker",
      alternateName: ["DSA Tracker", "DSA Practice Tracker", "DSA Study Tracker", "FocusFlow DSA", "Focus Flow DSA Tracker"],
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: `${CANONICAL_SITE_URL}/dsa-tracker`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: "18-module structured roadmap, SM-2 spaced repetition revision, focus timer integration, streak tracking, consistency heatmaps",
    },
    {
      "@type": "FAQPage",
      "@id": `${CANONICAL_SITE_URL}/dsa-tracker#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL_SITE_URL}/dsa-tracker#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "DSA Tracker", item: `${CANONICAL_SITE_URL}/dsa-tracker` },
      ],
    },
  ],
};

export default function DsaTrackerPage() {
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
            <Link href="/dsa-tracker" className="active">DSA Tracker</Link>
            <Link href="/webdev-tracker">WebDev Tracker</Link>
            <Link href="/focus-timer">Focus Timer</Link>
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
            <span style={{ color: "var(--fg)", fontWeight: 600 }}>DSA Tracker</span>
          </nav>

          <section className="land-hero" style={{ textAlign: "center", padding: "10px 0 40px" }}>
            <p className="land-badge"><Route size={14} /> The Complete 18-Module Algorithm System</p>
            <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 800, margin: "14px 0 16px", color: "var(--fg)", lineHeight: 1.15 }}>
              Free Online <span className="land-hero-accent">DSA Tracker</span> &amp; Spaced Repetition Sheet
            </h1>
            <p className="land-sub" style={{ maxWidth: 720, margin: "0 auto 28px", color: "var(--muted)", fontSize: 16, lineHeight: 1.6 }}>
              Stop grinding LeetCode blind. Track every topic from Big-O to Dynamic Programming, schedule automated SM-2 reviews, and maintain deep consistency with FocusFlow (Your Study Tracker).
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/signup" className="btn-notion-primary" style={{ padding: "12px 28px", fontSize: 15 }}>
                Open Free DSA Tracker <ArrowRight size={16} />
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
                <Layers size={20} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>18 Structured Modules</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Logically sequenced from basic linear memory structures to complex graph cuts and bitmask DP. No knowledge gaps.
              </p>
            </div>

            <div className="card" style={{ padding: 24, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(26, 174, 57, 0.12)", color: "#1aae39", display: "grid", placeItems: "center", marginBottom: 14 }}>
                <Brain size={20} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>SM-2 Spaced Repetition</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Never forget an algorithm again. The spaced repetition engine serves review prompts (1d, 3d, 7d) right when recall fades.
              </p>
            </div>

            <div className="card" style={{ padding: 24, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", display: "grid", placeItems: "center", marginBottom: 14 }}>
                <Clock size={20} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--fg)" }}>Integrated Focus Timer</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                Time your coding sessions directly. Links each focus block to your active topic with auto-sync and streak protection.
              </p>
            </div>
          </section>

          {/* Complete 18-Module Roadmap Overview */}
          <section style={{ margin: "60px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--fg)", marginBottom: 8 }}>
                The 18-Module Data Structures &amp; Algorithms Curriculum
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>
                Every topic tracked in FocusFlow with status states: <i>Not Started</i>, <i>Learning</i>, <i>Revising</i>, and <i>Mastered</i>.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {DSA_MODULES.map((m) => (
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

          {/* FAQ Section with Rich SEO Schema */}
          <section style={{ margin: "60px 0" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg)", marginBottom: 20 }}>
              Frequently Asked Questions About DSA Tracking
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

          {/* Bottom Conversion Banner */}
          <section className="card" style={{ padding: 40, textAlign: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, color: "var(--fg)" }}>
              Ready to Master Data Structures &amp; Algorithms?
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 14.5, maxWidth: 560, margin: "0 auto 24px" }}>
              Join thousands of engineers who track daily problem sprints, keep streaks alive, and conquer technical interviews with FocusFlow.
            </p>
            <Link href="/signup" className="btn-notion-primary" style={{ padding: "12px 28px", fontSize: 15 }}>
              Start Your Free DSA Tracker <ArrowRight size={16} />
            </Link>
          </section>
        </main>
      </div>
    </>
  );
}
