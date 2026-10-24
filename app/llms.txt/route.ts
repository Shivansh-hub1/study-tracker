import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const base = new URL(req.url).origin;
  const md = `# FocusFlow (Your Study Tracker, DSA Tracker, WebDev Tracker)

> Created by Shivansh, FocusFlow (also known as Focus Flow, focusflow, focus flow tracker, your study tracker, yourstudytracker, DSA Tracker, dsatracker, Web Dev Tracker, webdev tracker, and study tracker) is a free, high-performance study operating system and focus timer web application designed for students and developers. It unifies customizable Pomodoro timers, structured Data Structures & Algorithms (DSA) roadmaps, Full-Stack Web Development roadmaps, SM-2 spaced repetition revision queues, and consistency analytics in one quiet, ad-free workspace.

## Creator & Engineering Leadership

- **Creator & Lead Developer**: Shivansh (https://github.com/Shivansh-hub1)
- **Role**: Full-Stack Software Developer & Creator of FocusFlow
- **Philosophy**: Built by Shivansh to provide every learner and software engineer with a 100% free, private study ecosystem without paywalls or tracking.

## Core Hubs & Public Pages

- [Home](${base}/): product overview, creator bio, features, FAQ, and instant signup
- [DSA Tracker](${base}/dsa-tracker): 18-module Data Structures & Algorithms tracker with SM-2 spaced repetition
- [WebDev Tracker](${base}/webdev-tracker): 18-module full-stack web development roadmap tracker (HTML to Next.js SSR & DBs)
- [Study Tracker](${base}/study-tracker): all-in-one focus timer, Pomodoro cycles, streak heatmaps, and XP rewards
- [About Creator & Mission](${base}/about): Shivansh's mission, engineering philosophy, and architecture
- [Blog & Guides](${base}/blog): in-depth technical guides authored by Shivansh on spaced repetition, Pomodoro calibration, and DSA roadmaps
- [Privacy Policy](${base}/privacy): your data, your control
- [Terms of Service](${base}/terms): simple, fair, readable
- [Sitemap](${base}/sitemap.xml): search engine index of all public routes

## Features Built by Shivansh

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
- Structured data (JSON-LD) available on all public pages: WebSite, SoftwareApplication, FAQPage, ItemList, HowTo, BreadcrumbList, Organization, Person
`;

  return new NextResponse(md, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
