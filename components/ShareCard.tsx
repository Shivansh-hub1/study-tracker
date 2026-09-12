"use client";

export type ShareStats = { streak: number; monthMin: number; level: number; xp: number };

export function fmtShareHours(min: number) {
  const h = min / 60;
  return h >= 10 ? `${Math.round(h)}h` : `${Math.round(h * 10) / 10}h`;
}

/** Paints a 1080x1350 story-style progress card. Pure canvas, no deps. */
export function drawShareCard(cv: HTMLCanvasElement, s: ShareStats) {
  const W = 1080, H = 1350;
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d")!;

  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#150b2e"); g.addColorStop(0.5, "#1e0b33"); g.addColorStop(1, "#082032");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const blob = (cx: number, cy: number, r: number, c: string) => {
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    rg.addColorStop(0, c); rg.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = rg; x.fillRect(0, 0, W, H);
  };
  blob(200, 260, 430, "rgba(139,92,246,.6)");
  blob(900, 520, 470, "rgba(217,70,239,.5)");
  blob(540, 1220, 490, "rgba(34,211,238,.45)");

  x.textAlign = "center";
  x.fillStyle = "#ffffff";
  x.font = "800 68px system-ui, -apple-system, sans-serif";
  x.fillText("FocusFlow", W / 2, 210);
  x.font = "500 38px system-ui, -apple-system, sans-serif";
  x.fillStyle = "rgba(255,255,255,.7)";
  x.fillText("MY STUDY MONTH", W / 2, 272);

  x.font = "800 120px system-ui, -apple-system, sans-serif";
  x.fillText("🔥", W / 2, 470);
  x.fillStyle = "#ffffff";
  x.font = "800 260px system-ui, -apple-system, sans-serif";
  x.fillText(`${s.streak}`, W / 2, 740);
  x.font = "600 52px system-ui, -apple-system, sans-serif";
  x.fillStyle = "rgba(255,255,255,.85)";
  x.fillText(s.streak === 1 ? "day streak" : "day streak", W / 2, 820);

  // stat pills
  const pills: Array<[string, string]> = [
    [fmtShareHours(s.monthMin), "this month"],
    [`Lv ${s.level}`, `${s.xp} XP`],
  ];
  pills.forEach(([big, small], i) => {
    const pw = 400, ph = 190, px = W / 2 - pw - 20 + i * (pw + 40), py = 900;
    x.fillStyle = "rgba(255,255,255,.1)";
    x.strokeStyle = "rgba(255,255,255,.25)";
    x.lineWidth = 2;
    x.beginPath();
    (x as any).roundRect(px, py, pw, ph, 36);
    x.fill(); x.stroke();
    x.fillStyle = "#fff";
    x.font = "800 84px system-ui, -apple-system, sans-serif";
    x.fillText(big, px + pw / 2, py + 105);
    x.font = "500 36px system-ui, -apple-system, sans-serif";
    x.fillStyle = "rgba(255,255,255,.7)";
    x.fillText(small, px + pw / 2, py + 155);
  });

  x.font = "500 34px system-ui, -apple-system, sans-serif";
  x.fillStyle = "rgba(255,255,255,.55)";
  x.fillText("Small steps daily.", W / 2, 1200);
  x.fillText(new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" }), W / 2, 1250);
}

export function shareText(s: ShareStats) {
  return `🔥 ${s.streak}-day study streak on FocusFlow!\n⏱️ ${fmtShareHours(s.monthMin)} this month · Level ${s.level} (${s.xp} XP)\nSmall steps daily.`;
}
