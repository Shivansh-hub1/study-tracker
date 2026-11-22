import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getGoogleConfig, getGoogleRedirectUri, verifyGoogleIdToken, findOrCreateGoogleUser } from "@/lib/google-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { clientId, isConfigured } = getGoogleConfig();
  const searchParams = req.nextUrl.searchParams;
  const nextParam = searchParams.get("next");
  const validNext = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;

  if (!isConfigured || !clientId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "google_not_configured");
    if (validNext) loginUrl.searchParams.set("next", validNext);
    return NextResponse.redirect(loginUrl);
  }

  const state = crypto.randomUUID();
  const redirectUri = getGoogleRedirectUri(req);

  cookies().set(
    "g_oauth_state",
    JSON.stringify({ state, next: validNext }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600, // 10 minutes
      secure: process.env.NODE_ENV === "production",
    }
  );

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleAuthUrl);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const credential = String(body.credential || "").trim();

  if (!credential) {
    return NextResponse.json({ error: "Missing Google credential token" }, { status: 400 });
  }

  const profile = await verifyGoogleIdToken(credential);
  if (!profile || !profile.email) {
    return NextResponse.json({ error: "Invalid or expired Google credential" }, { status: 401 });
  }

  const result = await findOrCreateGoogleUser(profile);
  return NextResponse.json({ ok: true, isNew: result.isNew });
}
