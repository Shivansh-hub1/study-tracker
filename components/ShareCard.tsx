"use client";

export type ShareStats = {
  streak: number;
  monthMin: number;
  level: number;
  xp: number;
  totalHours: number;
  daily?: number[];
};

export function fmtShareHours(min: number) {
  const h = min / 60;
  return h >= 10 ? `${Math.round(h)}h` : `${Math.round(h * 10) / 10}h`;
}

function rr(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number) {
  x.beginPath();
  (x as any).roundRect(px, py, w, h, r);
}

/** Paints a 1080x1350 story-style progress card. Pure canvas, no deps. */
export function drawShareCard(cv: HTMLCanvasElement, s: ShareStats) {
  const W = 1080, H = 1350;
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d")!;

  x.fillStyle = "#0a0618";
  x.fillRect(0, 0, W, H);
  const blob = (cx: number, cy: number, r: number, c: string) => {
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    rg.addColorStop(0, c); rg.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = rg; x.fillRect(0, 0, W, H);
  };
  blob(150, 200, 480, "rgba(124,58,237,.65)");
  blob(930, 330, 500, "rgba(217,70,239,.5)");
  blob(880, 1150, 520, "rgba(34,211,238,.45)");
  blob(140, 1180, 460, "rgba(99,102,241,.55)");
  const vg = x.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 950);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.45)");
  x.fillStyle = vg; x.fillRect(0, 0, W, H);

  const glass = (px: number, py: number, w: number, h: number, r: number) => {
    rr(x, px, py, w, h, r);
    x.fillStyle = "rgba(255,255,255,.09)"; x.fill();
    x.strokeStyle = "rgba(255,255,255,.22)"; x.lineWidth = 2; x.stroke();
    x.save(); rr(x, px, py, w, h, r); x.clip();
    x.fillStyle = "rgba(255,255,255,.07)"; x.fillRect(px, py, w, h * 0.45);
    x.restore();
  };

  x.textAlign = "center";

  const brandG = x.createLinearGradient(300, 0, 780, 0);
  brandG.addColorStop(0, "#c4b5fd"); brandG.addColorStop(0.5, "#f0abfc"); brandG.addColorStop(1, "#a5f3fc");
  x.fillStyle = brandG;
  x.font = "800 66px system-ui, -apple-system, sans-serif";
  x.fillText("FocusFlow", W / 2, 150);
  x.fillStyle = "rgba(255,255,255,.6)";
  x.font = "600 30px system-ui, -apple-system, sans-serif";
  x.fillText("M Y   S T U D Y   M O N T H", W / 2, 198);

  glass(90, 248, 900, 372, 48);
  x.font = "800 104px system-ui, -apple-system, sans-serif";
  x.fillText("🔥", W / 2, 396);
  const numG = x.createLinearGradient(0, 430, 0, 600);
  numG.addColorStop(0, "#ffffff"); numG.addColorStop(1, "#f0abfc");
  x.fillStyle = numG;
  x.font = "800 200px system-ui, -apple-system, sans-serif";
  x.fillText(`${s.streak}`, W / 2, 560);
  x.fillStyle = "rgba(255,255,255,.8)";
  x.font = "600 40px system-ui, -apple-system, sans-serif";
  x.fillText("DAY STREAK", W / 2, 600);

  const cells: Array<[string, string]> = [
    [fmtShareHours(s.monthMin), "this month"],
    [`${s.totalHours}h`, "total focus"],
    [`Lv ${s.level}`, "level"],
    [`${s.xp}`, "total xp"],
  ];
  cells.forEach(([big, small], i) => {
    const cx = 90 + (i % 2) * 470, cy = 656 + Math.floor(i / 2) * 176;
    glass(cx, cy, 430, 140, 32);
    x.fillStyle = "#fff";
    x.font = "800 66px system-ui, -apple-system, sans-serif";
    x.fillText(big, cx + 215, cy + 82);
    x.fillStyle = "rgba(255,255,255,.65)";
    x.font = "500 30px system-ui, -apple-system, sans-serif";
    x.fillText(small.toUpperCase(), cx + 215, cy + 120);
  });

  glass(90, 1008, 900, 190, 40);
  x.fillStyle = "rgba(255,255,255,.6)";
  x.font = "600 26px system-ui, -apple-system, sans-serif";
  x.fillText("LAST 7 DAYS", W / 2, 1048);
  const week = (s.daily && s.daily.length === 7 ? s.daily : [0, 0, 0, 0, 0, 0, 0]).map((v) => Math.max(0, v));
  const mx = Math.max(30, ...week);
  const bw = 72, gap = 30, total = 7 * bw + 6 * gap;
  let bx = (W - total) / 2;
  const base = 1140, maxH = 76;
  const names = "SMTWTFS";
  const today = new Date().getDay();
  week.forEach((v, i) => {
    const h = v <= 0 ? 8 : Math.max(14, Math.round((v / mx) * maxH));
    const by = base - h;
    const bg = x.createLinearGradient(0, by, 0, base);
    if (v <= 0) { bg.addColorStop(0, "rgba(255,255,255,.14)"); bg.addColorStop(1, "rgba(255,255,255,.14)"); }
    else { bg.addColorStop(0, "#e879f9"); bg.addColorStop(1, "#8b5cf6"); }
    x.fillStyle = bg;
    rr(x, bx, by, bw, h, 14); x.fill();
    x.fillStyle = "rgba(255,255,255,.55)";
    x.font = "600 24px system-ui, -apple-system, sans-serif";
    x.fillText(names[(today - (6 - i) + 70) % 7], bx + bw / 2, 1172);
    bx += bw + gap;
  });

  x.fillStyle = "rgba(255,255,255,.75)";
  x.font = "500 34px system-ui, -apple-system, sans-serif";
  x.fillText("Small steps daily.", W / 2, 1256);
  x.fillStyle = "rgba(255,255,255,.45)";
  x.font = "500 30px system-ui, -apple-system, sans-serif";
  x.fillText(new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" }), W / 2, 1302);
}

export function shareText(s: ShareStats) {
  return `🔥 ${s.streak}-day study streak on FocusFlow!\n⏱️ ${fmtShareHours(s.monthMin)} this month · ${s.totalHours}h total · Level ${s.level} (${s.xp} XP)\nSmall steps daily.`;
}
