export type S = any;
export type Badge = { id: string; name: string; desc: string; icon: string; rarity: string; category: string; test: (s: S) => boolean; prog: (s: S) => [number, number] };

const num = (v: any) => (typeof v === "number" && !isNaN(v) ? v : 0);
export const bestDay = (s: S) => Math.max(0, ...((s.daily || []).map((d: any) => num(d.minutes))));
export const activeLast30 = (s: S) => (s.daily || []).filter((d: any) => num(d.minutes) > 0).length;
export const earlyMin = (s: S) => [5, 6, 7].reduce((a: number, h: number) => a + num((s.hourly || [])[h]), 0);
export const nightMin = (s: S) => [22, 23, 0, 1].reduce((a: number, h: number) => a + num((s.hourly || [])[h]), 0);
export const pomoMin = (s: S) => num((s.byType || []).find((t: any) => t.type === "pomodoro")?.minutes);
export const subjCount = (s: S) => (s.bySubjectAll || []).length;
export const maxWeekly = (s: S) => Math.max(0, ...((s.weekly || []).map((w: any) => num(w.minutes))));
export const maxMonthly = (s: S) => Math.max(0, ...((s.monthly || []).map((m: any) => num(m.minutes))));
export const perfectWeek = (s: S) => (s.daily || []).slice(-7).every((d: any) => num(d.minutes) > 0) && (s.daily || []).length >= 7;
export const perfectMonth = (s: S) => activeLast30(s) >= 30;
export const weekendCount = (s: S) => (s.daily || []).filter((d: any) => { try { const day = new Date(d.date).getDay(); return (day === 0 || day === 6) && num(d.minutes) > 0; } catch { return false; } }).length;
export const timerTypesUsed = (s: S) => (s.byType || []).filter((t: any) => num(t.minutes) > 0).length;
export const hourlyAt = (s: S, h: number) => num((s.hourly || [])[h]);
export const hasDawn = (s: S) => hourlyAt(s, 5) > 0;
export const hasNoon = (s: S) => hourlyAt(s, 12) > 0;
export const activeTotal140 = (s: S) => (s.heat || []).filter((d: any) => num(d.minutes) > 0).length;
export const allHoursCovered = (s: S) => (s.hourly || []).filter((m: any) => num(m) > 0).length;
export const perfect90 = (s: S) => activeTotal140(s) >= 90;
export const perfect140 = (s: S) => activeTotal140(s) >= 140;

