import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.ST_SECRET || "study-tracker-dev-secret-change-me-in-production"
);

const PUBLIC_PATHS = ["/login", "/signup", "/about", "/privacy", "/terms", "/blog"];
const AUTH_PATHS = ["/login", "/signup"];

const CANONICAL_HOST = (process.env.VERCEL_PROJECT_PRODUCTION_URL || "yourstudytracker.vercel.app").toLowerCase();

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always land on ONE domain: every *.vercel.app preview/deployment URL
  // redirects to the production host, so the login cookie is never split
  // across different domains (this was causing repeated logins).
  const host = (req.headers.get("host") || "").toLowerCase();
  if (host && host !== CANONICAL_HOST && host.endsWith(".vercel.app")) {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  if (
      pathname === "/" ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/robots.txt") ||
      pathname.startsWith("/llms.txt") ||
      pathname.startsWith("/sitemap.xml") ||
      pathname.startsWith("/manifest") ||
      pathname.startsWith("/opengraph-image") ||
      pathname.startsWith("/apple-icon") ||
      pathname.startsWith("/icon") ||
      pathname.startsWith("/api/auth") ||
      PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
    ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("st_token")?.value;
  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET);
      valid = true;
    } catch {
      valid = false;
    }
  }

  const isApi = pathname.startsWith("/api");
  if (!valid) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged-in users shouldn't see auth pages (login/signup only)
  if (AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
