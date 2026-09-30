import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const base = new URL(req.url).origin;
  const md = `# FocusFlow

> FocusFlow is a free study tracker with a focus timer, session logging, DSA and WebDev roadmaps, revision planner, habits and progress analytics.

## Public Pages

- [Home](${base}/): product overview, features, FAQ and signup links
- [DSA Roadmap](${base}/dsa): 18-module Data Structures & Algorithms journey with lecture-level tracking
- [WebDev Roadmap](${base}/webdev): 18-module full-stack journey (HTML to AI) with 3 deployed projects
- [Revision Planner](${base}/revision): SM-2 spaced repetition for DSA & WebDev topics
- [Habits & Streaks](${base}/habits): daily habits, streak freeze days, 7-day heatmap
- [Progress Analytics](${base}/progress): daily/weekly/monthly trends, subject radar, 20-week heatmap
- [Achievements](${base}/achievements): 84 badges across 10 categories, 4 rarity tiers
- [Focus Timer Demo](${base}/timer): live Pomodoro, countdown, stopwatch with background mode
- [About](${base}/about): mission, team, philosophy, tech stack
- [Privacy Policy](${base}/privacy): your data, your control
- [Terms of Service](${base}/terms): simple, fair, readable
- [Blog](${base}/blog): study smarter guides (spaced repetition, Pomodoro, DSA, WebDev, habits, analytics)
- [Sign up](${base}/signup): create a free account
- [Sign in](${base}/login): log in to an existing account
- [Sitemap](${base}/sitemap.xml): all public URLs

## Features

- Focus timer with stopwatch, countdown and Pomodoro modes (background mode, subject tagging, lap timing)
- Session logging with subjects, notes and per-topic time
- Step-by-step DSA and Web Development journeys with revision queues
- Weekly planner blocks and checklists
- Daily habits, study streaks with freeze days and consistency heatmaps
- Progress analytics: trends, subject split, study-by-hour and XP levels
- Achievements and shareable progress cards (84 badges, 10 categories)
- PWA with offline support, service worker, background sync

## Access notes

- Only the pages listed above are public. All app pages (/dashboard, /sessions, /subjects, /planner, /settings, etc.) require login and are blocked in robots.txt.
- The app is free for learners. No scraping of logged-in pages is permitted.
- Structured data (JSON-LD) available on all public pages: WebSite, SoftwareApplication, FAQPage, ItemList, HowTo, BreadcrumbList, Organization
`;

  return new NextResponse(md, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}