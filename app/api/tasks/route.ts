import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSettings } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  await ensureSettings(db, user.id);

  const [tasks, settings] = await Promise.all([
    db.all("SELECT task_id, completed_at FROM sprint_tasks WHERE user_id = ?", user.id),
    db.get(
      "SELECT sprint_active_day, sprint_mode, daily_target_min FROM settings WHERE user_id = ?",
      user.id
    ) as Promise<any>,
  ]);

  const completedMap: Record<string, string> = {};
  for (const t of tasks as any[]) {
    completedMap[t.task_id] = t.completed_at;
  }

  return NextResponse.json({
    completedTaskIds: Object.keys(completedMap),
    completedAtMap: completedMap,
    activeDay: settings?.sprint_active_day ?? 1,
    mode: settings?.sprint_mode ?? "standard",
    dailyTargetMin: settings?.daily_target_min ?? 120,
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const taskId = String(body.taskId || "").trim();
  const completed = Boolean(body.completed);

  if (!taskId || taskId.length > 50) {
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
  }

  const db = await getDb();
  if (completed) {
    const now = new Date().toISOString();
    await db.run(
      "INSERT OR REPLACE INTO sprint_tasks (user_id, task_id, completed_at) VALUES (?, ?, ?)",
      user.id,
      taskId,
      now
    );
  } else {
    await db.run("DELETE FROM sprint_tasks WHERE user_id = ? AND task_id = ?", user.id, taskId);
  }

  return NextResponse.json({ ok: true, taskId, completed });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const db = await getDb();
  await ensureSettings(db, user.id);

  const updates: string[] = [];
  const args: any[] = [];

  if (body.activeDay !== undefined) {
    const d = Math.max(1, Math.min(42, parseInt(body.activeDay, 10) || 1));
    updates.push("sprint_active_day = ?");
    args.push(d);
  }

  if (body.mode !== undefined) {
    const m = ["standard", "bed", "mock"].includes(body.mode) ? body.mode : "standard";
    updates.push("sprint_mode = ?");
    args.push(m);
  }

  if (body.dailyTargetMin !== undefined) {
    const t = Math.max(15, Math.min(720, parseInt(body.dailyTargetMin, 10) || 120));
    updates.push("daily_target_min = ?");
    args.push(t);
  }

  if (updates.length > 0) {
    args.push(user.id);
    await db.run(`UPDATE settings SET ${updates.join(", ")} WHERE user_id = ?`, ...args);
  }

  return NextResponse.json({ ok: true });
}
