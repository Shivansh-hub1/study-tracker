import nodemailer from "nodemailer";
import { CANONICAL_SITE_URL } from "./seo";

/*
 * FocusFlow mailer — SMTP-based, provider-agnostic.
 * Works with Gmail (app password), Resend SMTP, Brevo, or any SMTP provider.
 * If SMTP env vars are missing, sending is a no-op (app works without email).
 *
 * Env vars:
 *   SMTP_HOST   e.g. smtp.gmail.com  (required)
 *   SMTP_USER   e.g. your@gmail.com  (required)
 *   SMTP_PASS   app password / SMTP key (required)
 *   SMTP_PORT   default 465 (587 = starttls)
 *   MAIL_FROM   default "FocusFlow <SMTP_USER>"
 */

const FROM = process.env.MAIL_FROM || `FocusFlow <${process.env.SMTP_USER || "no-reply@focusflow.app"}>`;

function transport() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(process.env.SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export function mailConfigured(): boolean {
  return !!transport();
}

async function send(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const t = transport();
  if (!t) {
    console.log(`[mailer] not configured — would send "${subject}" to ${to}`);
    return false;
  }
  await t.sendMail({
    from: FROM,
    to,
    subject,
    html,
    text, // plain-text alternative — HTML-only mail scores worse in spam filters
    headers: {
      // an unsubscribe path improves Gmail/Outlook bulk classification
      "List-Unsubscribe": `<mailto:${process.env.SMTP_USER || "no-reply@focusflow.app"}>`,
    },
  });
  return true;
}

/** Low-level send for admin-composed emails (subject/html/text pre-rendered). */
export async function sendRaw(to: string, subject: string, html: string, text: string): Promise<boolean> {
  return send(to, subject, html, text);
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_SITE_URL;
}

function fmtMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type EmailTemplateId = "welcome" | "streak" | "progress" | "feedback" | "comeback" | "custom" | "digest";
export const EMAIL_TEMPLATE_IDS: EmailTemplateId[] = ["welcome", "streak", "progress", "feedback", "comeback", "custom"];

/* ---------- shared HTML layout ---------- */
function layout(opts: {
  preheader: string;
  heading: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
  <tr><td style="padding:0 8px 16px;text-align:center;">
    <span style="display:inline-block;background:#6366f1;color:#fff;font-weight:bold;font-size:15px;border-radius:9px;padding:7px 13px;">⏱ FocusFlow</span>
  </td></tr>
  <tr><td style="background:#ffffff;border-radius:16px;padding:32px 30px;border:1px solid #e2e8f0;">
    <h1 style="margin:0 0 14px;font-size:22px;color:#0f172a;letter-spacing:-0.4px;">${opts.heading}</h1>
    ${opts.body}
    ${opts.ctaText && opts.ctaUrl ? `<div style="margin-top:26px;text-align:center;">
      <a href="${opts.ctaUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;border-radius:11px;padding:13px 28px;">${opts.ctaText}</a>
    </div>` : ""}
  </td></tr>
  <tr><td style="padding:18px 8px;text-align:center;color:#94a3b8;font-size:12px;line-height:1.6;">
    Sent by FocusFlow · <a href="${siteUrl()}" style="color:#94a3b8;">your study tracker</a><br/>
    Don't want daily emails? Just reply "stop".
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/* ---------- template renderer (single source of truth) ---------- */
export function renderTemplate(
  kind: EmailTemplateId,
  ctx: {
    name: string;
    studiedMin?: number;
    streak?: number;
    freezeStock?: number;
    customSubject?: string;
    customBody?: string;
    weekMin?: number;
    prevWeekMin?: number;
    sessions?: number;
    bestDay?: string;
    bestDayMin?: number;
    topSubject?: string;
    topSubjectMin?: number;
  }
): { subject: string; html: string; text: string } {
  const first = ctx.name.split(" ")[0] || "there";
  const url = `${siteUrl()}/timer`;

  if (kind === "welcome") {
    const html = layout({
      preheader: "Your FocusFlow account is ready — here's how to start.",
      heading: `Welcome to FocusFlow, ${first}! 🎉`,
      body: `<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.65;">
      Your study tracker is ready. Here's how to get the best out of it in 2 minutes:
    </p>
    <ul style="margin:0 0 8px;padding-left:22px;color:#334155;font-size:15px;line-height:1.9;">
      <li><b>Add your subjects</b> — so every session counts towards them</li>
      <li><b>Start your first timer</b> — pomodoro, quick or stopwatch, your pick</li>
      <li><b>Build a streak</b> — study a little daily; freeze days cover emergencies</li>
    </ul>
    <p style="margin:14px 0 0;color:#334155;font-size:15px;line-height:1.65;">
      You'll also get a short daily email with your progress — and a warning if your streak is about to break.
    </p>`,
      ctaText: "Start your first session →",
      ctaUrl: url,
    });
    const text = `Welcome to FocusFlow, ${first}!

Your study tracker is ready. Quick start:
1. Add your subjects — so every session counts towards them
2. Start your first timer — pomodoro, quick or stopwatch, your pick
3. Build a streak — study a little daily; freeze days cover emergencies

You'll get a short daily email with your progress — and a warning if your streak is about to break.

Start your first session: ${url}

— FocusFlow · ${siteUrl()}
Don't want daily emails? Just reply "stop".`;
    return { subject: "Welcome to FocusFlow 🎉", html, text };
  }

  if (kind === "progress") {
    const studiedMin = ctx.studiedMin || 0;
    const streak = ctx.streak || 0;
    const html = layout({
      preheader: `You studied ${fmtMinutes(studiedMin)} today — ${streak}-day streak safe.`,
      heading: `Nice work today, ${first} 🔥`,
      body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
        <tr>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;width:50%;">
            <div style="font-size:24px;font-weight:bold;color:#0f172a;">${fmtMinutes(studiedMin)}</div>
            <div style="font-size:12.5px;color:#64748b;">studied today</div>
          </td>
          <td style="width:12px;"></td>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;width:50%;">
            <div style="font-size:24px;font-weight:bold;color:#0f172a;">${streak} day${streak === 1 ? "" : "s"}</div>
            <div style="font-size:12.5px;color:#64748b;">current streak 🔥</div>
          </td>
        </tr>
      </table>
      <p style="margin:0;color:#334155;font-size:15px;line-height:1.65;">
        Your streak is safe for today. One more short session — or a good rest — both are wins.
      </p>`,
      ctaText: "Keep it going →",
      ctaUrl: url,
    });
    const text = `Nice work today, ${first}!

You studied ${fmtMinutes(studiedMin)} today — your ${streak}-day streak is safe.

Keep it going: ${url}

— FocusFlow · ${siteUrl()}
Don't want daily emails? Just reply "stop".`;
    return { subject: `✅ ${fmtMinutes(studiedMin)} studied — ${streak}-day streak safe`, html, text };
  }

  if (kind === "streak") {
    const streak = ctx.streak || 0;
    const freezeStock = ctx.freezeStock || 0;
    const freezeLine =
      freezeStock > 0
        ? `<p style="margin:14px 0 0;color:#334155;font-size:14px;line-height:1.6;">❄️ Rest day? You have <b>${freezeStock} streak freeze${freezeStock === 1 ? "" : "s"}</b> in stock — use one from your dashboard before midnight.</p>`
        : "";
    const html = layout({
      preheader: `Your ${streak}-day streak breaks at midnight — one session saves it.`,
      heading: `⚠️ ${first}, your ${streak}-day streak breaks tonight`,
      body: `<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.65;">
      You haven't logged any study time today. Your <b>${streak}-day streak</b> resets at midnight —
      but it's not too late.
    </p>
    <p style="margin:0;color:#334155;font-size:15px;line-height:1.65;">
      One <b>15-minute session</b> is all it takes to keep the chain alive. 🧱
    </p>
    ${freezeLine}`,
      ctaText: "Start a 15-min session →",
      ctaUrl: url,
    });
    const text = `${first}, your ${streak}-day streak breaks tonight.

You haven't logged any study time today. One 15-minute session is all it takes to keep the chain alive:
${url}
${freezeStock > 0 ? `Rest day? You have ${freezeStock} streak freeze${freezeStock === 1 ? "" : "s"} in stock — use one from your dashboard before midnight.` : ""}
— FocusFlow · ${siteUrl()}
Don't want daily emails? Just reply "stop".`;
    return { subject: `⚠️ Your ${streak}-day streak breaks tonight`, html, text };
  }

  if (kind === "feedback") {
    const html = layout({
      preheader: "One quick reply — is FocusFlow helping you study?",
      heading: `Quick question, ${first} 👋`,
      body: `<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.65;">
      You've been using FocusFlow for a little while now — I'd love to hear how it's going.
    </p>
    <ul style="margin:0 0 8px;padding-left:22px;color:#334155;font-size:15px;line-height:1.9;">
      <li>Is the <b>daily streak</b> actually helping you study?</li>
      <li>Anything confusing or annoying?</li>
      <li>Any feature you wish existed?</li>
    </ul>
    <p style="margin:14px 0 0;color:#334155;font-size:15px;line-height:1.65;">
      Just <b>reply to this email</b> — it comes straight to me, and I read every one.
    </p>`,
      ctaText: "Open your dashboard →",
      ctaUrl: `${siteUrl()}/dashboard`,
    });
    const text = `Quick question, ${first} —

How's FocusFlow working for you? Is the daily streak helping? Anything confusing, annoying, or missing?

Just reply to this email — it comes straight to me.

${siteUrl()}/dashboard

— FocusFlow · ${siteUrl()}`;
    return { subject: "How's FocusFlow working for you?", html, text };
  }

  if (kind === "comeback") {
    const html = layout({
      preheader: "Even 10 minutes today restarts the momentum.",
      heading: `Long time no study, ${first} 👀`,
      body: `<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.65;">
      You haven't been around lately. No guilt — life happens.
    </p>
    <p style="margin:0;color:#334155;font-size:15px;line-height:1.65;">
      But your subjects are still waiting, and even <b>10 minutes today</b> restarts the momentum.
      That's one short revision session — then the streak engine takes over again.
    </p>`,
      ctaText: "Pick up where you left off →",
      ctaUrl: url,
    });
    const text = `Long time no study, ${first} —

You haven't been around lately. No guilt — life happens. But your subjects are still waiting, and even 10 minutes today restarts the momentum:

${url}

— FocusFlow · ${siteUrl()}
Don't want daily emails? Just reply "stop".`;
    return { subject: "Your study streak misses you 🌱", html, text };
  }

  if (kind === "digest") {
    const weekMin = ctx.weekMin || 0;
    const prevMin = ctx.prevWeekMin || 0;
    const diff = weekMin - prevMin;
    const diffTxt = prevMin === 0
      ? "first tracked week"
      : `${diff >= 0 ? "▲" : "▼"} ${fmtMinutes(Math.abs(diff))} vs last week`;
    const diffColor = diff >= 0 ? "#059669" : "#dc2626";
    if (weekMin === 0) {
      const html = layout({
        preheader: "No study time logged this week — next week starts now.",
        heading: `A quiet week, ${first} 🌱`,
        body: `<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.65;">
          No study time in the last 7 days. No guilt — but your streak engine is idle and your subjects are waiting.
        </p>
        <p style="margin:0;color:#334155;font-size:15px;line-height:1.65;">
          Start with <b>one 15-minute session today</b> and the momentum comes back.
        </p>`,
        ctaText: "Start a session →",
        ctaUrl: url,
      });
      const text = `A quiet week, ${first} —

No study time in the last 7 days. Start with one 15-minute session today and the momentum comes back:

${url}

— FocusFlow · ${siteUrl()}
Don't want weekly emails? Just reply "stop".`;
      return { subject: "📊 Your week: a fresh start", html, text };
    }
    const card = (val: string, lbl: string) => `<td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 10px;text-align:center;width:25%;">
      <div style="font-size:19px;font-weight:bold;color:#0f172a;">${val}</div>
      <div style="font-size:11.5px;color:#64748b;">${lbl}</div>
    </td>`;
    const html = layout({
      preheader: `${fmtMinutes(weekMin)} of focus in the last 7 days.`,
      heading: `Your week: ${fmtMinutes(weekMin)} of focus 📊`,
      body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 6px;">
        <tr>
          ${card(fmtMinutes(weekMin), "total focus")}
          ${card(String(ctx.sessions ?? 0), "sessions")}
          ${card(ctx.bestDay ? `${ctx.bestDay}<br/><span style="font-size:13px;font-weight:600;">${fmtMinutes(ctx.bestDayMin || 0)}</span>` : "—", "best day")}
          ${card(ctx.topSubject ? `${ctx.topSubject}<br/><span style="font-size:13px;font-weight:600;">${fmtMinutes(ctx.topSubjectMin || 0)}</span>` : "—", "top subject")}
        </tr>
      </table>
      <div style="text-align:center;font-size:13.5px;color:${prevMin === 0 ? "#64748b" : diffColor};font-weight:600;margin-bottom:14px;">${diffTxt}</div>
      <p style="margin:0;color:#334155;font-size:15px;line-height:1.65;">
        ${ctx.streak ? `Your streak is at <b>${ctx.streak} day${ctx.streak === 1 ? "" : "s"}</b> 🔥 — keep it alive.` : "Start a streak this week — one session a day is all it takes."}
      </p>`,
      ctaText: "See your full progress →",
      ctaUrl: `${siteUrl()}/progress`,
    });
    const text = `Your week, ${first}:

Total focus: ${fmtMinutes(weekMin)} in ${ctx.sessions ?? 0} sessions
Best day: ${ctx.bestDay ? `${ctx.bestDay} (${fmtMinutes(ctx.bestDayMin || 0)})` : "—"}
Top subject: ${ctx.topSubject ? `${ctx.topSubject} (${fmtMinutes(ctx.topSubjectMin || 0)})` : "—"}
${diffTxt}${ctx.streak ? `
Streak: ${ctx.streak} days 🔥` : ""}

${siteUrl()}/progress

— FocusFlow · ${siteUrl()}
Don't want weekly emails? Just reply "stop".`;
    return { subject: `📊 Your week: ${fmtMinutes(weekMin)} of focus`, html, text };
  }

  // custom (admin-composed)
  const subject = (ctx.customSubject || "A message from FocusFlow").trim();
  const bodyText = (ctx.customBody || "").trim();
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.65;">${esc(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  const html = layout({
    preheader: esc(bodyText.slice(0, 120)),
    heading: `✉️ A message from FocusFlow`,
    body: paragraphs || `<p style="margin:0;color:#334155;font-size:15px;line-height:1.65;">(no content)</p>`,
    ctaText: "Open FocusFlow →",
    ctaUrl: `${siteUrl()}/dashboard`,
  });
  const text = `${subject}

${bodyText}

— FocusFlow · ${siteUrl()}`;
  return { subject, html, text };
}

/* ---------- automated sends (cron + signup) ---------- */
export async function sendWelcome(to: string, name: string): Promise<boolean> {
  const r = renderTemplate("welcome", { name });
  return send(to, r.subject, r.html, r.text);
}

export async function sendDaily(opts: {
  to: string;
  name: string;
  studiedMin: number;
  streak: number;
  atRisk: boolean;
  frozenToday: boolean;
  freezeStock: number;
}): Promise<boolean> {
  const kind: EmailTemplateId = opts.studiedMin > 0 ? "progress" : "streak";
  const r = renderTemplate(kind, {
    name: opts.name,
    studiedMin: opts.studiedMin,
    streak: opts.streak,
    freezeStock: opts.freezeStock,
  });
  return send(opts.to, r.subject, r.html, r.text);
}

/* ---------- password reset ---------- */
export async function sendPasswordReset(to: string, name: string, resetUrl: string): Promise<boolean> {
  const first = name.split(" ")[0] || "there";
  const html = layout({
    preheader: "This link works for 60 minutes.",
    heading: `Reset your password, ${first}?`,
    body: `<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.65;">
      We got a request to reset your FocusFlow password. Click the button below —
      the link is valid for <b>60 minutes</b> and works only once.
    </p>
    <p style="margin:0;color:#334155;font-size:15px;line-height:1.65;">
      If you didn't request this, you can safely ignore this email — your password stays unchanged.
    </p>`,
    ctaText: "Set a new password →",
    ctaUrl: resetUrl,
  });
  const text = `Reset your FocusFlow password, ${first}

Open this link (valid 60 minutes, works once):
${resetUrl}

If you didn't request this, ignore this email — your password stays unchanged.

— FocusFlow · ${siteUrl()}`;
  return send(to, "Reset your FocusFlow password", html, text);
}
