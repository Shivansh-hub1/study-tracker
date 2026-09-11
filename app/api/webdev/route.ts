import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureWebTopics, DB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { WEBDEV_TOPICS, WEBDEV_KEY_SET, WebdevStatus } from "@/lib/webdev";
import { WEBDEV_LECTURES } from "@/lib/webdev-lectures";

export const dynamic = "force-dynamic";

async function payload(userId: number) {
  const db = await getDb();
  await ensureWebTopics(db, userId);
  const rows = await db.all<{ topic_key: string; status: string; lecture_idx: number; updated_at: string; revised_at: string | null }>(
    "SELECT topic_key, status, lecture_idx, updated_at, revised_at FROM web_progress WHERE user_id = ?",
    userId
  );
  const rowMap = new Map(rows.map((r) => [r.topic_key, r]));
  // Time logged per topic (sessions store the topic TITLE)
  const times = await db.all<{ topic: string; sec: number }>(
    "SELECT topic, COALESCE(SUM(duration_sec), 0) as sec FROM sessions WHERE user_id = ? AND topic != '' GROUP BY topic",
    userId
  );
  const timeMap = new Map(times.map((t) => [t.topic, Number(t.sec) || 0]));
  const topics = WEBDEV_TOPICS.map((t) => {
    const lectures = WEBDEV_LECTURES[t.key] || [];
    const status = (rowMap.get(t.key)?.status || "todo") as WebdevStatus;
    return {
      ...t,
      status,
      lectures,
      lecture_idx: status === "done" ? lectures.length : (rowMap.get(t.key)?.lecture_idx || 0),
      seconds: timeMap.get(t.title) || 0,
    };
  });
  const current =
    topics.find((t) => t.status === "doing")?.key ||
    topics.find((t) => t.status === "todo")?.key ||
    null;
  const done = topics.filter((t) => t.status === "done").length;
  const total_sec = topics.reduce((a, t) => a + t.seconds, 0);
  // Revision: due = done 3+ days ago AND (never revised OR revised 7+ days ago)
  const nowMs = Date.now();
  const DAY = 86400000;
  const revInfo = topics
    .filter((t) => t.status === "done")
    .map((t) => {
      const r = rowMap.get(t.key);
      const doneAt = r?.updated_at ? new Date(r.updated_at).getTime() : nowMs;
      const revAt = r?.revised_at ? new Date(r.revised_at).getTime() : 0;
      return {
        key: t.key,
        title: t.title,
        days_ago: Math.floor((nowMs - doneAt) / DAY),
        rev_days: revAt ? Math.floor((nowMs - revAt) / DAY) : -1,
      };
    });
  const revision_due = revInfo
    .filter((x) => x.days_ago >= 3 && (x.rev_days === -1 || x.rev_days >= 7))
    .sort((a, b) => b.days_ago - a.days_ago);
  const revision_upcoming = revInfo
    .filter((x) => !(x.days_ago >= 3 && (x.rev_days === -1 || x.rev_days >= 7)))
    .map((x) => ({ key: x.key, title: x.title, days_left: x.rev_days === -1 ? Math.max(1, 3 - x.days_ago) : Math.max(1, 7 - x.rev_days) }))
    .sort((a, b) => a.days_left - b.days_left);
  return { topics, current, done, total: topics.length, total_sec, revision_due, revision_upcoming };
}

/** First remaining todo becomes the new current (only if none exists). */
async function autoAdvance(db: DB, userId: number, now: string) {
  const rows = await db.all<{ topic_key: string; status: string }>(
    "SELECT topic_key, status FROM web_progress WHERE user_id = ?",
    userId
  );
  if (rows.some((r) => r.status === "doing")) return;
  const st = new Map(rows.map((r) => [r.topic_key, r.status]));
  const next = WEBDEV_TOPICS.map((t) => t.key).find((k) => st.get(k) === "todo");
  if (next) {
    await db.run(
      "UPDATE web_progress SET status = 'doing', updated_at = ? WHERE user_id = ? AND topic_key = ?",
      now, userId, next
    );
  }
}

