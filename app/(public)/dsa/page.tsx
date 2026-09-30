import type { Metadata } from "next";
import Link from "next/link";
import { Route, Check, Play, Trophy, Clock, ArrowRight, ChevronDown, CheckCheck, Brain, Target } from "lucide-react";
import { SITE_DESCRIPTION, SITE_NAME, siteBaseUrl } from "@/lib/seo";

const DSA_TOPICS = [
  { title: "Arrays & Hashing", blurb: "Two Sum, Best Time to Buy Stock, Contains Duplicate, Product of Array Except Self, Valid Anagram, Group Anagrams, Top K Frequent, Encode/Decode Strings" },
  { title: "Two Pointers", blurb: "Valid Palindrome, Two Sum II, 3Sum, Container With Most Water, Trapping Rain Water" },
  { title: "Sliding Window", blurb: "Best Time to Buy Stock, Longest Substring Without Repeating, Longest Repeating Character Replacement, Permutation in String, Minimum Window Substring" },
  { title: "Stack", blurb: "Valid Parentheses, Min Stack, Evaluate Reverse Polish Notation, Generate Parentheses, Daily Temperatures, Car Fleet, Largest Rectangle in Histogram" },
  { title: "Binary Search", blurb: "Binary Search, Search 2D Matrix, Koko Eating Bananas, Find Minimum in Rotated Sorted Array, Search in Rotated Sorted Array, Time Based Key-Value Store, Median of Two Sorted Arrays" },
  { title: "Linked List", blurb: "Reverse Linked List, Merge Two Sorted Lists, Reorder List, Remove Nth Node From End, Copy List with Random Pointer, Add Two Numbers, Find Duplicate Number, LRU Cache" },
  { title: "Trees", blurb: "Invert Binary Tree, Maximum Depth, Diameter, Balanced Binary Tree, Same Tree, Subtree of Another Tree, Lowest Common Ancestor, Binary Tree Level Order, Binary Tree Right Side View, Count Good Nodes, Validate BST, Kth Smallest, Construct Binary Tree from Preorder/Inorder, Serialize/Deserialize" },
  { title: "Tries", blurb: "Implement Trie, Add/Search Word, Word Search II" },
  { title: "Heap / Priority Queue", blurb: "Kth Largest Element, Last Stone Weight, K Closest Points, Task Scheduler, Design Twitter, Find Median from Data Stream" },
  { title: "Backtracking", blurb: "Subsets, Combination Sum, Permutations, Subsets II, Word Search, N-Queens" },
  { title: "Graphs", blurb: "Number of Islands, Max Area of Island, Clone Graph, Walls and Gates, Rotting Oranges, Pacific Atlantic Water Flow, Surrounded Regions, Course Schedule, Course Schedule II, Redundant Connection, Number of Connected Components" },
  { title: "Advanced Graphs", blurb: "Dijkstra, Network Delay Time, Swim in Rising Water, Alien Dictionary, Cheapest Flights K Stops, Minimum Cost to Connect All Points, Reconstruct Itinerary" },
  { title: "1-D Dynamic Programming", blurb: "Climbing Stairs, House Robber, Coin Change, Longest Increasing Subsequence, Word Break, Coin Change II, Maximum Product Subarray, House Robber II, Decode Ways, Unique Paths, Jump Game" },
  { title: "2-D Dynamic Programming", blurb: "Unique Paths, Longest Common Subsequence, Best Time to Buy Stock with Cooldown, Edit Distance, Distinct Subsequences, Interleaving String, Regular Expression Matching" },
  { title: "Greedy", blurb: "Maximum Subarray, Jump Game, Gas Station, Hand of Straights, Merge Triplets, Valid Parenthesis String" },
  { title: "Intervals", blurb: "Insert Interval, Merge Intervals, Non-overlapping Intervals, Meeting Rooms, Meeting Rooms II" },
  { title: "Bit Manipulation", blurb: "Single Number, Number of 1 Bits, Counting Bits, Missing Number, Sum of Two Integers, Reverse Bits" },
  { title: "Math & Geometry", blurb: "Pow(x, n), Sqrt(x), Fraction to Recurring Decimal, Happy Number, Excel Sheet Column Number" },
];

const DSA_FEATURES = [
  { icon: Target, title: "Structured 18-module journey", text: "From Arrays to Advanced Graphs — every topic in the right order, no guesswork." },
  { icon: Brain, title: "Lecture-level granularity", text: "Each module breaks into bite-sized lectures. Track progress per video/concept, not just per topic." },
  { icon: CheckCheck, title: "Smart status flow", text: "Todo → Doing → Revising → Mastered. Revision queues surface topics right before you forget." },
  { icon: Clock, title: "Timer integration", text: "Pick 'DSA' as your focus subject — the timer auto-selects your current topic and logs time to it." },
  { icon: Play, title: "Complete-above shortcut", text: "One click marks all earlier modules done. Perfect for experienced devs skipping basics." },
  { icon: Trophy, title: "Achievements & XP", text: "Unlock badges for milestones: First Steps, Half Century, Century, Machine, Immortal." },
];

