import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { computeStats } from "@/lib/stats";
import Heatmap from "@/components/Heatmap";
import ProfileShareButton from "./ProfileShareButton";
import { Flame, Clock, Trophy, Target, ArrowRight, ShieldCheck, Code2, BookOpen, Sparkles } from "lucide-react";
import { SITE_NAME, CANONICAL_SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function getProfileData(rawIdentifier: string) {
  const raw = decodeURIComponent(rawIdentifier || "").trim().toLowerCase();
  if (!raw) return null;

  const db = await getDb();
  let user = (await db.get(
    "SELECT id, name, username, pfp, created_at FROM users WHERE LOWER(username) = ? LIMIT 1",
    raw
  )) as any;

  if (!user && /^\d+$/.test(raw)) {
    user = (await db.get(
      "SELECT id, name, username, pfp, created_at FROM users WHERE id = ? LIMIT 1",
      parseInt(raw, 10)
    )) as any;
  }

  if (!user) {
    user = (await db.get(
      "SELECT id, name, username, pfp, created_at FROM users WHERE LOWER(name) = ? LIMIT 1",
      raw
    )) as any;
  }

  if (!user) return null;

  const [sessions, frozenRows, spentRow, transferRows, dsaDone, webDone] = await Promise.all([
    db.all("SELECT id, duration_sec, started_at, subject_id, type FROM sessions WHERE user_id = ? ORDER BY started_at ASC", user.id),
    db.all("SELECT day FROM freeze_days WHERE user_id = ?", user.id),
    db.get("SELECT COALESCE(SUM(cost),0) as c FROM xp_purchases WHERE user_id = ?", user.id),
    db.all("SELECT from_day, to_day, minutes FROM time_transfers WHERE user_id = ?", user.id),
    db.get("SELECT COUNT(*) as c FROM dsa_progress WHERE user_id = ? AND status = 'done'", user.id),
    db.get("SELECT COUNT(*) as c FROM web_progress WHERE user_id = ? AND status = 'done'", user.id),
  ]);

  const stats = computeStats(
    (sessions || []) as any[],
    (frozenRows || []) as any[],
    undefined,
    undefined,
    0,
    Number((spentRow as any)?.c || 0),
    (transferRows || []) as any[]
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username || `user${user.id}`,
      pfp: user.pfp || null,
      joinedAt: user.created_at,
    },
    stats: {
      streak: stats.streak ?? 0,
      totalHours: stats.totalHours ?? 0,
      totalSessions: stats.totalSessions ?? 0,
      level: stats.level ?? 1,
      xp: stats.xp ?? 0,
      heat: stats.heat || [],
      monthMin: stats.monthMin ?? 0,
      topSubjects: (stats.bySubject || []).slice(0, 5),
      dsaSolved: Number((dsaDone as any)?.c || 0),
      webdevCompleted: Number((webDone as any)?.c || 0),
    },
  };
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const data = await getProfileData(params.username);
  if (!data) return { title: "Developer Profile Not Found · FocusFlow" };

  const { user, stats } = data;
  const title = `${user.name} (@${user.username}) · Engineering Focus & DSA Consistency`;
  const desc = `${user.name} has logged ${stats.totalHours}h of deep work with a ${stats.streak}-day streak on FocusFlow. View their verified consistency profile.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `${CANONICAL_SITE_URL}/u/${user.username}` },
    openGraph: {
      type: "profile",
      siteName: SITE_NAME,
      title,
      description: desc,
      url: `${CANONICAL_SITE_URL}/u/${user.username}`,
    },
    twitter: {
      card: "summary",
      title,
      description: desc,
    },
  };
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const data = await getProfileData(params.username);
  if (!data) notFound();

  const { user, stats } = data;
  const joinDate = user.joinedAt ? new Date(user.joinedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "2024";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", padding: "24px 16px 80px" }}>
      {/* Top Navbar */}
      <header
        style={{
          maxWidth: 960,
          margin: "0 auto 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 20px",
          borderRadius: 16,
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--accent-grad)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            F
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.3 }}>FocusFlow</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/login" className="btn btn-sm" style={{ textDecoration: "none" }}>
            Sign In
          </Link>
          <Link href="/signup" className="btn btn-sm btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
            Start Your Streak <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Profile Card Hero */}
        <section
          className="card"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "32px 28px",
            borderRadius: 20,
            background: "linear-gradient(180deg, var(--surface) 0%, rgba(20,13,38,0.7) 100%)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Ambient subtle glow background */}
          <div
            style={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 240,
              height: 240,
              background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                background: "var(--accent-grad)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 30,
                boxShadow: "0 0 20px rgba(168,85,247,0.4)",
                flexShrink: 0,
                overflow: "hidden",
                border: "3px solid rgba(255,255,255,0.15)",
              }}
            >
              {user.pfp ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.pfp} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user.name.slice(0, 2).toUpperCase()
              )}
            </div>

            {/* Info & Badges */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>{user.name}</h1>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "rgba(16,185,129,0.15)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  <ShieldCheck size={13} /> Verified Focus
                </span>
              </div>

              <div style={{ fontSize: 14, color: "var(--muted)", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 600, color: "var(--accent)" }}>@{user.username}</span>
                <span>·</span>
                <span>Member since {joinDate}</span>
                <span>·</span>
                <span>Level {stats.level}</span>
              </div>

              <ProfileShareButton username={user.username} name={user.name} streak={stats.streak} totalHours={stats.totalHours} />
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
              marginTop: 32,
              paddingTop: 24,
              borderTop: "1px solid var(--border)",
            }}
          >
            <div style={{ padding: "12px 16px", borderRadius: 14, background: "var(--surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                <Flame size={15} color="#f97316" /> Active Streak
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#f97316" }}>
                {stats.streak} <span style={{ fontSize: 14, fontWeight: 500 }}>days</span>
              </div>
            </div>

            <div style={{ padding: "12px 16px", borderRadius: 14, background: "var(--surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                <Clock size={15} color="#38bdf8" /> Total Focus
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#38bdf8" }}>
                {stats.totalHours} <span style={{ fontSize: 14, fontWeight: 500 }}>hrs</span>
              </div>
            </div>

            <div style={{ padding: "12px 16px", borderRadius: 14, background: "var(--surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                <Code2 size={15} color="#a855f7" /> DSA & Web Milestones
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#a855f7" }}>
                {stats.dsaSolved + stats.webdevCompleted} <span style={{ fontSize: 14, fontWeight: 500 }}>solved</span>
              </div>
            </div>

            <div style={{ padding: "12px 16px", borderRadius: 14, background: "var(--surface-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                <Trophy size={15} color="#eab308" /> Total XP
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#eab308" }}>
                {stats.xp.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500 }}>xp</span>
              </div>
            </div>
          </div>
        </section>

        {/* Consistency Heatmap */}
        <section className="card" style={{ padding: "24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={16} color="var(--accent)" /> 20-Week Consistency Heatmap
            </h2>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{stats.totalSessions} sessions logged</span>
          </div>
          <Heatmap data={stats.heat} />
        </section>

        {/* Top Focus Areas */}
        {stats.topSubjects.length > 0 && (
          <section className="card" style={{ padding: "24px 20px" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={16} color="var(--accent)" /> Top Study Focus Areas
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {stats.topSubjects.map((sub: any, i: number) => {
                const hrs = Math.round((sub.minutes / 60) * 10) / 10;
                return (
                  <div
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 14px",
                      borderRadius: 12,
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: sub.color || "var(--accent)" }} />
                    <span style={{ fontWeight: 600 }}>{sub.name}</span>
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>· {hrs}h</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Viral CTA Banner */}
        <section
          style={{
            padding: "36px 28px",
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.18) 100%)",
            border: "1px solid rgba(168,85,247,0.3)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
            Build Engineering Consistency Like {user.name}
          </div>
          <p style={{ margin: 0, maxWidth: 520, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
            Track DSA problem solving, manage deep work Pomodoro blocks, and build an unbreakable study streak with FocusFlow — 100% free.
          </p>
          <Link
            href="/signup"
            className="btn btn-primary"
            style={{
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 12,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Create Your Free Account <ArrowRight size={15} />
          </Link>
        </section>
      </main>
    </div>
  );
}
