import Link from "next/link";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intelligence Tiers — Octavian Global",
  description: "Choose your level of access to Octavian Global's strategic intelligence platform.",
};

const TIERS = [
  {
    name: "Signal",
    role: "The Monitor",
    tagline: "The Pulse",
    price: 29,
    priceLabel: "$29",
    period: "per month",
    recommended: false,
    comingSoon: true,
    color: "#2980b9",
    features: [
      "Everything in Free",
      "Domain Gauges on all briefs",
      "Power · Money · Rules scoring",
      "Signal domain classification",
    ],
    cta: "Notify Me",
    ctaHref: "/login",
  },
  {
    name: "Signal Plus",
    role: "The Strategist",
    tagline: "The Precision",
    price: 79,
    priceLabel: "$79",
    period: "per month",
    recommended: true,
    comingSoon: true,
    color: "#D4AF37",
    features: [
      "Everything in Signal",
      "Numerical Signal Scores (0–100)",
      "AI Confidence percentages",
      "Full scoring transparency",
      "Priority brief access",
    ],
    cta: "Notify Me",
    ctaHref: "/login",
  },
  {
    name: "Analyst",
    role: "The Institution",
    tagline: "The Library",
    price: 199,
    priceLabel: "$199",
    period: "per month",
    recommended: false,
    comingSoon: true,
    color: "#8e44ad",
    features: [
      "Everything in Signal Plus",
      "Unlimited signal archive (50k+)",
      "Archive search & filtering",
      "3D Globe visualization — Coming Soon",
      "Institutional-grade access",
    ],
    cta: "Notify Me",
    ctaHref: "/login",
  },
];

