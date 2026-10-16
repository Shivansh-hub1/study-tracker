import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";
import { getUserEmailContext } from "@/lib/email-ctx";
import { renderTemplate, sendRaw, mailConfigured, EMAIL_TEMPLATE_IDS, EmailTemplateId } from "@/lib/mailer";

export const dynamic = "force-dynamic";

/*
 * Admin email tool — preview (GET) and send (POST) any template to any user.
 * GET  /api/admin/users/[id]/email?template=streak[&subject=&body= for custom]
 * POST /api/admin/users/[id]/email  { template, subject?, body? }
 * Users with emails disabled (emails_opt_out) are protected from sends.
 */

async function resolve(req: NextRequest, idStr: string) {
  const admin = await getAdminUser();
  if (!admin) return { err: NextResponse.json({ error: "Admins only" }, { status: 403 }) };
  const id = Number(idStr);
  if (!Number.isFinite(id)) return { err: NextResponse.json({ error: "Bad id" }, { status: 400 }) };

  const sp = req.nextUrl.searchParams;
  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const template = (req.method === "POST" ? body.template : sp.get("template")) as EmailTemplateId;
  if (!EMAIL_TEMPLATE_IDS.includes(template)) {
    return { err: NextResponse.json({ error: `template must be one of: ${EMAIL_TEMPLATE_IDS.join(", ")}` }, { status: 400 }) };
  }
  const customSubject = req.method === "POST" ? body.subject : sp.get("subject") || "";
  const customBody = req.method === "POST" ? body.body : sp.get("body") || "";
  if (template === "custom" && req.method === "POST" && (!String(customSubject || "").trim() || !String(customBody || "").trim())) {
    return { err: NextResponse.json({ error: "Custom emails need both a subject and a body" }, { status: 400 }) };
  }

  const db = await getDb();
  const ctx = await getUserEmailContext(db, id);
  if (!ctx) return { err: NextResponse.json({ error: "User not found" }, { status: 404 }) };

  // templates that need live data the user doesn't have
  if (template === "streak" && ctx.streak === 0) {
    return { err: NextResponse.json({ error: "This user has no active streak — try the 'Come back' template instead" }, { status: 400 }) };
  }
  if (template === "progress" && ctx.studiedMin === 0) {
    return { err: NextResponse.json({ error: "This user hasn't studied anything today — the recap would show 0m" }, { status: 400 }) };
  }

  return { admin, db, ctx, template, customSubject: String(customSubject || ""), customBody: String(customBody || "") };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const r = await resolve(req, params.id);
  if (r.err) return r.err;
  const { ctx, template, customSubject, customBody } = r as any;
  const rendered = renderTemplate(template, {
    name: ctx.name,
    studiedMin: ctx.studiedMin,
    streak: ctx.streak,
    freezeStock: ctx.freezeStock,
    customSubject,
    customBody,
  });
  return NextResponse.json({
    ...rendered,
    to: ctx.email,
    emailsOptOut: ctx.emailsOptOut,
    mailConfigured: mailConfigured(),
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const r = await resolve(req, params.id);
  if (r.err) return r.err;
  const { ctx, template, customSubject, customBody } = r as any;

  if (ctx.emailsOptOut) {
    return NextResponse.json({ error: "Emails are disabled for this user — enable them in Edit first" }, { status: 400 });
  }
  if (!mailConfigured()) {
    return NextResponse.json({ error: "SMTP is not configured (set SMTP_HOST / SMTP_USER / SMTP_PASS)" }, { status: 400 });
  }

  const rendered = renderTemplate(template, {
    name: ctx.name,
    studiedMin: ctx.studiedMin,
    streak: ctx.streak,
    freezeStock: ctx.freezeStock,
    customSubject,
    customBody,
  });
  try {
    await sendRaw(ctx.email, rendered.subject, rendered.html, rendered.text);
  } catch (e: any) {
    return NextResponse.json({ error: `Send failed: ${e?.message || "unknown error"}` }, { status: 502 });
  }
  return NextResponse.json({ ok: true, to: ctx.email, subject: rendered.subject });
}
