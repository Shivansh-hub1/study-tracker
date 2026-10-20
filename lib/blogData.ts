import { AUTHOR_INFO } from "./seo";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  metaDescription: string;
  faqs: { q: string; a: string }[];
  content: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "spaced-repetition-guide",
    title: "Spaced Repetition for Programmers: The Practical SM-2 Guide",
    excerpt: "Why cramming syntax and LeetCode solutions fails after 48 hours, how SuperMemo SM-2 calculation works, and how FocusFlow automates your daily revision queue.",
    date: "2026-09-15",
    readTime: "8 min",
    tags: ["Learning", "DSA", "Productivity"],
    metaDescription: "Master spaced repetition for coding: how the SuperMemo SM-2 algorithm works, why cramming LeetCode fails, and how to automate your daily revision queues.",
    faqs: [
      {
        q: "How does the SM-2 algorithm calculate review intervals?",
        a: "SM-2 calculates intervals using an Easiness Factor (EF). If you rate a topic as easy, EF stays steady or increases, pushing the next interval from 1 day to 6 days, then 16 days. If you fail, the interval resets to 1 day."
      },
      {
        q: "Why does spaced repetition work better than cramming for coding interviews?",
        a: "Cramming stores problem patterns in short-term working memory. Spaced repetition forces active recall right as your brain begins to forget, transferring algorithms to long-term memory."
      },
      {
        q: "How many topics should I revise per day?",
        a: "Aim for 5 to 10 review items before starting new learning. In FocusFlow, the Smart Revision Queue automatically presents only what is due today."
      }
    ],
    content: [
      "Every developer has experienced the LeetCode trap: you spend two weeks grinding dynamic programming, feel like a genius, and three weeks later you can't even remember the base case of Coin Change.",
      "Cramming fails because human memory follows an exponential forgetting curve discovered by Hermann Ebbinghaus. Without active retrieval, over 70% of new syntax and algorithm patterns evaporate within 48 hours.",
      "The SuperMemo SM-2 algorithm solves this by scheduling reviews at the exact moment of near-forgetting. The interval equation is straightforward: I(1) = 1 day, I(2) = 6 days, and I(n) = I(n-1) × EF, where EF (Easiness Factor) adjusts based on your self-grade.",
      "In FocusFlow, when you mark a DSA module or WebDev chapter as 'Mastered', the system schedules it into your revision queue. You rate it Again, Hard, or Easy, and FocusFlow handles the calendar math automatically."
    ]
  },
  {
    slug: "pomodoro-vs-deep-work",
    title: "Pomodoro vs. Deep Work: What Actually Works for Complex Engineering?",
    excerpt: "The science of attention residues, why arbitrary 25-minute bells interrupt hard debugging flow states, and how to calibrate custom focus blocks for programming.",
    date: "2026-09-08",
    readTime: "6 min",
    tags: ["Focus", "Productivity", "Timer"],
    metaDescription: "Pomodoro vs. Deep Work for developers: why 25-minute timers break complex debugging flow and how to configure 50/10 focus sprints for software engineering.",
    faqs: [
      {
        q: "Is 25 minutes too short for coding?",
        a: "For shallow tasks like code reviews or documentation, 25 minutes is great. For difficult debugging or writing complex algorithms, 50-minute or 90-minute focus blocks prevent attention fragmentation."
      },
      {
        q: "What should I do during Pomodoro breaks?",
        a: "Step away from screens. Hydrate, stretch, or look out a window. Checking social media or Discord causes attention residue that ruins your next sprint."
      },
      {
        q: "Does FocusFlow support custom block lengths?",
        a: "Yes. FocusFlow includes stopwatch, countdown, and fully customizable Pomodoro durations (e.g. 50m work / 10m break)."
      }
    ],
    content: [
      "The classic 25/5 Pomodoro technique was invented by Francesco Cirillo using a kitchen tomato timer. It works wonders for administrative tasks, but software engineering has a unique requirement: context compilation.",
      "Research by Gloria Mark at UC Irvine shows it takes an average of 23 minutes just to reload a complex mental model after an interruption. If your timer dings right at minute 25, you are cut off right when your brain enters peak flow.",
      "Instead of dogmatic 25-minute sprints, productive engineers use 50/10 or 90/20 cycles. The 50-minute sprint provides ample runway to read stack traces, write test cases, and verify edge conditions.",
      "Use FocusFlow's session timer to log exact minutes against specific subjects. When you complete a sprint, tag your accomplishments so your consistency heatmap reflects real output, not just desk time."
    ]
  },
  {
    slug: "dsa-roadmap-self-taught",
    title: "The Self-Taught Developer's DSA Roadmap: 18 Modules to Interview Ready",
    excerpt: "A structured, module-by-module breakdown from Big-O and arrays to graphs, DP, and bit manipulation. No tutorial hell, just focused deliberate practice.",
    date: "2026-09-01",
    readTime: "12 min",
    tags: ["DSA", "Career", "Roadmap"],
    metaDescription: "Complete self-taught Data Structures and Algorithms roadmap: 18 structured modules from Big-O and Trees to Dynamic Programming with actionable milestones.",
    faqs: [
      {
        q: "What programming language is best for learning DSA?",
        a: "Python, C++, or Java. Python is great for speed in interviews; C++ gives you deep appreciation of memory, pointers, and cache locality."
      },
      {
        q: "How many problems should I solve per topic?",
        a: "Focus on 5–7 classic archetype problems per pattern (e.g., Two Pointers, Sliding Window, Fast & Slow Pointers) rather than solving 50 random problems."
      },
      {
        q: "Where do I track my DSA milestone progress?",
        a: "FocusFlow includes an integrated 18-module DSA journey where you can mark topics as Learning, Revising, or Mastered."
      }
    ],
    content: [
      "Tutorial hell in computer science is caused by lack of structure. Students jump from a random binary search video to a complex dynamic programming tutorial without mastering recursion first.",
      "Our 18-module roadmap groups fundamentals into logical dependencies: Module 1-4 covers Complexity Analysis, Arrays, Strings, and Two Pointers. Modules 5-9 introduces Linked Lists, Stacks, Queues, and Binary Trees.",
      "Modules 10-14 tackles Heaps, Backtracking, Graphs (BFS/DFS), and Topological Sort. Finally, Modules 15-18 focuses on Dynamic Programming, Greedy Algorithms, and Bit Manipulation.",
      "Instead of hoarding bookmarks, focus on pattern recognition. When you identify whether a problem uses Monotonic Stack or Breadth-First Search, the syntax becomes trivial."
    ]
  },
  {
    slug: "habit-stacking-students",
    title: "Habit Stacking for Students: Tiny Routines That Build Massive Streaks",
    excerpt: "How BJ Fogg and James Clear's behavioral loops apply to daily coding: anchoring timers to morning coffee and utilizing streak freezes without feeling guilty.",
    date: "2026-08-25",
    readTime: "7 min",
    tags: ["Habits", "Consistency", "Psychology"],
    metaDescription: "Learn habit stacking for students and developers: how to anchor study sessions to existing daily routines, maintain momentum, and use streak freezes strategically.",
    faqs: [
      {
        q: "What is habit stacking?",
        a: "Habit stacking pairs a new behavior with an established daily habit: 'After I pour my morning coffee, I will open FocusFlow and start a 25-minute session.'"
      },
      {
        q: "What happens if I miss a day in my study streak?",
        a: "FocusFlow includes built-in streak freeze tokens. Life happens; a freeze day preserves your hard-earned streak while you recharge."
      },
      {
        q: "How long does it take to make coding a daily habit?",
        a: "Studies indicate an average of 66 days for automaticity. Starting small (just 15 minutes daily) beats burning out with 4-hour weekend marathons."
      }
    ],
    content: [
      "Relying on motivation is the quickest route to burnout. Motivation fluctuates with sleep, stress, and workload; systems and habits remain steady.",
      "The formula for habit stacking is: 'After [CURRENT HABIT], I will [NEW HABIT].' For example: 'After I sit down at my desk at 8:00 AM, I will open FocusFlow and review my 3 due revision cards.'",
      "Lower the barrier to entry until it is impossible to say no. A 15-minute focused session logged on your tracker builds the neurological identity of a consistent builder.",
      "FocusFlow rewards this consistency with XP, level progression, and 84 unlockable achievements. Watch your consistency heatmap fill with vibrant green squares."
    ]
  },
  {
    slug: "webdev-roadmap-2026",
    title: "Web Development Roadmap 2026: Semantic HTML to Production Full-Stack",
    excerpt: "The modern web engineering stack: semantic markup, TypeScript strictness, server-side rendering with Next.js, relational database architecture, and real deployment.",
    date: "2026-08-18",
    readTime: "15 min",
    tags: ["WebDev", "Career", "Roadmap"],
    metaDescription: "The definitive 2026 Web Development Roadmap: Semantic HTML, strict TypeScript, Next.js App Router, SQLite/Postgres databases, and full-stack project milestones.",
    faqs: [
      {
        q: "Do I still need to learn vanilla CSS before Tailwind?",
        a: "Yes. Understanding CSS Box Model, Flexbox, Grid, and specificity ensures you understand what utility classes are actually doing under the hood."
      },
      {
        q: "Why is Server-Side Rendering (SSR) preferred in modern web apps?",
        a: "SSR delivers fast initial page loads, optimal Core Web Vitals (LCP < 1.5s), and ensures search engine crawlers index complete HTML without executing heavy JS."
      },
      {
        q: "What projects should I build for my portfolio?",
        a: "Build full-stack applications with authentication, relational data models, and background processing rather than another basic todo list."
      }
    ],
    content: [
      "The web development landscape evolves rapidly, but the foundational pillars remain constant: semantic markup, resilient CSS layouts, clean JavaScript runtime fundamentals, and performant server architecture.",
      "In Phase 1, master semantic HTML5, accessible ARIA attributes, modern Flexbox, and CSS Grid. Avoid premature framework adoption until you can build responsive landing pages without libraries.",
      "In Phase 2, transition into TypeScript. Strict type safety catches 80% of runtime errors before your code ever hits staging.",
      "In Phase 3, build full-stack applications using Next.js 14, server components, and SQLite/PostgreSQL databases. FocusFlow's 18-module WebDev roadmap guides you through every step."
    ]
  },
  {
    slug: "analytics-driven-study",
    title: "Data-Driven Studying: What Your Focus Heatmap Is Actually Telling You",
    excerpt: "Moving beyond vanity metrics: analyzing your hourly distribution, subject balance, and weekly deltas to identify peak cognitive hours and prevent burnout.",
    date: "2026-08-11",
    readTime: "9 min",
    tags: ["Analytics", "Productivity", "Insights"],
    metaDescription: "Data-driven studying guide: how to analyze your hourly focus heatmap, balance subject distribution, and optimize study times using actionable analytics.",
    faqs: [
      {
        q: "What is a focus heatmap?",
        a: "A 20-week visual grid displaying your study intensity across hours of the day and days of the week, highlighting when you are most productive."
      },
      {
        q: "How do I avoid over-studying one subject?",
        a: "Check your subject split radar in FocusFlow. If DSA is taking 85% of your time while project work sits at 5%, adjust your weekly planner blocks."
      },
      {
        q: "How does FocusFlow protect my analytics privacy?",
        a: "All session metrics are saved locally in your browser SQLite database. Your study data belongs entirely to you."
      }
    ],
    content: [
      "Many learners track time just to feel busy. But tracking 40 hours of passive video watching produces far less learning than 15 hours of active, deliberate coding.",
      "FocusFlow's analytics dashboard breaks down your study history into actionable dimensions: hourly heatmaps reveal your biological peak focus windows (e.g. 9 AM–11 AM vs. 8 PM–10 PM).",
      "Subject split charts prevent lopsided preparation. Balancing theory, problem-solving, and hands-on project builds prevents cognitive fatigue.",
      "Review your weekly delta report every Sunday. Seeing steady 10% gains compounds into hundreds of hours of mastery over a semester."
    ]
  }
];