async function demoteOthers(db: DB, userId: number, now: string) {
  await db.run(
    "UPDATE web_progress SET status = 'todo', updated_at = ? WHERE user_id = ? AND status = 'doing'",
    now, userId
  );
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await payload(user.id));
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { key, status, lecture_idx } = body as { key: string; status?: WebdevStatus; lecture_idx?: number };
  if (!key || !WEBDEV_KEY_SET.has(key)) {
    return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
  }
  const db = await getDb();
  await ensureWebTopics(db, user.id);
  const now = new Date().toISOString();
  const len = (WEBDEV_LECTURES[key] || []).length;

  if (status !== undefined) {
    if (!["todo", "doing", "done"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (status === "doing") await demoteOthers(db, user.id, now);
    await db.run(
      "UPDATE web_progress SET status = ?, updated_at = ? WHERE user_id = ? AND topic_key = ?",
      status, now, user.id, key
    );
    if (status === "done") await autoAdvance(db, user.id, now);
  }

  if (lecture_idx !== undefined) {
    const idx = Math.max(0, Math.min(len, Math.round(Number(lecture_idx) || 0)));
    await db.run(
      "UPDATE web_progress SET lecture_idx = ?, updated_at = ? WHERE user_id = ? AND topic_key = ?",
      idx, now, user.id, key
    );
    if (idx >= len && len > 0) {
      // Finished last lecture → module done, journey advances
      await db.run(
        "UPDATE web_progress SET status = 'done', updated_at = ? WHERE user_id = ? AND topic_key = ?",
        now, user.id, key
      );
      await autoAdvance(db, user.id, now);
    } else if (idx < len) {
      // (Re)opened mid-module → it becomes current
      await demoteOthers(db, user.id, now);
      await db.run(
        "UPDATE web_progress SET status = 'doing', updated_at = ? WHERE user_id = ? AND topic_key = ?",
        now, user.id, key
      );
    }
  }

  return NextResponse.json(await payload(user.id));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body.action === "complete_above") {
    const key = body.key as string;
    if (!key || !WEBDEV_KEY_SET.has(key)) {
      return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
    }
    const db = await getDb();
    await ensureWebTopics(db, user.id);
    const now = new Date().toISOString();
    const idx = WEBDEV_TOPICS.findIndex((t) => t.key === key);
    const above = WEBDEV_TOPICS.slice(0, Math.max(0, idx)).map((t) => t.key);
    if (above.length > 0) {
      const ph = above.map(() => "?").join(",");
      await db.run(
        `UPDATE web_progress SET status = 'done', updated_at = ? WHERE user_id = ? AND topic_key IN (${ph})`,
        now, user.id, ...above
      );
    }
    return NextResponse.json(await payload(user.id));
  }
  if (body.action === "revise") {
    const key = body.key as string;
    if (!key || !WEBDEV_KEY_SET.has(key)) {
      return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
    }
    const db = await getDb();
    await ensureWebTopics(db, user.id);
    await db.run("UPDATE web_progress SET revised_at = ? WHERE user_id = ? AND topic_key = ?", new Date().toISOString(), user.id, key);
    return NextResponse.json(await payload(user.id));
  }
  if (body.action !== "reset") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  const db = await getDb();
  await ensureWebTopics(db, user.id);
  const now = new Date().toISOString();
  await db.run(
    "UPDATE web_progress SET status = 'todo', lecture_idx = 0, updated_at = ? WHERE user_id = ?",
    now, user.id
  );
  await db.run(
    "UPDATE web_progress SET status = 'doing', updated_at = ? WHERE user_id = ? AND topic_key = ?",
    now, user.id, WEBDEV_TOPICS[0].key
  );
  return NextResponse.json(await payload(user.id));
}
