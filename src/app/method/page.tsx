import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Method — Octavian Global",
  description: "How Octavian Global detects, scores, and publishes intelligence briefs.",
};

export default function MethodPage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Intelligence Standard" />

      <main id="main" className="page">
        <section className="section container" style={{ maxWidth: "720px", margin: "0 auto" }}>

<h1 style={{
  fontFamily: "Cinzel, Georgia, serif",
  fontSize: "clamp(20px, 3vw, 30px)",
  letterSpacing: "0.04em",
  color: "#1a1a1a",
  lineHeight: 1.3,
  marginBottom: "8px",
  fontWeight: 700,
}}>
  Method
</h1>


          <div style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: "16px", lineHeight: 1.8, color: "#2a2a2a" }}>

            <p style={{ marginBottom: "24px" }}>
              Octavian Global briefs are built from structured inputs, explicit scoring, and repeatable pattern checks.
              The goal is not volume — it is signal clarity: what is changing, how fast, and what it implies next.
            </p>

            {[
              {
                heading: "Principles",
                items: [
                  "Structured over narrative — each brief uses consistent sections and explicit indicators.",
                  "Cross-domain validation — signals are checked across independent source types.",
                  "Measured uncertainty — confidence is stated; unknowns are listed as open variables.",
                  "Archive continuity — briefs build a compounding signal library over time.",
                ]
              },
              {
                heading: "Signal Detection",
                body: "Events, datasets, and authoritative reporting are ingested continuously. Each item is normalized by timestamp, region, actor, category, and source reliability tier. Items are tagged with actors, topics, and relevance domain.",
              },
              {
                heading: "Scoring",
                items: [
                  "Impact — potential magnitude if the signal persists.",
                  "Evidence — source quality and cross-source agreement.",
                  "Novelty — deviation from historical baseline patterns.",
                  "Anomaly — frequency and severity outliers.",
                ]
              },
              {
                heading: "Pattern Recognition",
                body: "Scored signals are checked against 7-day, 30-day, and 365-day rolling baselines. The key output is not the event itself, but whether it is an outlier relative to prior behavior — frequency spikes, new actor involvement, new geography, or new policy instruments.",
              },
              {
                heading: "Brief Format",
                items: [
                  "Signal — what happened, factual and direct.",
                  "Why It Matters — three strategic implications.",
                  "Watch — three specific, observable indicators.",
                  "Sources — primary source attribution.",
                ]
              },
              {
                heading: "Source Reliability",
                items: [
                  "Tier 1 — official releases, primary datasets, direct transcripts.",
                  "Tier 2 — major reputable outlets and specialist journals.",
                  "Tier 3 — single-source claims, commentary (lead indicators only).",
                ]
              },
            ].map((section, i) => (
              <div key={i} style={{ marginBottom: "32px" }}>
                <p style={{ marginBottom: "14px", fontWeight: 700, fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#1a1a1a" }}>
                  {section.heading}
                </p>
                {section.body && (
                  <p style={{ marginBottom: "12px" }}>{section.body}</p>
                )}
                {section.items && section.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
                    <span style={{ color: "#999", flexShrink: 0 }}>—</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ))}

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}