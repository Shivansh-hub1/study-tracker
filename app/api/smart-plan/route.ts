import { NextRequest, NextResponse } from "next/server";
import { getDb, featureOn } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { cacheGet, cacheSet, bustUser } from "@/lib/api-cache";
import { parseOffset } from "@/lib/utils";
import { DSA_TOPICS } from "@/lib/dsa";
import { WEBDEV_TOPICS } from "@/lib/webdev";

export const dynamic = "force-dynamic";

const DAY = 86400000;

function pad(n: number) { return String(n).padStart(2, "0"); }
function dateKey(d: Date) { return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; }

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const offsetMin = parseOffset(new URL(req.url).searchParams.get("offset"));
  const __ck = `u${user.id}:smartplan:${offsetMin}`;
  const __hit = cacheGet(__ck);
  if (__hit) return NextResponse.json(__hit);

  const db = await getDb();

  // Admin toggle (default ON)
  const meta = (await db.get("SELECT value FROM _meta WHERE key = 'smart_plan'")) as any;
  if (meta && meta.value === "0") {
    const out = { enabled: false, plan: [] };
    cacheSet(__ck, out);
    return NextResponse.json(out);
  }

  const nowLocal = new Date(Date.now() + offsetMin * 60000);
  const nowMs = Date.now();
  const startTodayLocal = new Date(nowLocal);
  startTodayLocal.setUTCHours(0, 0, 0, 0);
  const startTodayUtc = new Date(startTodayLocal.getTime() - offsetMin * 60000).toISOString();

  const plan: Array<{ icon: string; title: string; sub: string; href: string }> = [];

  // 1) Revision queue (DSA + WebDev): done 3+ days ago AND (never revised or revised 7+ days ago)
  const [dsaRows, webRows] = await Promise.all([
    db.all("SELECT topic_key, status, updated_at, revised_at FROM dsa_progress WHERE user_id = ?", user.id),
    db.all("SELECT topic_key, status, updated_at, revised_at FROM web_progress WHERE user_id = ?", user.id),
  ]);
  const dueOf = (rows: any[], topics: any[], label: string) => {
    const map = new Map<string, any>();
    for (const r of rows as any[]) map.set(r.topic_key, r);
    const due: string[] = [];
    for (const t of topics) {
      const r = map.get(t.key);
      if (!r || r.status !== "done") continue;
      const doneAt = r.updated_at ? new Date(r.updated_at).getTime() : nowMs;
      const revAt = r.revised_at ? new Date(r.revised_at).getTime() : 0;
      const daysAgo = Math.floor((nowMs - doneAt) / DAY);
      const revDays = revAt ? Math.floor((nowMs - revAt) / DAY) : -1;
      if (daysAgo >= 3 && (revDays === -1 || revDays >= 7)) due.push(t.title);
    }
    if (due.length) {
      plan.push({
        icon: "repeat",
        title: `Revise ${due.length} due ${label} topic${due.length > 1 ? "s" : ""}`,
        sub: due.slice(0, 2).join(" · ") + (due.length > 2 ? ` +${due.length - 2} more` : ""),
        href: "/revision",
      });
    }
  };
  dueOf(dsaRows, DSA_TOPICS, "DSA");
  dueOf(webRows, WEBDEV_TOPICS, "WebDev");


  // 3) Weakest subject nudge (least minutes in the last 7 days among subjects with a target)
  const weekAgo = new Date(nowLocal.getTime() - 7 * DAY).toISOString();
  const subjRows = (await db.all(
    `SELECT s.id, s.name, s.target_minutes, COALESCE(SUM(CASE WHEN se.started_at >= ? THEN se.duration_sec ELSE 0 END), 0) as week_sec
     FROM subjects s LEFT JOIN sessions se ON se.subject_id = s.id
     WHERE s.user_id = ? GROUP BY s.id`,
    weekAgo, user.id
  )) as any[];
  if (subjRows.length) {
    const withTarget = subjRows.filter((s: any) => Number(s.target_minutes) > 0);
    const pool = withTarget.length ? withTarget : subjRows;
    const weakest = pool.sort((a: any, b: any) => Number(a.week_sec) - Number(b.week_sec))[0];
    const weekMin = Math.round(Number(weakest.week_sec) / 60);
    const target = Math.round(Number(weakest.target_minutes));
    plan.push({
      icon: "target",
      title: `Focus 25 min on ${weakest.name}`,
      sub: weekMin === 0 ? "No time this week — get it started" : `${weekMin}/${target}min this week — behind target`,
      href: "/timer",
    });
  }

  // 4) Daily goal nudge
  const todaySec = (await db.get(
    "SELECT COALESCE(SUM(duration_sec),0) as c FROM sessions WHERE user_id = ? AND started_at >= ?",
    user.id, startTodayUtc
  )) as any;
  const todayMin = Math.round(Number(todaySec?.c || 0) / 60);
  plan.push({
    icon: todayMin >= 120 ? "check" : "timer",
    title: todayMin >= 120 ? "Daily goal already hit — legendary" : `${Math.max(0, 120 - todayMin)} min left to hit today's 2h goal`,
    sub: `${todayMin} min studied today`,
    href: "/timer",
  });

  const out = { enabled: true, plan };
  cacheSet(__ck, out);
  return NextResponse.json(out);
}

export async function POST() {
  // mutations elsewhere bust this cache; POST kept for future edits
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  bustUser(user.id);
  return NextResponse.json({ ok: true });
}
