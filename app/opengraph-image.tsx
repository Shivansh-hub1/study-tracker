import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FocusFlow — Deep-focus study tracker with timer, roadmaps and analytics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const pills = ["Focus Timer", "DSA Roadmap", "WebDev Roadmap", "Flashcards", "Streaks", "Analytics"];

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 55%, #831843 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              fontWeight: 800,
              background: "linear-gradient(135deg, #a78bfa, #f472b6)",
            }}
          >
            F
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>FocusFlow</div>
        </div>
        <div style={{ fontSize: 36, marginTop: 26, opacity: 0.92, lineHeight: 1.3 }}>
          Deep-focus study tracker — timer, roadmaps, revision &amp; analytics
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 34, flexWrap: "wrap" }}>
          {pills.map((p) => (
            <div
              key={p}
              style={{
                fontSize: 24,
                padding: "10px 24px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
