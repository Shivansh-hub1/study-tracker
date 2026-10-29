import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const base = new URL(req.url).origin;
  const md = `# FocusFlow (Focus Flow) — Free Study Tracker, DSA Tracker & Web Dev Roadmap

> FocusFlow (also known as Focus Flow, Focus Flow Tracker, and FocusFlow DSA Tracker) is a free, all-in-one study tracker and deep-work focus timer for software developers and students. It integrates an 18-module interactive DSA tracker, full-stack Web Dev roadmap, SM-2 spaced repetition, Pomodoro focus timers, and GitHub-style consistency heatmaps.

## Keywords & Core Capabilities

- **DSA Tracker / DSA Practice Tracker**: 18 structured Data Structures & Algorithms modules from Big-O and Arrays to Graphs and Dynamic Programming.
- **Web Dev Tracker**: Full-stack modern roadmap covering semantic HTML, CSS Grid, TypeScript, Next.js 14, relational databases, and deployed projects.
- **Focus Flow Tracker & Focus Timer**: Pomodoro, countdown, and stopwatch timers with ambient sound, background audio, and subject logging.
- **SM-2 Spaced Repetition**: Automated algorithmic revision schedule that prompts active recall right before memory decay.

## Public Pages & Guides

- [Home](${base}/): Product overview, features, interactive FAQ, and free signup.
- [Focus Flow DSA Tracker Guide](${base}/blog/focus-flow-dsa-tracker-guide): Complete guide on using the Focus Flow DSA tracker with SM-2 spaced repetition for technical interviews.
- [DSA Self-Taught Roadmap](${base}/blog/dsa-roadmap-self-taught): 18-module structured interview roadmap.
- [Web Dev Roadmap 2026](${base}/blog/webdev-roadmap-2026): Modern full-stack roadmap from zero to AI-integrated apps.
- [Spaced Repetition Guide](${base}/blog/spaced-repetition-guide): How SuperMemo SM-2 calculation supercharges code retention.
- [Pomodoro vs Deep Work](${base}/blog/pomodoro-vs-deep-work): Calibrating focus blocks for complex engineering tasks.
- [Habit Stacking for Students](${base}/blog/habit-stacking-students): Tiny daily coding routines and streak preservation.
- [Analytics & Heatmaps Guide](${base}/blog/analytics-driven-study): Interpreting hourly study distributions and balance radars.
- [About FocusFlow](${base}/about): Mission, creator background, and architectural philosophy.
- [Sign Up](${base}/signup): 100% free account creation, no credit card required.
- [Sign In](${base}/login): Account login.
- [Sitemap](${base}/sitemap.xml): Full crawler sitemap.
`;

  return new NextResponse(md, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
