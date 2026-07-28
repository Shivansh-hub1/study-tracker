import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";

const SECRET = new TextEncoder().encode(
  process.env.ST_SECRET || "study-tracker-dev-secret-change-me-in-production"
);
export const COOKIE = "st_token";

export type AuthUser = { id: number; name: string; email: string; role: string };

export async function signToken(userId: number) {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return typeof payload.uid === "number" ? payload.uid : null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const uid = await verifyToken(token);
  if (!uid) return null;
  const db = await getDb();
  const user = (await db.get(
    "SELECT id, name, email, role, last_active_at FROM users WHERE id = ?",
    uid
  )) as (AuthUser & { last_active_at: string | null }) | undefined;
  if (!user) return null;
  // Throttled "last seen" tracking for the admin panel (max 1 write / 15 min)
  const stale = !user.last_active_at || Date.now() - new Date(user.last_active_at).getTime() > 15 * 60 * 1000;
  if (stale) {
    db.run("UPDATE users SET last_active_at = ? WHERE id = ?", new Date().toISOString(), uid).catch(() => {});
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/** Returns the user only if they have the admin role, else null. */
export async function getAdminUser(): Promise<AuthUser | null> {
  const user = await getSessionUser();
  return user?.role === "admin" ? user : null;
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookie() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
