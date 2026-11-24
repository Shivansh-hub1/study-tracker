import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST() {
  clearAuthCookie();
  return NextResponse.json({ ok: true });
}
