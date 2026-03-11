import { requireAuth, getProfile } from "@/lib/auth";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import SettingsClient from "./SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — Octavian Global",
  description: "Account settings.",
};

export const dynamic = "force-dynamic";

function formatTier(tier: string) {
  switch (tier) {
    case "free": return "Free";
    case "signal": return "Signal";
    case "signal_plus": return "Signal Plus";
    case "analyst": return "Analyst";
    case "editor": return "Editor";
    default: return tier;
  }
}

export default async function SettingsPage() {
  await requireAuth();
  const profile = await getProfile();
  if (!profile) return null;

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Settings" />

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
            Account Settings
          </h1>

          {/* Account info */}
          <div style={{
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            paddingBottom: "32px",
            marginBottom: "32px",
          }}>
            <p style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: "13px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#1a1a1a",
              fontWeight: 700,
              marginBottom: "20px",
            }}>
              Account
            </p>

            <div style={{ display: "grid", gap: "14px", fontFamily: "var(--font-jakarta), sans-serif" }}>
              <div style={{ display: "flex", gap: "24px", alignItems: "baseline" }}>
                <span style={{ fontSize: "13px", color: "#888", width: "120px", flexShrink: 0 }}>Tier</span>
                <span style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  {formatTier(profile.subscription_tier ?? "free")}
                </span>
              </div>

              <div style={{ display: "flex", gap: "24px", alignItems: "baseline" }}>
                <span style={{ fontSize: "13px", color: "#888", width: "120px", flexShrink: 0 }}>Status</span>
                <span style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: profile.subscription_status === "active" ? "#1a6e3c" : "#888",
                }}>
                  {profile.subscription_status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "24px", alignItems: "baseline" }}>
                <span style={{ fontSize: "13px", color: "#888", width: "120px", flexShrink: 0 }}>Member Since</span>
                <span style={{ fontSize: "13px", color: "#1a1a1a" }}>
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric"
                      })
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Display name — client component for interactivity */}
          <SettingsClient displayName={profile.display_name ?? ""} />

        </section>
      </main>

      <Footer />
    </>
  );
}