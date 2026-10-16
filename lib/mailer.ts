import nodemailer from "nodemailer";

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

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://yourstudytracker.vercel.app";
}

function fmtMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

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

/* ---------- welcome email ---------- */
export async function sendWelcome(to: string, name: string): Promise<boolean> {
  const first = name.split(" ")[0] || "there";
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
    ctaUrl: `${siteUrl()}/timer`,
  });
  const text = `Welcome to FocusFlow, ${first}!

Your study tracker is ready. Quick start:
1. Add your subjects — so every session counts towards them
2. Start your first timer — pomodoro, quick or stopwatch, your pick
3. Build a streak — study a little daily; freeze days cover emergencies

You'll get a short daily email with your progress — and a warning if your streak is about to break.

Start your first session: ${siteUrl()}/timer

— FocusFlow · ${siteUrl()}
Don't want daily emails? Just reply "stop".`;
  return send(to, "Welcome to FocusFlow 🎉", html, text);
}

/* ---------- daily email ---------- */
export async function sendDaily(opts: {
  to: string;
  name: string;
  studiedMin: number;
  streak: number;
  atRisk: boolean;
  frozenToday: boolean;
  freezeStock: number;
}): Promise<boolean> {
  const first = opts.name.split(" ")[0] || "there";
  const url = `${siteUrl()}/timer`;

  if (opts.studiedMin > 0) {
    const html = layout({
      preheader: `You studied ${fmtMinutes(opts.studiedMin)} today — ${opts.streak}-day streak safe.`,
      heading: `Nice work today, ${first} 🔥`,
      body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
        <tr>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;width:50%;">
            <div style="font-size:24px;font-weight:bold;color:#0f172a;">${fmtMinutes(opts.studiedMin)}</div>
            <div style="font-size:12.5px;color:#64748b;">studied today</div>
          </td>
          <td style="width:12px;"></td>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;width:50%;">
            <div style="font-size:24px;font-weight:bold;color:#0f172a;">${opts.streak} day${opts.streak === 1 ? "" : "s"}</div>
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

You studied ${fmtMinutes(opts.studiedMin)} today — your ${opts.streak}-day streak is safe.

Keep it going: ${url}

— FocusFlow · ${siteUrl()}
Don't want daily emails? Just reply "stop".`;
    return send(opts.to, `✅ ${fmtMinutes(opts.studiedMin)} studied — ${opts.streak}-day streak safe`, html, text);
  }

  // at-risk: streak > 0 but nothing studied today
  const freezeLine =
    opts.freezeStock > 0
      ? `<p style="margin:14px 0 0;color:#334155;font-size:14px;line-height:1.6;">❄️ Rest day? You have <b>${opts.freezeStock} streak freeze${opts.freezeStock === 1 ? "" : "s"}</b> in stock — use one from your dashboard before midnight.</p>`
      : "";
  const html = layout({
    preheader: `Your ${opts.streak}-day streak breaks at midnight — one session saves it.`,
    heading: `⚠️ ${first}, your ${opts.streak}-day streak breaks tonight`,
    body: `<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.65;">
      You haven't logged any study time today. Your <b>${opts.streak}-day streak</b> resets at midnight —
      but it's not too late.
    </p>
    <p style="margin:0;color:#334155;font-size:15px;line-height:1.65;">
      One <b>15-minute session</b> is all it takes to keep the chain alive. 🧱
    </p>
    ${freezeLine}`,
    ctaText: "Start a 15-min session →",
    ctaUrl: url,
  });
  const text = `${first}, your ${opts.streak}-day streak breaks tonight.

You haven't logged any study time today. One 15-minute session is all it takes to keep the chain alive:
${url}
${opts.freezeStock > 0 ? `Rest day? You have ${opts.freezeStock} streak freeze${opts.freezeStock === 1 ? "" : "s"} in stock — use one from your dashboard before midnight.` : ""}
— FocusFlow · ${siteUrl()}
Don't want daily emails? Just reply "stop".`;
  return send(opts.to, `⚠️ Your ${opts.streak}-day streak breaks tonight`, html, text);
}
