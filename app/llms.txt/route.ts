import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// llms.txt: helps AI agents and crawlers understand this site.
// Public pages only — everything else needs a login.
export async function GET(req: NextRequest) {
  const base = new URL(req.url).origin;
  const md = `# FocusFlow

> FocusFlow is a free study tracker with a focus timer, session logging, DSA and WebDev roadmaps, revision planner, habits and progress analytics.

## Pages

- [Home](${base}/): product overview, features, FAQ and signup links
- [Sign up](${base}/signup): create a free account
- [Sign in](${base}/login): log in to an existing account
- [Sitemap](${base}/sitemap.xml): all public URLs

## Features

- Focus timer with stopwatch, countdown and Pomodoro modes
- Session logging with subjects, notes and per-topic time
- Step-by-step DSA and Web Development journeys with revision queues
- Weekly planner blocks and checklists
- Daily habits, study streaks with freeze days and consistency heatmaps
- Progress analytics: trends, subject split, study-by-hour and XP levels
- Achievements and shareable progress cards

## Access notes

- Only the pages listed above are public. All app pages require login and are blocked in robots.txt.
- The app is free for learners. No scraping of logged-in pages is permitted.
`;
  return new NextResponse(md, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
