import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGoogleConfig, getGoogleRedirectUri, findOrCreateGoogleUser } from "@/lib/google-auth";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { clientId, clientSecret, isConfigured } = getGoogleConfig();
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const failRedirect = (errKey: string, destNext?: string | null) => {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", errKey);
    if (destNext) url.searchParams.set("next", destNext);
    return NextResponse.redirect(url);
  };

  if (error) {
    return failRedirect(error === "access_denied" ? "access_denied" : "google_error");
  }

  if (!code || !state) {
    return failRedirect("missing_code");
  }

  // Verify OAuth state cookie
  const stateCookie = cookies().get("g_oauth_state")?.value;
  let parsedState: { state: string; next?: string | null } | null = null;
  try {
    parsedState = JSON.parse(stateCookie || "{}");
  } catch {
    parsedState = null;
  }

  if (!parsedState || parsedState.state !== state) {
    return failRedirect("invalid_state");
  }

  const nextDest = parsedState.next && parsedState.next.startsWith("/") && !parsedState.next.startsWith("//")
    ? parsedState.next
    : "/dashboard";

  if (!isConfigured || !clientId || !clientSecret) {
    return failRedirect("google_not_configured", nextDest);
  }

  // Exchange code for tokens
  const redirectUri = getGoogleRedirectUri(req);
  let tokenData: { access_token?: string } = {};
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return failRedirect("token_exchange_failed", nextDest);
    }
    tokenData = await tokenRes.json();
  } catch {
    return failRedirect("network_error", nextDest);
  }

  if (!tokenData.access_token) {
    return failRedirect("token_missing", nextDest);
  }

  // Fetch Google User Profile
  let profile: { email?: string; name?: string; picture?: string; email_verified?: boolean } = {};
  try {
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userinfoRes.ok) {
      return failRedirect("userinfo_failed", nextDest);
    }
    profile = await userinfoRes.json();
  } catch {
    return failRedirect("network_error", nextDest);
  }

  if (!profile.email) {
    return failRedirect("no_email", nextDest);
  }

  // Clean up OAuth state cookie
  cookies().set("g_oauth_state", "", { maxAge: 0, path: "/" });

  // Log in or sign up the user
  await findOrCreateGoogleUser({
    email: profile.email,
    name: profile.name || null,
    picture: profile.picture || null,
  });

  return NextResponse.redirect(new URL(nextDest, req.url));
}
