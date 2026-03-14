import Link from "next/link";
import Footer from "@/components/Footer";
import Masthead from "@/components/Masthead";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intelligence Tiers — Octavian Global",
  description: "Choose your level of access to Octavian Global's strategic intelligence platform.",
};

const TIERS = [
  {
    name: "Free",
    role: "The Public",
    tagline: "Brand & Proof",
    price: 0,
    priceLabel: "$0",
    period: "forever",
    recommended: false,
    color: "#555555",
    features: [
      "Full text of all published briefs",
      "Access to public intelligence feed",
      "No signal scores",
      "No archive access",
    ],
    cta: "Start Reading",
    ctaHref: "/login",
    ctaStyle: "light",
  },
  {
    name: "Signal",
    role: "The Monitor",
    tagline: "The Pulse",
    price: 29,
    priceLabel: "$29",
    period: "per month",
    recommended: false,
    color: "#2980b9",
    features: [
      "Everything in Free",
      "Domain Gauges on all briefs",
      "Power · Money · Rules scoring",
      "Signal domain classification",
      "No numerical scores",
    ],
    cta: "Get the Pulse",
    ctaHref: "/login",
    ctaStyle: "light",
  },
  {
    name: "Signal Plus",
    role: "The Strategist",
    tagline: "The Precision",
    price: 79,
    priceLabel: "$79",
    period: "per month",
    recommended: true,
    color: "#D4AF37",
    features: [
      "Everything in Signal",
      "Numerical Signal Scores (0–100)",
      "AI Confidence percentages",
      "Full scoring transparency",
      "Priority brief access",
    ],
    cta: "Get Precision",
    ctaHref: "/login",
    ctaStyle: "gold",
  },
  {
    name: "Analyst",
    role: "The Institution",
    tagline: "The Library",
    price: 199,
    priceLabel: "$199",
    period: "per month",
    recommended: false,
    color: "#8e44ad",
    features: [
      "Everything in Signal Plus",
      "Unlimited signal archive (50k+)",
      "Archive search & filtering",
      "3D Globe visualization",
      "Institutional-grade access",
    ],
    cta: "Get the Library",
    ctaHref: "/login",
    ctaStyle: "light",
  },
];

