"use client";

// Tiny dependency-free confetti burst. Fire and forget — cleans up after itself.
export function burstConfetti(ms = 2200) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cvs = document.createElement("canvas");
  cvs.width = W * dpr;
  cvs.height = H * dpr;
  cvs.style.cssText = `position:fixed;inset:0;width:${W}px;height:${H}px;pointer-events:none;z-index:9999`;
  document.body.appendChild(cvs);
  const ctx = cvs.getContext("2d");
  if (!ctx) {
    cvs.remove();
    return;
  }
  ctx.scale(dpr, dpr);
  const COLORS = ["#f97316", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#22d3ee"];
  const parts = Array.from({ length: 130 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.4,
    y: H * 0.35,
    vx: (Math.random() - 0.5) * 11,
    vy: -Math.random() * 13 - 4,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: COLORS[(Math.random() * COLORS.length) | 0],
  }));
  const t0 = performance.now();
  const step = (t: number) => {
    const el = t - t0;
    ctx!.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += 0.32;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx!.save();
      ctx!.globalAlpha = Math.max(0, 1 - el / ms);
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.fillStyle = p.c;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    }
    if (el < ms) requestAnimationFrame(step);
    else cvs.remove();
  };
  requestAnimationFrame(step);
}
