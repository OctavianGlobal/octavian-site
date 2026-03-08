"use client";

import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";
import { TIER_PERMISSIONS } from "@/lib/tiers";
import type { SubscriptionTier, SignalPublic } from "@/types/supabase";

const DOMAIN_COLORS: Record<string, string> = {
  POWER: "power",
  MONEY: "money",
  RULES: "rules",
  TECHNOLOGY: "tech",
  ENVIRONMENT: "env",
};

const TIERS: SubscriptionTier[] = [
  "free",
  "signal_watch",
  "signal_plus",
  "analyst",
  "analyst_pro",
  "institutional",
  "private_briefing",
];

interface DashboardClientProps {
  isEditor: boolean
  isAdmin: boolean
  signals: SignalPublic[]
  tier: SubscriptionTier
}

export default function DashboardClient({ isEditor, isAdmin, signals, tier }: DashboardClientProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [previewTier, setPreviewTier] = useState<SubscriptionTier>(tier);

  const perms = TIER_PERMISSIONS[previewTier];

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function handlePublishSelected() {
    if (selected.size === 0) return;
    alert(`Pushing ${selected.size} signal(s) to review queue.`);
  }

  return (
    <>
      {/* ── Top bar ── */}
      <div style={{ background: "var(--black)", padding: "14px 0", borderBottom: "1px solid #222", marginTop: "62px" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <span style={{ color: "rgba(212,175,55,0.6)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Analyst Dashboard
          </span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "0.08em" }}>
              PREVIEW AS:
            </span>
            <select
              value={previewTier}
              onChange={(e) => setPreviewTier(e.target.value as SubscriptionTier)}
              style={{
                background: "#111",
                border: "1px solid #333",
                color: "var(--gold)",
                fontSize: "11px",
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ").toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Permissions bar ── */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "8px 0" }}>
        <div className="container" style={{ display: "flex", gap: "20px", fontSize: "11px" }}>
          <span style={{ color: perms.canViewScores ? "#4caf50" : "#555" }}>{perms.canViewScores ? "✓" : "✗"} Scores</span>
          <span style={{ color: perms.canViewConfidence ? "#4caf50" : "#555" }}>{perms.canViewConfidence ? "✓" : "✗"} Confidence</span>
          <span style={{ color: perms.canSearchArchive ? "#4caf50" : "#555" }}>{perms.canSearchArchive ? "✓" : "✗"} Archive</span>
          <span style={{ color: perms.canAccessAPI ? "#4caf50" : "#555" }}>{perms.canAccessAPI ? "✓" : "✗"} API</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>
            Archive: {perms.archiveDaysBack === "unlimited" ? "Unlimited" : `${perms.archiveDaysBack} days`}
          </span>
        </div>
      </div>

      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-title">Navigation</div>
          <Link href="/dashboard" className="dash-nav-link active">Signal Queue</Link>
          <Link href="/dashboard/published" className="dash-nav-link">Published Briefs</Link>
          <Link href="/dashboard/archive" className="dash-nav-link">Archive</Link>

          {isAdmin && (
            <div style={{ marginTop: "32px" }}>
              <div className="dash-sidebar-title">Admin</div>
              <Link href="/dashboard/sources" className="dash-nav-link">Sources</Link>
              <Link href="/dashboard/users" className="dash-nav-link">Users</Link>
            </div>
          )}
        </aside>

        <main className="dash-main">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Signal Queue</h1>
              <p className="dash-subtitle">
                {signals.length} candidate signals · Select up to 5 to push to review
              </p>
            </div>
            {isEditor && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {selected.size > 0 && (
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>{selected.size} selected</span>
                )}
                <button
                  className="btn-gold"
                  onClick={handlePublishSelected}
                  disabled={selected.size === 0}
                  style={{ opacity: selected.size === 0 ? 0.4 : 1 }}
                >
                  Push to Review →
                </button>
              </div>
            )}
          </div>

          {signals.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
              No signals in the queue.
            </div>
          ) : (
            signals.map((sig) => (
              <div
                key={sig.id}
                className={`queue-row${selected.has(sig.id) ? " selected" : ""}`}
                style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
              >
                {isEditor && (
                  <input
                    type="checkbox"
                    checked={selected.has(sig.id)}
                    onChange={() => toggleSelect(sig.id)}
                    style={{ marginTop: "4px", accentColor: "var(--gold)", cursor: "pointer", flexShrink: 0, width: "auto" }}
                    disabled={!selected.has(sig.id) && selected.size >= 5}
                  />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="queue-title">{sig.title}</div>
                  <div className="meta" style={{ margin: "4px 0 8px" }}>
                    <span className="meta-item">{sig.published_at?.slice(0, 10)}</span>
                    <span className="meta-dot" />
                    <span className={`tag-pill ${DOMAIN_COLORS[sig.domain] ?? ""}`}>{sig.domain}</span>
                    {perms.canViewConfidence && sig.confidence !== null && (
                      <span className="meta-item" style={{ color: "var(--muted)" }}>
                        AI conf: {Math.round(sig.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  {expanded === sig.id && perms.canViewScores && (
                    <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--muted)" }}>
                      {sig.summary}
                    </div>
                  )}

                  {perms.canViewScores && (
                    <button
                      onClick={() => toggleExpand(sig.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--muted)",
                        fontSize: "11px",
                        letterSpacing: "0.08em",
                        cursor: "pointer",
                        marginTop: "10px",
                        padding: 0,
                        textTransform: "uppercase",
                      }}
                    >
                      {expanded === sig.id ? "▲ Less" : "▼ Summary"}
                    </button>
                  )}
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, width: "110px" }}>
                  {perms.canViewScores ? (
                    <>
                      <div className="queue-score">{sig.score !== null ? Math.round(sig.score * 100) : "—"}</div>
                      <div className="queue-score-label">Signal Score</div>
                    </>
                  ) : (
                    <>
                      <div style={{ color: "#444", fontSize: "22px", fontWeight: "bold" }}>—</div>
                      <div style={{ fontSize: "11px" }}>
                        <Link href="/upgrade" style={{ color: "var(--gold)" }}>Upgrade to view</Link>
                      </div>
                    </>
                  )}
                  {isEditor && (
                    <Link
                      href={`/dashboard/review/${sig.id}`}
                      className="btn-light"
                      style={{ marginTop: "10px", fontSize: "12px", padding: "8px 12px", display: "inline-block" }}
                    >
                      Edit & Publish
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}