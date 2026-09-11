import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { DSA_TOPICS } from "./dsa";

/*
 * Unified async data layer.
 * - Local dev (default): better-sqlite3 file at data/study.db
 * - Production (Vercel): Turso via @libsql/client when TURSO_DATABASE_URL is set
 * Same SQL, same interface (run/get/all) for both.
 */

export interface RunResult {
  lastInsertRowid: number;
  changes: number;
}
export interface DB {
  run(sql: string, ...args: any[]): Promise<RunResult>;
  get<T = any>(sql: string, ...args: any[]): Promise<T | undefined>;
  all<T = any>(sql: string, ...args: any[]): Promise<T[]>;
}

export const OWNER_EMAIL = "owner@focusflow.app";
export const OWNER_PASSWORD = "owner1234";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    last_active_at TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6366f1',
    target_minutes INTEGER NOT NULL DEFAULT 300,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject_id INTEGER,
    type TEXT NOT NULL DEFAULT 'manual',
    started_at TEXT NOT NULL,
    ended_at TEXT NOT NULL,
    duration_sec INTEGER NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    kind TEXT NOT NULL,
    target INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS timetables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    config TEXT NOT NULL DEFAULT '{}',
    slots TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER PRIMARY KEY,
    pomo_work INTEGER NOT NULL DEFAULT 25,
    pomo_short INTEGER NOT NULL DEFAULT 5,
    pomo_long INTEGER NOT NULL DEFAULT 15,
    pomo_rounds INTEGER NOT NULL DEFAULT 4,
    auto_next INTEGER NOT NULL DEFAULT 1,
    week_start INTEGER NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS dsa_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic_key TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo',
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, topic_key)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, started_at)`,
  `CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_dsa_user ON dsa_progress(user_id)`,
];

type Stmt = { sql: string; args: any[] };

let ready: Promise<DB> | null = null;

export function getDb(): Promise<DB> {
  if (!ready) ready = init();
  return ready;
}

async function init(): Promise<DB> {
  const db = process.env.TURSO_DATABASE_URL ? await initTurso() : await initLocal();
  // Forgiving migrations for databases created before roles existed
  for (const sql of [
    "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'",
    "ALTER TABLE users ADD COLUMN last_active_at TEXT",
    "ALTER TABLE sessions ADD COLUMN topic TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE dsa_progress ADD COLUMN lecture_idx INTEGER NOT NULL DEFAULT 0",
  ]) {
    try { await db.run(sql); } catch { /* column already exists */ }
  }
  await ensureOwner(db);
  return db;
}

function wrapTurso(client: any): DB {
  const toObj = (rs: any, r: any) => {
    const o: any = {};
    for (const c of rs.columns ?? Object.keys(r)) o[c] = r[c];
    return o;
  };
  return {
    async run(sql, ...args) {
      const rs = await client.execute({ sql, args });
      return { lastInsertRowid: Number(rs.lastInsertRowid ?? 0), changes: rs.rowsAffected };
    },
    async get(sql, ...args) {
      const rs = await client.execute({ sql, args });
      return rs.rows.length === 0 ? undefined : toObj(rs, rs.rows[0]);
    },
    async all(sql, ...args) {
      const rs = await client.execute({ sql, args });
      return rs.rows.map((r: any) => toObj(rs, r));
    },
  };
}

async function initTurso(): Promise<DB> {
  const { createClient } = await import("@libsql/client");
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  await client.batch(SCHEMA.map((sql) => ({ sql, args: [] })), "write");
  const db = wrapTurso(client);
  await seedIfEmpty(db, async (stmts) => {
    for (let i = 0; i < stmts.length; i += 120) {
      await client.batch(stmts.slice(i, i + 120) as any, "write");
    }
  });
  return db;
}

async function initLocal(): Promise<DB> {
  const Database = (await import("better-sqlite3")).default;
  const DATA_DIR = path.join(process.cwd(), "data");
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const raw = new Database(path.join(DATA_DIR, "study.db"));
  raw.pragma("journal_mode = WAL");
  for (const s of SCHEMA) raw.exec(s);
  const db: DB = {
    async run(sql, ...args) {
      const info = raw.prepare(sql).run(...args);
      return { lastInsertRowid: Number(info.lastInsertRowid), changes: info.changes };
    },
    async get(sql, ...args) {
      return raw.prepare(sql).get(...args) as any;
    },
    async all(sql, ...args) {
      return raw.prepare(sql).all(...args) as any;
    },
  };
  await seedIfEmpty(db, async (stmts) => {
    raw.transaction(() => {
      for (const s of stmts) raw.prepare(s.sql).run(...s.args);
    })();
  });
  return db;
}

export async function ensureSettings(db: DB, userId: number) {
  await db.run(`INSERT OR IGNORE INTO settings (user_id) VALUES (?)`, userId);
}

/** Seed the DSA journey (first topic starts as current). Idempotent.
 * Fast path: 1 COUNT query when already seeded (was: 47 sequential INSERTs). */
export async function ensureDsaTopics(db: DB, userId: number) {
  const row = await db.get<{ c: number }>(
    "SELECT COUNT(*) as c FROM dsa_progress WHERE user_id = ?",
    userId
  );
  if ((row?.c ?? 0) >= DSA_TOPICS.length) return;
  // Single multi-row INSERT: 1 round trip instead of 47
  const now = new Date().toISOString();
  const values = DSA_TOPICS.map(() => "(?,?,?,?)").join(",");
  const args: any[] = [];
  for (const t of DSA_TOPICS) {
    args.push(userId, t.key, t.key === DSA_TOPICS[0].key ? "doing" : "todo", now);
  }
  await db.run(
    `INSERT OR IGNORE INTO dsa_progress (user_id, topic_key, status, updated_at) VALUES ${values}`,
    ...args
  );
}

/** Guarantee an owner/admin account always exists. */
async function ensureOwner(db: DB) {
  const existing = await db.get("SELECT id FROM users WHERE email = ? OR role = 'admin' LIMIT 1", OWNER_EMAIL);
  if (existing) return;
  const info = await db.run(
    "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?,?,?,?,?)",
    "Owner",
    OWNER_EMAIL,
    bcrypt.hashSync(OWNER_PASSWORD, 10),
    "admin",
    new Date().toISOString()
  );
  await ensureSettings(db, info.lastInsertRowid);
  console.log(`[db] Owner account created: ${OWNER_EMAIL}`);
}

/** Delete a user and ALL their data (admin cascade). */
export async function deleteUserCascade(db: DB, userId: number) {
  for (const t of ["sessions", "subjects", "goals", "timetables", "settings", "dsa_progress"]) {
    await db.run(`DELETE FROM ${t} WHERE user_id = ?`, userId);
  }
  await db.run("DELETE FROM users WHERE id = ?", userId);
}

/* ------------------------------ DEMO SEED ------------------------------ */

const DEMO_SUBJECTS: Array<{ name: string; color: string; target: number }> = [
  { name: "Mathematics", color: "#6366f1", target: 420 },
  { name: "Physics", color: "#0ea5e9", target: 360 },
  { name: "Chemistry", color: "#10b981", target: 300 },
  { name: "Biology", color: "#f59e0b", target: 240 },
  { name: "Computer Science", color: "#ec4899", target: 480 },
  { name: "English", color: "#8b5cf6", target: 180 },
];

const FAKE_USERS = [
  { name: "Priya Patel", email: "priya@example.com", subjects: [["Biology", "#10b981"], ["Chemistry", "#f59e0b"]] },
  { name: "Rahul Verma", email: "rahul@example.com", subjects: [["Mathematics", "#6366f1"], ["Physics", "#0ea5e9"], ["Computer Science", "#ec4899"]] },
  { name: "Sneha Iyer", email: "sneha@example.com", subjects: [["English", "#8b5cf6"], ["History", "#ef4444"]] },
] as const;

const NOTES = [
  "Chapter revision + practice problems",
  "Watched lecture, took notes",
  "Solved previous year questions",
  "Flashcard review",
  "Deep work — problem set",
  "Group study / discussion",
  "Mock test section",
  "Summary notes + recall",
  "",
  "",
];

function mulberry(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toHM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function sessionStmts(
  stmts: Stmt[], rand: () => number, now: Date, userId: number, subjectIds: number[],
  opts: { days: number; chanceDay: (dow: number) => number; maxPerDay: number; todaySessions?: number }
) {
  for (let d = opts.days; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(now.getDate() - d);
    const dow = day.getDay();
    let chance = opts.chanceDay(dow);
    if (d === 23 || d === 41) chance = 0;
    if (d <= 6) chance = 1;
    if (rand() > chance) continue;

    const nSessions = d === 0 ? (opts.todaySessions ?? 2) : 1 + Math.floor(rand() * opts.maxPerDay);
    for (let i = 0; i < nSessions; i++) {
      const si = Math.floor(rand() * subjectIds.length);
      const durMin = [25, 25, 30, 45, 50, 60, 90][Math.floor(rand() * 7)];
      const startHour = d === 0
        ? Math.max(6, new Date(now.getTime() - (i + 1) * 3.2 * 3600000).getHours())
        : 7 + Math.floor(rand() * 13);
      const start = new Date(day);
      start.setHours(startHour, Math.floor(rand() * 60), 0, 0);
      if (start > now) continue;
      const end = new Date(start.getTime() + durMin * 60000);
      if (end > now) end.setTime(now.getTime());
      const type = rand() < 0.5 ? "pomodoro" : rand() < 0.7 ? "timer" : rand() < 0.9 ? "stopwatch" : "manual";
      stmts.push({
        sql: "INSERT INTO sessions (user_id, subject_id, type, started_at, ended_at, duration_sec, notes, created_at) VALUES (?,?,?,?,?,?,?,?)",
        args: [userId, subjectIds[si], type, start.toISOString(), end.toISOString(),
          Math.round((end.getTime() - start.getTime()) / 1000), NOTES[Math.floor(rand() * NOTES.length)], end.toISOString()],
      });
    }
  }
}

async function seedIfEmpty(db: DB, exec: (stmts: Stmt[]) => Promise<void>) {
  const count = await db.get<{ c: number }>("SELECT COUNT(*) as c FROM users");
  if ((count?.c ?? 0) > 0) return;

  const rand = mulberry(42);
  const now = new Date();
  const stmts: Stmt[] = [];
  const maxU = (await db.get<{ m: number }>("SELECT COALESCE(MAX(id),0) as m FROM users"))?.m ?? 0;
  const maxS = (await db.get<{ m: number }>("SELECT COALESCE(MAX(id),0) as m FROM subjects"))?.m ?? 0;
  const demoId = maxU + 1;

  // Rich demo user
  stmts.push({
    sql: "INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?,?,?,?,?,?)",
    args: [demoId, "Alex Sharma", "demo@study.app", bcrypt.hashSync("demo1234", 10), "user", now.toISOString()],
  });
  stmts.push({ sql: `INSERT OR IGNORE INTO settings (user_id) VALUES (?)`, args: [demoId] });

  const subjectIds: number[] = [];
  DEMO_SUBJECTS.forEach((s, i) => {
    subjectIds.push(maxS + i + 1);
    stmts.push({
      sql: "INSERT INTO subjects (id, user_id, name, color, target_minutes, created_at) VALUES (?,?,?,?,?,?)",
      args: [maxS + i + 1, demoId, s.name, s.color, s.target, now.toISOString()],
    });
  });

  sessionStmts(stmts, rand, now, demoId, subjectIds, {
    days: 75,
    chanceDay: (dow) => (dow === 0 || dow === 6 ? 0.62 : 0.9),
    maxPerDay: 4,
    todaySessions: 2,
  });

  for (const g of [
    ["Study 4 hours every day", "daily_minutes", 240],
    ["30 hours this week", "weekly_minutes", 1800],
    ["100 focused sessions this week", "weekly_sessions", 100],
    ["120 hours this month", "monthly_minutes", 7200],
  ]) {
    stmts.push({ sql: "INSERT INTO goals (user_id, title, kind, target, created_at) VALUES (?,?,?,?,?)", args: [demoId, g[0], g[1], g[2], now.toISOString()] });
  }

  // Demo timetable
  const cfg = { days: [1, 2, 3, 4, 5, 6], startHour: 8, endHour: 20, sessionMin: 50, breakMin: 10 };
  const slots: any[] = [];
  const perDay: Record<number, number[]> = { 1: [0, 4, 1], 2: [2, 0, 3], 3: [4, 1, 2], 4: [0, 3, 4], 5: [1, 2, 0], 6: [4, 3] };
  for (const day of cfg.days) {
    const idxs = perDay[day] || [0, 1, 2];
    let t = cfg.startHour * 60;
    for (const si of idxs) {
      slots.push({ day, start: toHM(t), end: toHM(t + cfg.sessionMin), type: "study", subjectId: subjectIds[si] });
      t += cfg.sessionMin + cfg.breakMin;
    }
  }
  stmts.push({
    sql: "INSERT INTO timetables (user_id, name, config, slots, created_at) VALUES (?,?,?,?,?)",
    args: [demoId, "Exam week plan", JSON.stringify(cfg), JSON.stringify(slots), now.toISOString()],
  });

  // A few extra users so the admin panel feels alive
  FAKE_USERS.forEach((fu, idx) => {
    const uid = demoId + idx + 1;
    stmts.push({
      sql: "INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?,?,?,?,?,?)",
      args: [uid, fu.name, fu.email, bcrypt.hashSync("demo1234", 10), "user",
        new Date(now.getTime() - (idx + 2) * 7 * 86400000).toISOString()],
    });
    stmts.push({ sql: `INSERT OR IGNORE INTO settings (user_id) VALUES (?)`, args: [uid] });
    const sids: number[] = [];
    fu.subjects.forEach(([sname, scolor], j) => {
      const sid = maxS + DEMO_SUBJECTS.length + idx * 3 + j + 1;
      sids.push(sid);
      stmts.push({
        sql: "INSERT INTO subjects (id, user_id, name, color, target_minutes, created_at) VALUES (?,?,?,?,?,?)",
        args: [sid, uid, sname, scolor, 240, now.toISOString()],
      });
    });
    sessionStmts(stmts, rand, now, uid, sids, {
      days: 30 - idx * 7,
      chanceDay: (dow) => (dow === 0 || dow === 6 ? 0.35 : 0.65),
      maxPerDay: 2,
      todaySessions: idx === 0 ? 1 : 0,
    });
  });

  await exec(stmts);
  console.log("[db] Seeded demo + sample users");
}