export async function generateMetadata(): Promise<Metadata> {
  const base = siteBaseUrl();
  return {
    title: "DSA Roadmap — Free Structured Data Structures & Algorithms Journey | FocusFlow",
    description: "Master DSA with a free 18-module roadmap. Track every topic lecture-by-lecture, auto-revision queues, Pomodoro timer integration, and progress analytics. No credit card required.",
    alternates: { canonical: `${base}/dsa` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: "DSA Roadmap — Free Data Structures & Algorithms Journey",
      description: "Master DSA with a free 18-module roadmap. Track topics lecture-by-lecture with auto-revision and timer integration.",
      url: "/dsa",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FocusFlow DSA Roadmap — Structured journey from Arrays to Advanced Graphs" }],
    },
    twitter: { card: "summary_large_image", title: "DSA Roadmap — Free DSA Journey", description: "18 modules, lecture-level tracking, auto-revision, timer integration. Free forever.", images: ["/opengraph-image"] },
  };
}

const base = siteBaseUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      "@id": `${base}/dsa#topics`,
      name: "DSA Roadmap Topics",
      description: "Complete 18-module Data Structures & Algorithms curriculum",
      numberOfItems: DSA_TOPICS.length,
      itemListElement: DSA_TOPICS.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.title,
        description: t.blurb,
      })),
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${base}/dsa#app`,
      name: "FocusFlow DSA Tracker",
      url: `${base}/dsa`,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      description: "Free DSA roadmap with lecture-level tracking, spaced revision, Pomodoro timer integration, and progress analytics.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
      featureList: DSA_FEATURES.map(f => f.title).join(", "),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${base}/dsa#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
        { "@type": "ListItem", position: 2, name: "DSA Roadmap", item: `${base}/dsa` },
      ],
    },
  ],
};

export default function DsaPublicPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="land">
        <header className="land-nav">
          <Link href="/" className="land-logo"><span className="land-logo-icon"><Route size={22} /></span>Focus<span className="glow-text">Flow</span></Link>
          <nav className="land-links" aria-label="Primary">
            <Link href="/dsa">DSA</Link>
            <Link href="/webdev">WebDev</Link>
            <Link href="/revision">Revision</Link>
            <Link href="/habits">Habits</Link>
            <Link href="/progress">Analytics</Link>
            <Link href="/achievements">Achievements</Link>
            <Link href="/timer">Timer</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Start free <ArrowRight size={14} /></Link>
          </nav>
        </header>

        <main>
          <section className="land-hero" style={{ background: "linear-gradient(135deg, #f59e0b10 0%, transparent 60%), var(--surface)" }}>
            <p className="land-badge"><Target size={14} /> 18 modules · Lecture-level tracking · Auto-revision</p>
            <h1>DSA Roadmap.<br /><span className="glow-text" style={{ color: "#f59e0b" }}>Master every topic.</span></h1>
            <p className="land-sub">A complete, free Data Structures & Algorithms journey. Mark topics Learning → Revising → Mastered. Built-in spaced repetition queues. Timer auto-logs to your current topic.</p>
            <div className="land-cta">
              <Link href="/signup" className="btn btn-primary btn-lg">Start DSA free <ArrowRight size={17} /></Link>
              <Link href="/login" className="btn btn-lg">Sign in</Link>
            </div>
            <ul className="land-ticks"><li><Check size={14} /> Free forever</li><li><Check size={14} /> No setup required</li><li><Check size={14} /> Works offline-first</li></ul>
          </section>

          <section className="land-section" aria-labelledby="features-h">
            <h2 id="features-h">Built for how you actually study DSA</h2>
            <p className="land-sec-sub">Not just a checklist — a learning system.</p>
            <div className="land-grid">
              {DSA_FEATURES.map((f) => (
                <article key={f.title} className="card land-card">
                  <span className="land-ico"><f.icon size={20} /></span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="land-section" aria-labelledby="curriculum-h">
            <h2 id="curriculum-h">Complete curriculum — 18 modules, 200+ lectures</h2>
            <div className="land-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
              {DSA_TOPICS.map((t, i) => (
                <details key={t.title} className="card land-card" style={{ maxWidth: "none" }}>
                  <summary style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</span>
                    <ChevronDown size={16} style={{ marginLeft: "auto", color: "var(--muted)" }} />
                  </summary>
                  <p style={{ marginTop: 10, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6 }}>{t.blurb}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="land-section" aria-labelledby="how-h">
            <h2 id="how-h">Start in 30 seconds</h2>
            <div className="land-steps">
              <article className="card land-step"><span className="land-num">1</span><h3>Create free account</h3><p>20 seconds. No card. No setup.</p></article>
              <article className="card land-step"><span className="land-num">2</span><h3>Pick "DSA" subject</h3><p>Timer auto-selects your current topic.</p></article>
              <article className="card land-step"><span className="land-num">3</span><h3>Focus & log</h3><p>Time tracked per lecture. Revision auto-queued.</p></article>
            </div>
            <div className="land-cta land-cta-center"><Link href="/signup" className="btn btn-primary btn-lg">Begin your DSA journey <ArrowRight size={17} /></Link></div>
          </section>

          <section className="land-final card" style={{ background: "linear-gradient(135deg, #f59e0b10 0%, transparent 60%), var(--surface)" }}>
            <h2>Ready to crack the coding interview?</h2>
            <p>Join thousands mastering DSA with FocusFlow. Free, structured, and built for consistency.</p>
            <div className="land-cta land-cta-center"><Link href="/signup" className="btn btn-primary btn-lg">Start free <ArrowRight size={17} /></Link></div>
          </section>
        </main>
        <footer className="land-footer"><p><strong>Focus<span className="glow-text">Flow</span></strong> — Deep-focus study tracker.</p><nav aria-label="Footer"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link><Link href="/signup">Create account</Link><Link href="/login">Sign in</Link></nav></footer>
      </div>
    </>
  );
}