import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Octavian Global",
  description: "About Octavian Global strategic intelligence.",
};

export default function AboutPage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="About" />

      <main id="main" className="page">
        <section className="section container" style={{ maxWidth: "720px", margin: "0 auto" }}>

          <h1 style={{
            fontFamily: "Cinzel, Georgia, serif",
            fontSize: "clamp(20px, 3vw, 30px)",
            letterSpacing: "0.04em",
            color: "#1a1a1a",
            lineHeight: 1.3,
            marginBottom: "32px",
            fontWeight: 700,
          }}>
            About Octavian Global
          </h1>

          <div style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: "16px", lineHeight: 1.8, color: "#2a2a2a" }}>

            <p style={{ marginBottom: "24px" }}>
              Octavian Global publishes structured intelligence briefs focused on early signals, cross-domain patterns,
              and strategic risk. The objective is clarity: what is changing, why it matters, and what to watch next.
            </p>

            <p style={{ marginBottom: "24px", fontWeight: 700, fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#1a1a1a" }}>
              Positioning
            </p>
            <p style={{ marginBottom: "24px" }}>
              This is not a general news site. Briefs are written as analytic memos — compact, sourced, and structured.
              The goal is to identify emerging patterns before narratives harden and before institutions are forced into
              reactive posture.
            </p>

            <p style={{ marginBottom: "24px", fontWeight: 700, fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#1a1a1a" }}>
              Domains
            </p>
            <p style={{ marginBottom: "12px" }}>Coverage is intentionally limited to areas where structural signals can be measured and compared over time:</p>
            {["Geopolitics and statecraft", "Technology systems and infrastructure", "Economic structure and industrial policy", "Institutional risk and regulatory shifts"].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
                <span style={{ color: "#999", flexShrink: 0 }}>—</span>
                <span>{item}</span>
              </div>
            ))}

            <p style={{ marginBottom: "24px", marginTop: "24px", fontWeight: 700, fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#1a1a1a" }}>
              Editorial Standard
            </p>
            <p style={{ marginBottom: "24px" }}>
              Each brief is readable in under two minutes, with a clear signal, strategic implications, and an explicit
              watch list. Over time, the archive becomes a signal library.
            </p>

            <p style={{ marginBottom: "24px", fontWeight: 700, fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#1a1a1a" }}>
              Contact
            </p>
            <p>
              For private briefings, partnerships, or methodology questions, use the{" "}
              <Link href="/contact" style={{ color: "#1a1a1a", textDecoration: "underline" }}>contact page</Link>.
            </p>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}