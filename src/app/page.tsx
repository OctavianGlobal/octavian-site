import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Octavian Global — Strategic Intelligence",
  description: "Strategic intelligence briefs focused on pattern recognition and risk analysis. Launching soon.",
};

export default function HomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#000000",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
      textAlign: "center",
    }}>
      <Image
        src="/assets/octavian-logo.svg"
        alt="Octavian Global"
        width={280}
        height={280}
        priority
        style={{ marginBottom: "32px" }}
      />

      <div style={{
        fontFamily: "Cinzel, serif",
        fontSize: "clamp(13px, 2vw, 16px)",
        letterSpacing: "0.32em",
        color: "rgba(212,175,55,0.6)",
        textTransform: "uppercase",
        marginBottom: "32px",
      }}>
        Strategic Intelligence · Pattern Recognition · Risk Analysis
      </div>

      <div style={{
        width: "48px",
        height: "1px",
        background: "rgba(212,175,55,0.35)",
        marginBottom: "32px",
      }} />

      <p style={{
        fontFamily: "Cinzel, serif",
        fontSize: "clamp(13px, 1.8vw, 15px)",
        letterSpacing: "0.22em",
        color: "rgba(255,255,255,0.45)",
        textTransform: "uppercase",
        margin: 0,
      }}>
        Launching Soon
      </p>
    </div>
  );
}
