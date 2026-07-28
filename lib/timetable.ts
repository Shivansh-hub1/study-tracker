// Shared timetable generator — used by API (server) and preview (client)

export type TTSubject = { id: number; name: string; color: string; weeklyMinutes: number };

export type Slot = {
  day: number; // 1=Mon ... 7=Sun
  start: string; // "HH:MM"
  end: string;
  type: "study" | "break";
  subjectId?: number;
  minutes: number;
};

export type TTConfig = {
  days: number[]; // selected days 1..7 (1=Mon)
  startHour: number;
  endHour: number;
  sessionMin: number; // focused block length
  breakMin: number; // short break
  longBreakMin: number; // longer break every 3rd block
  subjects: TTSubject[];
  intensity: "light" | "balanced" | "intense";
};

export function toHM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseHM(hm: string) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

export const DAY_NAMES = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Block = { subjectId: number; minutes: number };

export function generateTimetable(cfg: TTConfig): { slots: Slot[]; warnings: string[] } {
  const warnings: string[] = [];
  const days = [...new Set(cfg.days)].sort((a, b) => a - b);
  if (days.length === 0) return { slots: [], warnings: ["Select at least one study day."] };
  const subjects = cfg.subjects.filter((s) => s.weeklyMinutes > 0);
  if (subjects.length === 0) return { slots: [], warnings: ["Add at least one subject with weekly time."] };

  const windowMin = (cfg.endHour - cfg.startHour) * 60;
  if (windowMin < cfg.sessionMin) return { slots: [], warnings: ["The daily window is too short for even one session."] };

  const factor = cfg.intensity === "light" ? 0.5 : cfg.intensity === "balanced" ? 0.68 : 0.82;
  const dayCapacity = Math.max(cfg.sessionMin, Math.floor(windowMin * factor));
  const totalCapacity = dayCapacity * days.length;
  const totalRequested = subjects.reduce((a, s) => a + s.weeklyMinutes, 0);
  const scale = Math.min(1, totalCapacity / totalRequested);
  if (scale < 1) {
    warnings.push(
      `You asked for ${fmtH(totalRequested)}/week but ~${fmtH(totalCapacity)} fits in this schedule — sessions were trimmed proportionally.`
    );
  }

  // Split each subject's weekly minutes into session-sized blocks
  const queues = subjects.map((s) => {
    let left = Math.round(s.weeklyMinutes * scale);
    const q: Block[] = [];
    while (left >= 20) {
      const m = Math.min(cfg.sessionMin, left);
      q.push({ subjectId: s.id, minutes: m });
      left -= m;
    }
    return { id: s.id, q, totalLeft: () => q.reduce((a, b) => a + b.minutes, 0) };
  });

  // Distribute blocks across days (round-robin over days, biggest backlog first, avoid repeating a subject on a day)
  const dayBlocks: Record<number, Block[]> = {};
  const dayMinutes: Record<number, number> = {};
  days.forEach((d) => {
    dayBlocks[d] = [];
    dayMinutes[d] = 0;
  });

  let guard = 0;
  while (guard++ < 2000) {
    const open = queues.filter((x) => x.q.length > 0);
    if (open.length === 0) break;
    // day with most capacity left
    const freeDays = days.filter((d) => dayMinutes[d] + 20 <= dayCapacity);
    if (freeDays.length === 0) break;
    freeDays.sort((a, b) => dayMinutes[a] - dayMinutes[b]);
    const day = freeDays[0];
    // subject with most minutes left, not already on this day (if possible)
    open.sort((a, b) => b.totalLeft() - a.totalLeft());
    let pick = open.find((o) => !dayBlocks[day].some((b) => b.subjectId === o.id)) || open[0];
    const block = pick.q.shift()!;
    const fitsIn = dayCapacity - dayMinutes[day];
    const m = Math.min(block.minutes, Math.max(20, Math.min(cfg.sessionMin, fitsIn)));
    dayBlocks[day].push({ subjectId: pick.id, minutes: m });
    dayMinutes[day] += m + cfg.breakMin;
    if (block.minutes - m >= 20) pick.q.unshift({ subjectId: pick.id, minutes: block.minutes - m });
  }

  const leftover = queues.reduce((a, x) => a + x.q.reduce((p, b) => p + b.minutes, 0), 0);
  if (leftover >= 20) warnings.push(`${fmtH(leftover)} couldn't be placed — add more days or widen your daily window.`);

  // Lay out each day chronologically with breaks
  const slots: Slot[] = [];
  days.forEach((day, i) => {
    const blocks = dayBlocks[day];
    // rotate order per day so the same subject doesn't always come first
    const k = blocks.length ? i % blocks.length : 0;
    const ordered = blocks.slice(k).concat(blocks.slice(0, k));
    let t = cfg.startHour * 60;
    let count = 0;
    for (const b of ordered) {
      if (t + b.minutes > cfg.endHour * 60 + 30) break;
      slots.push({ day, start: toHM(t), end: toHM(t + b.minutes), type: "study", subjectId: b.subjectId, minutes: b.minutes });
      t += b.minutes;
      count++;
      const isLong = count % 3 === 0;
      const breakLen = isLong ? cfg.longBreakMin : cfg.breakMin;
      if (t + breakLen <= cfg.endHour * 60 && ordered.indexOf(b) < ordered.length - 1) {
        slots.push({ day, start: toHM(t), end: toHM(t + breakLen), type: "break", minutes: breakLen });
        t += breakLen;
      }
    }
  });

  return { slots, warnings };
}

function fmtH(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