export const BADGES: Badge[] = [
  // SESSIONS
  { id: "first", name: "First Steps", desc: "Log your first session", icon: "🌱", rarity: "common", category: "sessions", test: (s) => s.totalSessions >= 1, prog: (s) => [Math.min(s.totalSessions, 1), 1] },
  { id: "s10", name: "Getting Serious", desc: "Log 10 sessions", icon: "📚", rarity: "common", category: "sessions", test: (s) => s.totalSessions >= 10, prog: (s) => [Math.min(s.totalSessions, 10), 10] },
  { id: "s50", name: "Half Century", desc: "Log 50 sessions", icon: "🔥", rarity: "rare", category: "sessions", test: (s) => s.totalSessions >= 50, prog: (s) => [Math.min(s.totalSessions, 50), 50] },
  { id: "s100", name: "Century", desc: "Log 100 sessions", icon: "💯", rarity: "epic", category: "sessions", test: (s) => s.totalSessions >= 100, prog: (s) => [Math.min(s.totalSessions, 100), 100] },
  { id: "s250", name: "Unstoppable", desc: "Log 250 sessions", icon: "⚔️", rarity: "epic", category: "sessions", test: (s) => s.totalSessions >= 250, prog: (s) => [Math.min(s.totalSessions, 250), 250] },
  { id: "s500", name: "Machine", desc: "Log 500 sessions", icon: "🤖", rarity: "legendary", category: "sessions", test: (s) => s.totalSessions >= 500, prog: (s) => [Math.min(s.totalSessions, 500), 500] },
  { id: "s1000", name: "Immortal", desc: "Log 1,000 sessions", icon: "🤯", rarity: "legendary", category: "sessions", test: (s) => s.totalSessions >= 1000, prog: (s) => [Math.min(s.totalSessions, 1000), 1000] },

  // STREAKS
  { id: "st3", name: "On a Roll", desc: "Reach a 3-day streak", icon: "⚡", rarity: "common", category: "streak", test: (s) => s.streak >= 3, prog: (s) => [Math.min(s.streak, 3), 3] },
  { id: "st7", name: "Week Warrior", desc: "Reach a 7-day streak", icon: "🏅", rarity: "rare", category: "streak", test: (s) => s.streak >= 7, prog: (s) => [Math.min(s.streak, 7), 7] },
  { id: "st14", name: "Two-Week Tear", desc: "Reach a 14-day streak", icon: "🗓️", rarity: "rare", category: "streak", test: (s) => s.streak >= 14, prog: (s) => [Math.min(s.streak, 14), 14] },
  { id: "st30", name: "Iron Will", desc: "Reach a 30-day streak", icon: "🛡️", rarity: "legendary", category: "streak", test: (s) => s.streak >= 30, prog: (s) => [Math.min(s.streak, 30), 30] },
  { id: "st60", name: "Two-Month Titan", desc: "Reach a 60-day streak", icon: "💎", rarity: "legendary", category: "streak", test: (s) => s.streak >= 60, prog: (s) => [Math.min(s.streak, 60), 60] },
  { id: "st90", name: "Quarter Master", desc: "Reach a 90-day streak", icon: "🔥", rarity: "legendary", category: "streak", test: (s) => s.streak >= 90, prog: (s) => [Math.min(s.streak, 90), 90] },
  { id: "st100", name: "Century Streak", desc: "Reach a 100-day streak", icon: "💯", rarity: "legendary", category: "streak", test: (s) => s.streak >= 100, prog: (s) => [Math.min(s.streak, 100), 100] },
  { id: "st180", name: "Half Year Hero", desc: "Reach a 180-day streak", icon: "👑", rarity: "legendary", category: "streak", test: (s) => s.streak >= 180, prog: (s) => [Math.min(s.streak, 180), 180] },
  { id: "st365", name: "Year of Focus", desc: "Reach a 365-day streak", icon: "🌟", rarity: "legendary", category: "streak", test: (s) => s.streak >= 365, prog: (s) => [Math.min(s.streak, 365), 365] },

  // HOURS
  { id: "h10", name: "Deep Diver", desc: "Study 10 hours total", icon: "⏱️", rarity: "common", category: "hours", test: (s) => s.totalHours >= 10, prog: (s) => [Math.min(s.totalHours, 10), 10] },
  { id: "h25", name: "Deep Worker", desc: "Study 25 hours total", icon: "🧠", rarity: "common", category: "hours", test: (s) => s.totalHours >= 25, prog: (s) => [Math.min(s.totalHours, 25), 25] },
  { id: "h50", name: "Marathoner", desc: "Study 50 hours total", icon: "🏃", rarity: "rare", category: "hours", test: (s) => s.totalHours >= 50, prog: (s) => [Math.min(s.totalHours, 50), 50] },
  { id: "h100", name: "Centurion", desc: "Study 100 hours total", icon: "👑", rarity: "epic", category: "hours", test: (s) => s.totalHours >= 100, prog: (s) => [Math.min(s.totalHours, 100), 100] },
  { id: "h250", name: "Scholar", desc: "Study 250 hours total", icon: "🎓", rarity: "epic", category: "hours", test: (s) => s.totalHours >= 250, prog: (s) => [Math.min(s.totalHours, 250), 250] },
  { id: "h500", name: "Grandmaster", desc: "Study 500 hours total", icon: "🏛️", rarity: "legendary", category: "hours", test: (s) => s.totalHours >= 500, prog: (s) => [Math.min(s.totalHours, 500), 500] },
  { id: "h1000", name: "Millennium", desc: "Study 1,000 hours total", icon: "🏛️", rarity: "legendary", category: "hours", test: (s) => s.totalHours >= 1000, prog: (s) => [Math.min(s.totalHours, 1000), 1000] },

  // LEVEL & XP
  { id: "lv3", name: "Rising Star", desc: "Reach level 3", icon: "⭐", rarity: "common", category: "level", test: (s) => s.level >= 3, prog: (s) => [Math.min(s.level, 3), 3] },
  { id: "lv5", name: "Superstar", desc: "Reach level 5", icon: "💫", rarity: "rare", category: "level", test: (s) => s.level >= 5, prog: (s) => [Math.min(s.level, 5), 5] },
  { id: "lv8", name: "Legend", desc: "Reach level 8", icon: "🌟", rarity: "legendary", category: "level", test: (s) => s.level >= 8, prog: (s) => [Math.min(s.level, 8), 8] },
  { id: "lv12", name: "Mythic", desc: "Reach level 12", icon: "🔮", rarity: "legendary", category: "level", test: (s) => s.level >= 12, prog: (s) => [Math.min(s.level, 12), 12] },
  { id: "lv15", name: "Transcendent", desc: "Reach level 15", icon: "🚀", rarity: "epic", category: "level", test: (s) => s.level >= 15, prog: (s) => [Math.min(s.level, 15), 15] },
  { id: "lv20", name: "God Mode", desc: "Reach level 20", icon: "⚡", rarity: "legendary", category: "level", test: (s) => s.level >= 20, prog: (s) => [Math.min(s.level, 20), 20] },
  { id: "lv25", name: "Beyond", desc: "Reach level 25", icon: "🌌", rarity: "legendary", category: "level", test: (s) => s.level >= 25, prog: (s) => [Math.min(s.level, 25), 25] },
  { id: "lv30", name: "Infinity", desc: "Reach level 30", icon: "♾️", rarity: "legendary", category: "level", test: (s) => s.level >= 30, prog: (s) => [Math.min(s.level, 30), 30] },
  { id: "xp1k", name: "XP Hunter", desc: "Earn 1,000 XP", icon: "🎯", rarity: "rare", category: "level", test: (s) => s.xp >= 1000, prog: (s) => [Math.min(s.xp, 1000), 1000] },
  { id: "xp5k", name: "XP Legend", desc: "Earn 5,000 XP", icon: "🐉", rarity: "epic", category: "level", test: (s) => s.xp >= 5000, prog: (s) => [Math.min(s.xp, 5000), 5000] },
  { id: "xp10k", name: "XP God", desc: "Earn 10,000 XP", icon: "🐉", rarity: "epic", category: "level", test: (s) => s.xp >= 10000, prog: (s) => [Math.min(s.xp, 10000), 10000] },
  { id: "xp25k", name: "XP Titan", desc: "Earn 25,000 XP", icon: "👑", rarity: "legendary", category: "level", test: (s) => s.xp >= 25000, prog: (s) => [Math.min(s.xp, 25000), 25000] },
  { id: "xp50k", name: "XP Universe", desc: "Earn 50,000 XP", icon: "🌌", rarity: "legendary", category: "level", test: (s) => s.xp >= 50000, prog: (s) => [Math.min(s.xp, 50000), 50000] },

  // DAILY BEST
  { id: "day1h", name: "First Hour", desc: "Study 1+ hour in one day", icon: "⏰", rarity: "common", category: "focus", test: (s) => bestDay(s) >= 60, prog: (s) => [Math.min(bestDay(s), 60), 60] },
  { id: "day4", name: "Deep Work Day", desc: "Study 4+ hours in one day", icon: "🌊", rarity: "rare", category: "focus", test: (s) => bestDay(s) >= 240, prog: (s) => [Math.min(bestDay(s), 240), 240] },
  { id: "day6", name: "Ultra Focus", desc: "Study 6+ hours in one day", icon: "🔥", rarity: "epic", category: "focus", test: (s) => bestDay(s) >= 360, prog: (s) => [Math.min(bestDay(s), 360), 360] },
  { id: "day8", name: "Beast Mode", desc: "Study 8+ hours in one day", icon: "🦍", rarity: "epic", category: "focus", test: (s) => bestDay(s) >= 480, prog: (s) => [Math.min(bestDay(s), 480), 480] },

  // WEEKLY / MONTHLY
  { id: "week20", name: "Power Week", desc: "Study 20+ hours in a week", icon: "💪", rarity: "rare", category: "focus", test: (s) => maxWeekly(s) >= 1200, prog: (s) => [Math.min(maxWeekly(s), 1200), 1200] },
  { id: "week40", name: "Beast Week", desc: "Study 40+ hours in a week", icon: "🦍", rarity: "epic", category: "focus", test: (s) => maxWeekly(s) >= 2400, prog: (s) => [Math.min(maxWeekly(s), 2400), 2400] },
  { id: "month100", name: "Marathon Month", desc: "Study 100+ hours in a month", icon: "🏃‍♂️", rarity: "legendary", category: "focus", test: (s) => maxMonthly(s) >= 6000, prog: (s) => [Math.min(maxMonthly(s), 6000), 6000] },

  // CONSISTENCY
  { id: "con20", name: "Consistent", desc: "Study 20 of last 30 days", icon: "📈", rarity: "rare", category: "consistency", test: (s) => activeLast30(s) >= 20, prog: (s) => [Math.min(activeLast30(s), 20), 20] },
  { id: "con25", name: "Never Miss", desc: "Study 25 of the last 30 days", icon: "📅", rarity: "epic", category: "consistency", test: (s) => activeLast30(s) >= 25, prog: (s) => [Math.min(activeLast30(s), 25), 25] },
  { id: "perfectWeek", name: "Perfect Week", desc: "Study 7 days in a row (last 7)", icon: "📅", rarity: "rare", category: "consistency", test: (s) => perfectWeek(s), prog: (s) => [perfectWeek(s) ? 7 : Math.min(activeLast30(s), 7), 7] },
  { id: "perfectMonth", name: "Perfect Month", desc: "Study 30 of last 30 days", icon: "🗓️", rarity: "legendary", category: "consistency", test: (s) => perfectMonth(s), prog: (s) => [Math.min(activeLast30(s), 30), 30] },
  { id: "weekendWarrior", name: "Weekend Warrior", desc: "Study 6 weekend days in last 30", icon: "🎉", rarity: "rare", category: "consistency", test: (s) => weekendCount(s) >= 6, prog: (s) => [Math.min(weekendCount(s), 6), 6] },

  // TIME OF DAY
  { id: "early", name: "Early Bird", desc: "Log 2+ hours before 8 AM", icon: "🌅", rarity: "common", category: "time", test: (s) => earlyMin(s) >= 120, prog: (s) => [Math.min(earlyMin(s), 120), 120] },
  { id: "morningRitual", name: "Morning Ritual", desc: "Log 10+ hours before 8 AM", icon: "🌅", rarity: "rare", category: "time", test: (s) => earlyMin(s) >= 600, prog: (s) => [Math.min(earlyMin(s), 600), 600] },
  { id: "night", name: "Night Owl", desc: "Log 2+ hours after 10 PM", icon: "🦉", rarity: "common", category: "time", test: (s) => nightMin(s) >= 120, prog: (s) => [Math.min(nightMin(s), 120), 120] },
  { id: "midnightScholar", name: "Midnight Scholar", desc: "Log 10+ hours after 10 PM", icon: "🌙", rarity: "rare", category: "time", test: (s) => nightMin(s) >= 600, prog: (s) => [Math.min(nightMin(s), 600), 600] },
  { id: "balanced", name: "Balanced", desc: "2+ hours morning + 2+ hours night", icon: "⚖️", rarity: "rare", category: "time", test: (s) => earlyMin(s) >= 120 && nightMin(s) >= 120, prog: (s) => [Math.min(earlyMin(s) + nightMin(s), 240), 240] },
  { id: "dawnPatrol", name: "Dawn Patrol", desc: "Study at 5 AM", icon: "🌄", rarity: "common", category: "time", test: (s) => hasDawn(s), prog: (s) => [hasDawn(s) ? 1 : 0, 1] },
  { id: "lunchLearner", name: "Lunch Learner", desc: "Study at noon", icon: "🥪", rarity: "common", category: "time", test: (s) => hasNoon(s), prog: (s) => [hasNoon(s) ? 1 : 0, 1] },

  // SUBJECTS
  { id: "poly", name: "Polymath", desc: "Study 5+ different subjects", icon: "🎨", rarity: "rare", category: "subjects", test: (s) => subjCount(s) >= 5, prog: (s) => [Math.min(subjCount(s), 5), 5] },
  { id: "sub10", name: "Collector", desc: "Study 10+ different subjects", icon: "🖌️", rarity: "rare", category: "subjects", test: (s) => subjCount(s) >= 10, prog: (s) => [Math.min(subjCount(s), 10), 10] },
  { id: "sub20", name: "Subject Master", desc: "Study 20+ different subjects", icon: "🎭", rarity: "epic", category: "subjects", test: (s) => subjCount(s) >= 20, prog: (s) => [Math.min(subjCount(s), 20), 20] },

  // TIMER MASTERY
  { id: "pomo", name: "Pomodoro Master", desc: "Log 1,000 Pomodoro minutes", icon: "🍅", rarity: "rare", category: "timer", test: (s) => pomoMin(s) >= 1000, prog: (s) => [Math.min(pomoMin(s), 1000), 1000] },
  { id: "pomo100", name: "Pomodoro Centurion", desc: "Log 100 Pomodoros (2,500 min)", icon: "🍅", rarity: "epic", category: "timer", test: (s) => pomoMin(s) >= 2500, prog: (s) => [Math.min(pomoMin(s), 2500), 2500] },
  { id: "pomo250", name: "Pomodoro Legend", desc: "Log 250 Pomodoros (6,250 min)", icon: "🍅‍🔥", rarity: "legendary", category: "timer", test: (s) => pomoMin(s) >= 6250, prog: (s) => [Math.min(pomoMin(s), 6250), 6250] },
  { id: "timerTitan", name: "Timer Titan", desc: "Use all 4 timer types", icon: "⏱️", rarity: "rare", category: "timer", test: (s) => timerTypesUsed(s) >= 4, prog: (s) => [Math.min(timerTypesUsed(s), 4), 4] },

  // REVISION
  { id: "rev10", name: "Reviser", desc: "Revise 10 journey topics", icon: "🔁", rarity: "rare", category: "journey", test: (s) => (s.revised || 0) >= 10, prog: (s) => [Math.min(s.revised || 0, 10), 10] },
  { id: "rev25", name: "Revision Machine", desc: "Revise 25 journey topics", icon: "🔄", rarity: "epic", category: "journey", test: (s) => (s.revised || 0) >= 25, prog: (s) => [Math.min(s.revised || 0, 25), 25] },
  { id: "rev50", name: "Revision King", desc: "Revise 50 journey topics", icon: "👑", rarity: "legendary", category: "journey", test: (s) => (s.revised || 0) >= 50, prog: (s) => [Math.min(s.revised || 0, 50), 50] },
  { id: "rev100", name: "Revision God", desc: "Revise 100 journey topics", icon: "♾️", rarity: "legendary", category: "journey", test: (s) => (s.revised || 0) >= 100, prog: (s) => [Math.min(s.revised || 0, 100), 100] },

  // === HARD MODE — SESSIONS ===
  { id: "s2000", name: "Titan", desc: "Log 2,000 sessions", icon: "🦾", rarity: "legendary", category: "sessions", test: (s) => s.totalSessions >= 2000, prog: (s) => [Math.min(s.totalSessions, 2000), 2000] },
  { id: "s5000", name: "Deity", desc: "Log 5,000 sessions", icon: "👁️", rarity: "legendary", category: "sessions", test: (s) => s.totalSessions >= 5000, prog: (s) => [Math.min(s.totalSessions, 5000), 5000] },

  // === HARD MODE — STREAKS ===
  { id: "st500", name: "Immortal Streak", desc: "Reach a 500-day streak", icon: "🔱", rarity: "legendary", category: "streak", test: (s) => s.streak >= 500, prog: (s) => [Math.min(s.streak, 500), 500] },
  { id: "st730", name: "Eternal", desc: "Reach a 730-day streak (2 years)", icon: "♾️", rarity: "legendary", category: "streak", test: (s) => s.streak >= 730, prog: (s) => [Math.min(s.streak, 730), 730] },
  { id: "st1000", name: "Legend Forever", desc: "Reach a 1,000-day streak", icon: "🌌", rarity: "legendary", category: "streak", test: (s) => s.streak >= 1000, prog: (s) => [Math.min(s.streak, 1000), 1000] },

  // === HARD MODE — HOURS ===
  { id: "h2000", name: "Sage", desc: "Study 2,000 hours total", icon: "🧙", rarity: "legendary", category: "hours", test: (s) => s.totalHours >= 2000, prog: (s) => [Math.min(s.totalHours, 2000), 2000] },
  { id: "h5000", name: "Enlightened", desc: "Study 5,000 hours total", icon: "☀️", rarity: "legendary", category: "hours", test: (s) => s.totalHours >= 5000, prog: (s) => [Math.min(s.totalHours, 5000), 5000] },

  // === HARD MODE — LEVEL & XP ===
  { id: "lv50", name: "Demigod", desc: "Reach level 50", icon: "⚡", rarity: "legendary", category: "level", test: (s) => s.level >= 50, prog: (s) => [Math.min(s.level, 50), 50] },
  { id: "lv75", name: "Titan Lord", desc: "Reach level 75", icon: "🌟", rarity: "legendary", category: "level", test: (s) => s.level >= 75, prog: (s) => [Math.min(s.level, 75), 75] },
  { id: "lv100", name: "The One", desc: "Reach level 100", icon: "💎", rarity: "legendary", category: "level", test: (s) => s.level >= 100, prog: (s) => [Math.min(s.level, 100), 100] },
  { id: "xp100k", name: "Universe Conqueror", desc: "Earn 100,000 XP", icon: "🌌", rarity: "legendary", category: "level", test: (s) => s.xp >= 100000, prog: (s) => [Math.min(s.xp, 100000), 100000] },
  { id: "xp250k", name: "Multiverse", desc: "Earn 250,000 XP", icon: "♾️", rarity: "legendary", category: "level", test: (s) => s.xp >= 250000, prog: (s) => [Math.min(s.xp, 250000), 250000] },

  // === HARD MODE — FOCUS ===
  { id: "day12h", name: "Insanity", desc: "Study 12+ hours in one day", icon: "🤯", rarity: "legendary", category: "focus", test: (s) => bestDay(s) >= 720, prog: (s) => [Math.min(bestDay(s), 720), 720] },
  { id: "week60h", name: "War Machine", desc: "Study 60+ hours in a week", icon: "🦾", rarity: "legendary", category: "focus", test: (s) => maxWeekly(s) >= 3600, prog: (s) => [Math.min(maxWeekly(s), 3600), 3600] },
  { id: "week100h", name: "Impossible", desc: "Study 100+ hours in a week", icon: "👹", rarity: "legendary", category: "focus", test: (s) => maxWeekly(s) >= 6000, prog: (s) => [Math.min(maxWeekly(s), 6000), 6000] },
  { id: "month200h", name: "Monster Month", desc: "Study 200+ hours in a month", icon: "🐲", rarity: "legendary", category: "focus", test: (s) => maxMonthly(s) >= 12000, prog: (s) => [Math.min(maxMonthly(s), 12000), 12000] },

  // === HARD MODE — CONSISTENCY ===
  { id: "perfect90", name: "Perfect 90", desc: "Study 90 days (last 140)", icon: "🏆", rarity: "legendary", category: "consistency", test: (s) => perfect90(s), prog: (s) => [Math.min(activeTotal140(s), 90), 90] },
  { id: "perfect140", name: "Perfect 140", desc: "Study 140 days (last 140)", icon: "👑", rarity: "legendary", category: "consistency", test: (s) => perfect140(s), prog: (s) => [Math.min(activeTotal140(s), 140), 140] },
  { id: "weekend20", name: "Weekend Legend", desc: "Study 20 weekend days", icon: "🎊", rarity: "epic", category: "consistency", test: (s) => weekendCount(s) >= 20, prog: (s) => [Math.min(weekendCount(s), 20), 20] },

  // === HARD MODE — TIME ===
  { id: "early50h", name: "Dawn Master", desc: "50+ hours before 8 AM", icon: "🌅", rarity: "epic", category: "time", test: (s) => earlyMin(s) >= 3000, prog: (s) => [Math.min(earlyMin(s), 3000), 3000] },
  { id: "early100h", name: "Sunrise King", desc: "100+ hours before 8 AM", icon: "🌞", rarity: "legendary", category: "time", test: (s) => earlyMin(s) >= 6000, prog: (s) => [Math.min(earlyMin(s), 6000), 6000] },
  { id: "night50h", name: "Nocturnal King", desc: "50+ hours after 10 PM", icon: "🦉", rarity: "epic", category: "time", test: (s) => nightMin(s) >= 3000, prog: (s) => [Math.min(nightMin(s), 3000), 3000] },
  { id: "night100h", name: "Midnight Emperor", desc: "100+ hours after 10 PM", icon: "🌙", rarity: "legendary", category: "time", test: (s) => nightMin(s) >= 6000, prog: (s) => [Math.min(nightMin(s), 6000), 6000] },
  { id: "balanced10", name: "Equilibrium", desc: "10h morning + 10h night", icon: "☯️", rarity: "epic", category: "time", test: (s) => earlyMin(s) >= 600 && nightMin(s) >= 600, prog: (s) => [Math.min(earlyMin(s) + nightMin(s), 1200), 1200] },
  { id: "allHours", name: "Around the Clock", desc: "Study at every hour (0-23)", icon: "🕐", rarity: "legendary", category: "time", test: (s) => allHoursCovered(s) >= 24, prog: (s) => [Math.min(allHoursCovered(s), 24), 24] },

  // === HARD MODE — SUBJECTS & TIMERS & JOURNEY ===
  { id: "sub30", name: "Polymath King", desc: "Study 30+ subjects", icon: "🎨", rarity: "epic", category: "subjects", test: (s) => subjCount(s) >= 30, prog: (s) => [Math.min(subjCount(s), 30), 30] },
  { id: "sub50", name: "Omniscient", desc: "Study 50+ subjects", icon: "🧠", rarity: "legendary", category: "subjects", test: (s) => subjCount(s) >= 50, prog: (s) => [Math.min(subjCount(s), 50), 50] },
  { id: "pomo500", name: "Pomodoro Deity", desc: "500 Pomodoros (12,500 min)", icon: "🍅‍🔥", rarity: "legendary", category: "timer", test: (s) => pomoMin(s) >= 12500, prog: (s) => [Math.min(pomoMin(s), 12500), 12500] },
  { id: "pomo1000", name: "Pomodoro Universe", desc: "1,000 Pomodoros (25,000 min)", icon: "🌌", rarity: "legendary", category: "timer", test: (s) => pomoMin(s) >= 25000, prog: (s) => [Math.min(pomoMin(s), 25000), 25000] },
  { id: "rev200", name: "Revision Emperor", desc: "Revise 200 topics", icon: "👑", rarity: "legendary", category: "journey", test: (s) => (s.revised || 0) >= 200, prog: (s) => [Math.min(s.revised || 0, 200), 200] },
  { id: "rev500", name: "Revision Universe", desc: "Revise 500 topics", icon: "♾️", rarity: "legendary", category: "journey", test: (s) => (s.revised || 0) >= 500, prog: (s) => [Math.min(s.revised || 0, 500), 500] },
];

export const RC: Record<string, string> = { common: "#94a3b8", rare: "#38bdf8", epic: "#c084fc", legendary: "#fbbf24" };
export const CAT_LABEL: Record<string, string> = {
  all: "All", sessions: "Sessions", streak: "Streaks", hours: "Hours", level: "Level & XP", focus: "Deep Focus", consistency: "Consistency", time: "Time of Day", subjects: "Subjects", timer: "Timers", journey: "Journey"
};
