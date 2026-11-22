import bcrypt from "bcryptjs";
import crypto from "crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { getDb, ensureSettings } from "./db";
import { signToken, setAuthCookie } from "./auth";
import { sendWelcome } from "./mailer";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return {
    clientId,
    clientSecret,
    isConfigured: Boolean(clientId && clientSecret),
  };
}

export function getGoogleRedirectUri(req?: { headers: { get: (name: string) => string | null } }) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  if (req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
    if (host) return `${proto}://${host}/api/auth/google/callback`;
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://tracker.devshivansh.in";
  return `${base.replace(/\/$/, "")}/api/auth/google/callback`;
}

export type GoogleProfile = {
  email: string;
  name?: string | null;
  picture?: string | null;
};

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile | null> {
  const { clientId } = getGoogleConfig();
  // 1. Try local cryptographic verification against Google's public JWKS
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId || undefined,
    });
    if (payload.email && typeof payload.email === "string") {
      return {
        email: payload.email,
        name: typeof payload.name === "string" ? payload.name : null,
        picture: typeof payload.picture === "string" ? payload.picture : null,
      };
    }
  } catch {
    // Fall back to Google's tokeninfo API
  }

  // 2. Tokeninfo API fallback
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (clientId && data.aud !== clientId) return null;
    if (!data.email) return null;
    return {
      email: data.email,
      name: data.name || null,
      picture: data.picture || null,
    };
  } catch {
    return null;
  }
}

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const em = profile.email.toLowerCase().trim();
  const db = await getDb();
  const existing = (await db.get("SELECT id, name, pfp FROM users WHERE email = ?", em)) as any;

  if (existing) {
    // Sync pfp if user doesn't have one and Google provided one
    if (!existing.pfp && profile.picture) {
      db.run("UPDATE users SET pfp = ?, last_active_at = ? WHERE id = ?", profile.picture, new Date().toISOString(), existing.id).catch(() => {});
    } else {
      db.run("UPDATE users SET last_active_at = ? WHERE id = ?", new Date().toISOString(), existing.id).catch(() => {});
    }
    const token = await signToken(existing.id);
    setAuthCookie(token);
    return { id: existing.id, isNew: false };
  }

  // Create new user (Sign up)
  const displayName = (profile.name || em.split("@")[0] || "Learner").trim().slice(0, 60);
  const randomPwHash = bcrypt.hashSync(crypto.randomUUID(), 10);
  const now = new Date().toISOString();

  const res = await db.run(
    "INSERT INTO users (name, email, password_hash, role, pfp, created_at, last_active_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    displayName,
    em,
    randomPwHash,
    "user",
    profile.picture || null,
    now,
    now
  );

  const newUserId = res.lastInsertRowid;
  await ensureSettings(db, newUserId);

  try {
    await sendWelcome(em, displayName);
  } catch (e) {
    console.error("Welcome email failed", e);
  }

  const token = await signToken(newUserId);
  setAuthCookie(token);
  return { id: newUserId, isNew: true };
}
