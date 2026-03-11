import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Octavian Global",
  description: "Strategic intelligence. Coming soon.",
};

export default function ComingSoonPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      padding: "40px 24px",
    }}>

      {/* Shield mark */}
      <div style={{ marginBottom: "32px" }}>
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M24 2L44 10V28C44 40 34 50 24 54C14 50 4 40 4 28V10L24 2Z"
            stroke="#D4AF37"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M24 12L36 17V28C36 35.5 30.5 42 24 44.5C17.5 42 12 35.5 12 28V17L24 12Z"
            fill="#D4AF37"
            fillOpacity="0.08"
            stroke="#D4AF37"
            strokeWidth="0.75"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div style={{
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "clamp(18px, 4vw, 28px)",
        letterSpacing: "0.28em",
        color: "#D4AF37",
        marginBottom: "10px",
        textAlign: "center",
      }}>
        OCTAVIAN GLOBAL
      </div>

      {/* Tagline */}
      <div style={{
        fontFamily: "Georgia, serif",
        fontSize: "clamp(12px, 2vw, 14px)",
        letterSpacing: "0.18em",
        color: "rgba(255,255,255,0.65)",
        textTransform: "uppercase",
        marginBottom: "64px",
        textAlign: "center",
      }}>
        Strategic Intelligence
      </div>

      {/* Coming soon text */}
      <div style={{
        fontFamily: "Georgia, serif",
        fontSize: "clamp(13px, 2vw, 15px)",
        color: "rgba(255,255,255,0.85)",
        letterSpacing: "0.08em",
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "1.8",
      }}>
        A new intelligence platform is being prepared. Access by invitation only.
      </div>

      {/* Hidden link — bright enough to click, invisible against background */}
      <Link
        href="/home"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "28px",
          color: "#111111",
          background: "#0a0a0a",
          fontSize: "18px",
          textDecoration: "none",
          userSelect: "none",
          padding: "10px",
          lineHeight: 1,
          display: "block",
          width: "32px",
          height: "32px",
        }}
        aria-hidden="true"
        tabIndex={-1}
      >
        ·
      </Link>

    </main>
  );
}