export default function TiersPage() {
  return (
    <>
      <Masthead tagline="Intelligence Access Tiers" />

      <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
        <div className="container" style={{ padding: "64px 0" }}>

          {/* ── Header ── */}
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h1 style={{
              fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 600, letterSpacing: "0.06em", color: "var(--ink)",
              margin: "0 0 16px",
            }}>
              Choose Your Level of Access
            </h1>
            <p style={{
              fontSize: "16px", color: "var(--muted)", maxWidth: "560px",
              margin: "0 auto", lineHeight: 1.7, fontFamily: "var(--font-jakarta), sans-serif",
            }}>
              Octavian Global operates on a signal intelligence framework. Each tier unlocks a deeper layer of the platform — from public briefs to the full analytical engine.
            </p>
          </div>

          {/* ── Tier cards ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
            alignItems: "start",
          }}>
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                style={{
                  background: tier.recommended ? "#0a0a0a" : "#ffffff",
                  border: tier.recommended ? `2px solid ${tier.color}` : "1px solid var(--line)",
                  borderRadius: "14px",
                  padding: "32px 28px",
                  position: "relative",
                  boxShadow: tier.recommended ? `0 8px 40px rgba(212,175,55,0.15)` : "var(--shadow)",
                  transform: tier.recommended ? "translateY(-8px)" : "none",
                }}
              >
                {/* Recommended badge */}
                {tier.recommended && (
                  <div style={{
                    position: "absolute", top: "-14px", left: "50%",
                    transform: "translateX(-50%)",
                    background: tier.color, color: "#000",
                    fontFamily: "Cinzel, serif", fontSize: "10px",
                    letterSpacing: "0.18em", fontWeight: 700,
                    padding: "4px 16px", borderRadius: "20px",
                    whiteSpace: "nowrap",
                  }}>
                    RECOMMENDED
                  </div>
                )}

                {/* Tier header */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{
                    fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase",
                    color: tier.color, fontFamily: "Cinzel, serif", marginBottom: "6px",
                    fontWeight: 600,
                  }}>
                    {tier.role}
                  </div>
                  <h2 style={{
                    fontFamily: "Cinzel, serif", fontSize: "22px", fontWeight: 600,
                    color: tier.recommended ? "#ffffff" : "var(--ink)",
                    margin: "0 0 4px", letterSpacing: "0.06em",
                  }}>
                    {tier.name}
                  </h2>
                  <div style={{
                    fontSize: "13px", color: tier.recommended ? "rgba(255,255,255,0.5)" : "var(--muted)",
                    fontFamily: "var(--font-jakarta), sans-serif", letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>
                    {tier.tagline}
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: "28px", paddingBottom: "24px", borderBottom: `1px solid ${tier.recommended ? "#2a2a2a" : "var(--line)"}` }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{
                      fontFamily: "Cinzel, serif", fontSize: "42px", fontWeight: 600,
                      color: tier.recommended ? tier.color : "var(--ink)", lineHeight: 1,
                    }}>
                      {tier.priceLabel}
                    </span>
                    {tier.price > 0 && (
                      <span style={{
                        fontSize: "13px", color: tier.recommended ? "rgba(255,255,255,0.4)" : "var(--muted)",
                        fontFamily: "var(--font-jakarta), sans-serif",
                      }}>
                        {tier.period}
                      </span>
                    )}
                  </div>
                  {tier.price === 0 && (
                    <div style={{
                      fontSize: "12px", color: tier.recommended ? "rgba(255,255,255,0.4)" : "var(--muted)",
                      fontFamily: "var(--font-jakarta), sans-serif", marginTop: "4px",
                    }}>
                      No credit card required
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
                  {tier.features.map((feature, i) => (
                    <li key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: "10px",
                      marginBottom: "10px", fontSize: "13px",
                      fontFamily: "var(--font-jakarta), sans-serif",
                      color: tier.recommended ? "rgba(255,255,255,0.75)" : "#333",
                    }}>
                      <span style={{
                        color: i === 0 && tier.name !== "Free" ? "var(--muted)" : tier.color,
                        fontSize: "14px", flexShrink: 0, marginTop: "1px",
                        opacity: feature.startsWith("Everything") ? 0.5 : 1,
                      }}>
                        {feature.startsWith("Everything") ? "↳" : "✓"}
                      </span>
                      <span style={{ opacity: feature.startsWith("Everything") ? 0.5 : 1 }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tier.ctaHref}
                  style={{
                    display: "block", textAlign: "center",
                    padding: "12px 20px", borderRadius: "8px",
                    fontFamily: "Cinzel, serif", fontSize: "12px",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    textDecoration: "none", transition: "opacity 0.15s",
                    ...(tier.ctaStyle === "gold" ? {
                      background: tier.color, color: "#000",
                      border: `1px solid ${tier.color}`, fontWeight: 700,
                    } : tier.recommended ? {
                      background: "transparent", color: tier.color,
                      border: `1px solid ${tier.color}`,
                    } : {
                      background: "var(--black)", color: "var(--gold)",
                      border: "1px solid rgba(212,175,55,0.3)",
                    }),
                  }}
                >
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>

          {/* ── Feature comparison ── */}
          <div style={{ marginTop: "80px" }}>
            <h2 style={{
              fontFamily: "Cinzel, serif", fontSize: "24px", fontWeight: 600,
              letterSpacing: "0.06em", color: "var(--ink)", textAlign: "center",
              margin: "0 0 40px",
            }}>
              Full Feature Comparison
            </h2>

            <div style={{ border: "1px solid var(--line)", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-jakarta), sans-serif", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#0a0a0a" }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, width: "30%" }}>
                      Feature
                    </th>
                    {TIERS.map((tier) => (
                      <th key={tier.name} style={{
                        padding: "14px 16px", textAlign: "center",
                        color: tier.recommended ? tier.color : "rgba(255,255,255,0.6)",
                        fontSize: "12px", letterSpacing: "0.10em",
                        textTransform: "uppercase", fontWeight: 600,
                        fontFamily: "Cinzel, serif",
                        borderLeft: "1px solid #1a1a1a",
                        background: tier.recommended ? "rgba(212,175,55,0.05)" : "transparent",
                      }}>
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: "Published Briefs",
                      values: ["Full text", "Full text", "Full text", "Full text"],
                    },
                    {
                      feature: "Domain Gauges (Power/Money/Rules)",
                      values: ["—", "✓", "✓", "✓"],
                    },
                    {
                      feature: "Numerical Signal Score",
                      values: ["—", "—", "✓", "✓"],
                    },
                    {
                      feature: "AI Confidence %",
                      values: ["—", "—", "✓", "✓"],
                    },
                    {
                      feature: "Signal Archive Access",
                      values: ["—", "—", "—", "Unlimited"],
                    },
                    {
                      feature: "Archive Search & Filter",
                      values: ["—", "—", "—", "✓"],
                    },
                    {
                      feature: "3D Globe Visualization",
                      values: ["—", "—", "—", "✓"],
                    },
                    {
                      feature: "Monthly Price",
                      values: ["$0", "$29", "$79", "$199"],
                    },
                  ].map((row, i) => (
                    <tr key={row.feature} style={{ borderTop: "1px solid var(--line)", background: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                      <td style={{ padding: "12px 20px", color: "#333", fontWeight: 500 }}>{row.feature}</td>
                      {row.values.map((val, j) => (
                        <td key={j} style={{
                          padding: "12px 16px", textAlign: "center",
                          borderLeft: "1px solid var(--line)",
                          color: val === "—" ? "#ccc" : val === "✓" ? "#22c55e" : "#1a1a1a",
                          fontWeight: val === "✓" ? 700 : 400,
                          background: TIERS[j].recommended ? "rgba(212,175,55,0.03)" : "transparent",
                        }}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div style={{
            textAlign: "center", marginTop: "64px", padding: "48px",
            background: "#0a0a0a", borderRadius: "14px",
            border: "1px solid rgba(212,175,55,0.15)",
          }}>
            <h2 style={{
              fontFamily: "Cinzel, serif", fontSize: "28px", fontWeight: 600,
              color: "#D4AF37", letterSpacing: "0.08em", margin: "0 0 12px",
            }}>
              Start with Free. Upgrade when ready.
            </h2>
            <p style={{
              fontSize: "15px", color: "rgba(255,255,255,0.55)",
              fontFamily: "var(--font-jakarta), sans-serif",
              maxWidth: "480px", margin: "0 auto 28px", lineHeight: 1.7,
            }}>
              Every tier starts with access to Octavian's published intelligence briefs. No credit card required for the free tier.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/login" style={{
                display: "inline-block", padding: "14px 32px",
                background: "#D4AF37", color: "#000",
                fontFamily: "Cinzel, serif", fontSize: "12px",
                letterSpacing: "0.14em", textTransform: "uppercase",
                textDecoration: "none", borderRadius: "8px", fontWeight: 700,
              }}>
                Create Free Account →
              </Link>
              <Link href="/briefs" style={{
                display: "inline-block", padding: "14px 32px",
                background: "transparent", color: "rgba(255,255,255,0.6)",
                fontFamily: "Cinzel, serif", fontSize: "12px",
                letterSpacing: "0.14em", textTransform: "uppercase",
                textDecoration: "none", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
                Browse Briefs First
              </Link>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}