export default function TiersPage() {
  return (
    <>
      <div style={{ background: "#0a0a0a", paddingTop: "82px", paddingBottom: "28px", textAlign: "center", borderBottom: "1px solid #1a1a1a" }}>
        <div className="container">
          <Link href="/home" style={{ display: "inline-block", marginBottom: "10px" }}>
            <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 2L44 10V28C44 40 34 50 24 54C14 50 4 40 4 28V10L24 2Z" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
              <path d="M24 12L36 17V28C36 35.5 30.5 42 24 44.5C17.5 42 12 35.5 12 28V17L24 12Z" fill="#D4AF37" fillOpacity="0.08" stroke="#D4AF37" strokeWidth="0.75" />
            </svg>
          </Link>
        </div>
      </div>

      <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
        <div className="container" style={{ padding: "64px 0" }}>

          {/* ── Header ── */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
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

          {/* ── Free tier — text treatment ── */}
          <div style={{
            textAlign: "center", marginBottom: "48px",
            padding: "20px 24px",
            background: "#f9f9f9",
            border: "1px solid var(--line)",
            borderRadius: "10px",
            maxWidth: "560px",
            margin: "0 auto 48px",
          }}>
            <div style={{
              fontFamily: "Cinzel, serif", fontSize: "11px", letterSpacing: "0.18em",
              textTransform: "uppercase", color: "rgba(0,0,0,0.35)", marginBottom: "8px",
            }}>
              The Public · Free Forever
            </div>
            <p style={{
              fontSize: "14px", color: "#444", fontFamily: "var(--font-jakarta), sans-serif",
              lineHeight: 1.6, margin: "0 0 14px",
            }}>
              Full access to all published intelligence briefs. No credit card required.
            </p>
            <Link href="/login" style={{
              display: "inline-block", padding: "10px 24px",
              background: "var(--black)", color: "var(--gold)",
              fontFamily: "Cinzel, serif", fontSize: "11px",
              letterSpacing: "0.14em", textTransform: "uppercase",
              textDecoration: "none", borderRadius: "6px",
              border: "1px solid rgba(212,175,55,0.3)",
            }}>
              Start Reading — Free →
            </Link>
          </div>

          {/* ── Coming Soon banner ── */}
          <div style={{
            textAlign: "center", marginBottom: "40px",
          }}>
            <span style={{
              display: "inline-block",
              background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.3)",
              color: "#D4AF37",
              fontFamily: "Cinzel, serif",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              padding: "6px 20px",
              borderRadius: "20px",
            }}>
              ⚡ Paid Tiers — Coming Soon
            </span>
          </div>

          {/* ── Paid tier cards — 3 in a row ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            alignItems: "start",
            marginBottom: "64px",
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
                  opacity: 0.9,
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

                {/* Coming Soon badge */}
                <div style={{
                  position: "absolute", top: tier.recommended ? "20px" : "16px", right: "16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: tier.recommended ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: "9px", letterSpacing: "0.12em",
                  textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px",
                  ...(tier.recommended ? {} : { background: "#f5f5f5", border: "1px solid #e0e0e0" }),
                }}>
                  Coming Soon
                </div>

                {/* Tier header */}
                <div style={{ marginBottom: "20px", paddingRight: "60px" }}>
                  <div style={{
                    fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase",
                    color: tier.color, fontFamily: "Cinzel, serif", marginBottom: "6px", fontWeight: 600,
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
                    fontSize: "13px",
                    color: tier.recommended ? "rgba(255,255,255,0.5)" : "var(--muted)",
                    fontFamily: "var(--font-jakarta), sans-serif",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>
                    {tier.tagline}
                  </div>
                </div>

                {/* Price */}
                <div style={{
                  marginBottom: "28px", paddingBottom: "24px",
                  borderBottom: `1px solid ${tier.recommended ? "#2a2a2a" : "var(--line)"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{
                      fontFamily: "Cinzel, serif", fontSize: "42px", fontWeight: 600,
                      color: tier.recommended ? tier.color : "var(--ink)", lineHeight: 1,
                    }}>
                      {tier.priceLabel}
                    </span>
                    <span style={{
                      fontSize: "13px",
                      color: tier.recommended ? "rgba(255,255,255,0.4)" : "var(--muted)",
                      fontFamily: "var(--font-jakarta), sans-serif",
                    }}>
                      {tier.period}
                    </span>
                  </div>
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
                        color: feature.startsWith("Everything") ? "var(--muted)" : tier.color,
                        fontSize: "14px", flexShrink: 0, marginTop: "1px",
                        opacity: feature.startsWith("Everything") ? 0.5 : 1,
                      }}>
                        {feature.startsWith("Everything") ? "↳" : "✓"}
                      </span>
                      <span style={{
                        opacity: feature.startsWith("Everything") ? 0.5 : 1,
                        fontStyle: feature.includes("Coming Soon") ? "italic" : "normal",
                        color: feature.includes("Coming Soon")
                          ? (tier.recommended ? "rgba(255,255,255,0.35)" : "#aaa")
                          : "inherit",
                      }}>
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
                    ...(tier.recommended ? {
                      background: tier.color, color: "#000",
                      border: `1px solid ${tier.color}`, fontWeight: 700,
                    } : {
                      background: "transparent",
                      color: tier.color,
                      border: `1px solid ${tier.color}33`,
                    }),
                  }}
                >
                  {tier.cta} →
                </Link>
              </div>
            ))}
          </div>

          {/* ── Feature comparison table ── */}
          <div style={{ marginBottom: "64px" }}>
            <h2 style={{
              fontFamily: "Cinzel, serif", fontSize: "22px", fontWeight: 600,
              letterSpacing: "0.06em", color: "var(--ink)", textAlign: "center",
              margin: "0 0 32px",
            }}>
              Full Feature Comparison
            </h2>

            <div style={{ border: "1px solid var(--line)", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-jakarta), sans-serif", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#0a0a0a" }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, width: "35%" }}>
                      Feature
                    </th>
                    {["Free", "Signal", "Signal Plus", "Analyst"].map((name, j) => (
                      <th key={name} style={{
                        padding: "14px 16px", textAlign: "center",
                        color: name === "Signal Plus" ? "#D4AF37" : "rgba(255,255,255,0.6)",
                        fontSize: "12px", letterSpacing: "0.10em",
                        textTransform: "uppercase", fontWeight: 600,
                        fontFamily: "Cinzel, serif",
                        borderLeft: "1px solid #1a1a1a",
                        background: name === "Signal Plus" ? "rgba(212,175,55,0.05)" : "transparent",
                      }}>
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Published Briefs",               values: ["Full text", "Full text", "Full text", "Full text"] },
                    { feature: "Domain Gauges (Power/Money/Rules)", values: ["—", "✓", "✓", "✓"] },
                    { feature: "Numerical Signal Score",          values: ["—", "—", "✓", "✓"] },
                    { feature: "AI Confidence %",                 values: ["—", "—", "✓", "✓"] },
                    { feature: "Signal Archive Access",           values: ["—", "—", "—", "Unlimited"] },
                    { feature: "Archive Search & Filter",         values: ["—", "—", "—", "✓"] },
                    { feature: "3D Globe Visualization",          values: ["—", "—", "—", "Coming Soon"] },
                    { feature: "Monthly Price",                   values: ["$0", "$29 ✦", "$79 ✦", "$199 ✦"] },
                  ].map((row, i) => (
                    <tr key={row.feature} style={{ borderTop: "1px solid var(--line)", background: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                      <td style={{ padding: "12px 20px", color: "#333", fontWeight: 500 }}>{row.feature}</td>
                      {row.values.map((val, j) => (
                        <td key={j} style={{
                          padding: "12px 16px", textAlign: "center",
                          borderLeft: "1px solid var(--line)",
                          color: val === "—" ? "#ccc"
                            : val === "✓" ? "#22c55e"
                            : val.includes("Coming Soon") ? "#aaa"
                            : val.includes("✦") ? "#888"
                            : "#1a1a1a",
                          fontWeight: val === "✓" ? 700 : 400,
                          fontStyle: val.includes("Coming Soon") ? "italic" : "normal",
                          background: j === 2 ? "rgba(212,175,55,0.03)" : "transparent",
                          fontSize: val.includes("✦") ? "11px" : "13px",
                        }}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: "center", marginTop: "12px", fontSize: "11px", color: "#aaa", fontFamily: "var(--font-jakarta), sans-serif" }}>
              ✦ Paid tiers launching soon — join the free tier now to be notified at launch
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div style={{
            textAlign: "center", padding: "48px",
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
              Every account starts with full access to Octavian's published intelligence briefs. Paid tiers are coming soon — create your free account now to be first in line.
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