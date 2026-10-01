import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Account self-service: name, profile picture, password change.
// Email is intentionally NOT editable. Password change requires the current password.
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const db = await getDb();
  const updates: string[] = [];
  const vals: any[] = [];

  // Display name
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 1 || name.length > 60) {
      return NextResponse.json({ error: "Name must be 1–60 characters" }, { status: 400 });
    }
    updates.push("name = ?");
    vals.push(name);
  }

  // Profile picture — data URI, already resized client-side to a small square
  if (body.pfp !== undefined) {
    if (body.pfp === null || body.pfp === "") {
      updates.push("pfp = NULL");
    } else {
      const pfp = String(body.pfp);
      if (!pfp.startsWith("data:image/") || pfp.length > 400000) {
        return NextResponse.json({ error: "Invalid or too-large picture" }, { status: 400 });
      }
      updates.push("pfp = ?");
      vals.push(pfp);
    }
  }

  // Password change — old password is always required
  if (body.newPassword) {
    const row = (await db.get("SELECT password_hash FROM users WHERE id = ?", user.id)) as any;
    if (!body.oldPassword || !bcrypt.compareSync(String(body.oldPassword), row?.password_hash || "")) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }
    if (String(body.newPassword).length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }
    updates.push("password_hash = ?");
    vals.push(bcrypt.hashSync(String(body.newPassword), 10));
  }

  if (!updates.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  vals.push(user.id);
  await db.run(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, ...vals);
  return NextResponse.json({ ok: true });
}
