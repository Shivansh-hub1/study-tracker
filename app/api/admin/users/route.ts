import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Admins only" }, { status: 403 });
  const db = await getDb();
  const users = await db.all(
    `SELECT u.id, u.name, u.email, u.role, u.created_at, u.last_active_at,
       (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id) as session_count,
       (SELECT COALESCE(SUM(s.duration_sec),0) FROM sessions s WHERE s.user_id = u.id) as total_sec,
       (SELECT COUNT(*) FROM subjects sub WHERE sub.user_id = u.id) as subject_count
     FROM users u ORDER BY u.created_at DESC`
  );
  return NextResponse.json({ users });
}
