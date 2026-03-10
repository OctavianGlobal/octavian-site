"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { TIER_PERMISSIONS } from "@/lib/tiers";
import type { SubscriptionTier, DashboardSignal, SignalDomain } from "@/types/supabase";
import PipelineHealth from "@/components/PipelineHealth";

const DOMAIN_COLORS: Record<string, string> = {
  POWER: "power",
  MONEY: "money",
  RULES: "rules",
  ENVIRONMENT: "env",
  TECHNOLOGY: "tech",
};

const ALL_DOMAINS: SignalDomain[] = ["POWER", "MONEY", "RULES", "ENVIRONMENT", "TECHNOLOGY"];
const DOMAIN_FALLBACK: SignalDomain = "POWER";
const PAGE_SIZE = 25;
const QUICK_ARCHIVE_THRESHOLD = 0.50;

const TIERS: SubscriptionTier[] = [
  "free",
  "signal",
  "signal_plus",
  "analyst",
  "editor",
];

interface DashboardClientProps {
  isEditor: boolean;
  isAdmin: boolean;
  signals: DashboardSignal[];
  count: number;
  tier: SubscriptionTier;
  permissions: typeof TIER_PERMISSIONS[SubscriptionTier];
  page: number;
  domain: SignalDomain | null;
  sort: 'date' | 'score';
}

export default function DashboardClient({
  isEditor,
  isAdmin,
  signals,
  count,
  tier,
  permissions,
  page,
  domain,
  sort,
}: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [previewTier, setPreviewTier] = useState<SubscriptionTier>(tier);
  const [archiving, setArchiving] = useState<string | null>(null);

  const perms = TIER_PERMISSIONS[previewTier];
  const totalPages = Math.ceil(count / PAGE_SIZE);

  // ── URL param helpers ────────────────────────────────────────────────────

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`/dashboard?${params.toString()}`);
  }

  function handleDomainFilter(d: SignalDomain | null) {
    pushParams({ domain: d, page: null });
  }

  function handlePageChange(newPage: number) {
    pushParams({ page: newPage === 0 ? null : String(newPage) });
  }

  function handleSortToggle() {
    pushParams({ sort: sort === 'date' ? 'score' : 'date', page: null });
  }

  // ── Selection ────────────────────────────────────────────────────────────

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

  // ── Quick archive ────────────────────────────────────────────────────────

  async function handleQuickArchive(id: string) {
    setArchiving(id);
    try {
      const res = await fetch('/api/signals/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal_id: id }),
      });
      if (res.ok) {
        // Refresh the page to remove archived signal from queue
        router.refresh();
      } else {
        alert('Archive failed. Please try again.');
      }
    } catch {
      alert('Archive failed. Please try again.');
    } finally {
      setArchiving(null);
    }
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
                <option key={t} value={t}>
                  {t.replace(/_/g, " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Permissions bar ── */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "8px 0" }}>
        <div className="container" style={{ display: "flex", gap: "20px", fontSize: "11px" }}>
          <span style={{ color: perms.canViewDomainScores ? "#4caf50" : "#555" }}>
            {perms.canViewDomainScores ? "✓" : "✗"} Domain Scores
          </span>
          <span style={{ color: perms.canViewSignalScore ? "#4caf50" : "#555" }}>
            {perms.canViewSignalScore ? "✓" : "✗"} Signal Score
          </span>
          <span style={{ color: perms.canViewConfidence ? "#4caf50" : "#555" }}>
            {perms.canViewConfidence ? "✓" : "✗"} Confidence
          </span>
          <span style={{ color: perms.canSearchArchive ? "#4caf50" : "#555" }}>
            {perms.canSearchArchive ? "✓" : "✗"} Archive
          </span>
          <span style={{ color: perms.canEditAndPublish ? "#4caf50" : "#555" }}>
            {perms.canEditAndPublish ? "✓" : "✗"} Edit & Publish
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>
            Archive:{" "}
            {perms.archiveDaysBack === "unlimited"
              ? "Unlimited"
              : perms.archiveDaysBack === 0
              ? "None"
              : `${perms.archiveDaysBack} days`}
          </span>
        </div>
      </div>

      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-title">Navigation</div>
          <Link href="/dashboard" className="dash-nav-link active">
            Signal Queue
          </Link>
          <Link href="/dashboard/published" className="dash-nav-link">
            Published Briefs
          </Link>
          <Link href="/dashboard/archive" className="dash-nav-link">
            Archive
          </Link>

          {isAdmin && (
            <div style={{ marginTop: "32px" }}>
              <div className="dash-sidebar-title">Admin</div>
              <Link href="/dashboard/sources" className="dash-nav-link">
                Sources
              </Link>
              <Link href="/dashboard/users" className="dash-nav-link">
                Users
              </Link>
              <PipelineHealth />
            </div>
          )}
        </aside>

        <main className="dash-main">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Signal Queue</h1>
              <p className="dash-subtitle">
                {count} candidate signals
                {domain && ` · ${domain}`}
                {totalPages > 1 && ` · Page ${page + 1} of ${totalPages}`}
                {perms.canEditAndPublish && " · Select up to 5 to push to review"}
              </p>
            </div>
            {perms.canEditAndPublish && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {selected.size > 0 && (
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                    {selected.size} selected
                  </span>
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

          {/* ── Filters + sort ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            
            {/* Domain pills */}
            <button
              onClick={() => handleDomainFilter(null)}
              style={{
                background: domain === null ? "var(--gold)" : "#1a1a1a",
                color: domain === null ? "var(--black)" : "var(--muted)",
                border: "1px solid #333",
                borderRadius: "4px",
                fontSize: "11px",
                letterSpacing: "0.08em",
                padding: "4px 10px",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              All
            </button>
            {ALL_DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => handleDomainFilter(domain === d ? null : d)}
                className={`tag-pill ${DOMAIN_COLORS[d] ?? ""}`}
                style={{
                  cursor: "pointer",
                  opacity: domain && domain !== d ? 0.4 : 1,
                  border: domain === d ? "1px solid var(--gold)" : "1px solid transparent",
                }}
              >
                {d}
              </button>
            ))}

            <div style={{ flex: 1 }} />

            {/* Sort toggle — editor only */}
            {perms.canEditAndPublish && (
              <button
                onClick={handleSortToggle}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  color: "var(--gold)",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  padding: "4px 12px",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                Sort: {sort === 'score' ? '▼ Score' : '▼ Date'}
              </button>
            )}
          </div>

          {signals.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
              No signals in the queue.
            </div>
          ) : (
            signals.map((sig) => {
              const scoreDisplay =
                perms.canViewSignalScore && sig.score !== null
                  ? Math.round(sig.score * 100)
                  : null;

              const showQuickArchive =
                perms.canEditAndPublish &&
                sig.signal_score_raw !== null &&
                sig.signal_score_raw < QUICK_ARCHIVE_THRESHOLD;

              return (
                <div
                  key={sig.id}
                  className={`queue-row${selected.has(sig.id) ? " selected" : ""}`}
                  style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
                >
                  {perms.canEditAndPublish && (
                    <input
                      type="checkbox"
                      checked={selected.has(sig.id)}
                      onChange={() => toggleSelect(sig.id)}
                      style={{
                        marginTop: "4px",
                        accentColor: "var(--gold)",
                        cursor: "pointer",
                        flexShrink: 0,
                        width: "auto",
                      }}
                      disabled={!selected.has(sig.id) && selected.size >= 5}
                    />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="queue-title">
                      {sig.cluster_summary ?? "Untitled Signal"}
                    </div>
                    <div className="meta" style={{ margin: "4px 0 8px" }}>
                      <span className="meta-item">
                        {sig.created_at?.slice(0, 10) ?? "—"}
                      </span>
                      <span className="meta-dot" />
                      {(sig.domains_jsonb?.length
                        ? sig.domains_jsonb
                        : [sig.primary_domain ?? DOMAIN_FALLBACK]
                      ).map((d) => (
                        <span key={d} className={`tag-pill ${DOMAIN_COLORS[d] ?? ""}`}>
                          {d}
                        </span>
                      ))}
                      {perms.canViewConfidence && sig.confidence !== null && (
                        <span className="meta-item" style={{ color: "var(--muted)" }}>
                          AI conf: {Math.round(sig.confidence * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Domain score bars — Signal tier+ */}
                    {expanded === sig.id && perms.canViewDomainScores && (
                      <div style={{ marginTop: "8px" }}>
                        {[
                          { label: "Power", value: sig.power_score },
                          { label: "Money", value: sig.money_score },
                          { label: "Rules", value: sig.rules_score },
                        ].map(({ label, value }) => (
                          <div key={label} className="domain-bar-row">
                            <span className="domain-bar-label">{label}</span>
                            <div className="domain-bar-track">
                              <div
                                className={`domain-bar-fill ${label.toLowerCase()}`}
                                style={{
                                  width: value !== null
                                    ? `${Math.min((value / 5) * 100, 100)}%`
                                    : "0%",
                                }}
                              />
                            </div>
                            <span className="domain-bar-value">
                              {value !== null ? value.toFixed(1) : "—"}
                            </span>
                          </div>
                        ))}
                        <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "8px" }}>
                          {sig.cluster_summary}
                        </div>
                      </div>
                    )}

                    {perms.canViewDomainScores && (
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
                        {expanded === sig.id ? "▲ Less" : "▼ Domain Scores"}
                      </button>
                    )}
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0, width: "110px" }}>
                    {perms.canViewSignalScore ? (
                      <>
                        <div className="queue-score">
                          {scoreDisplay !== null ? scoreDisplay : "—"}
                        </div>
                        <div className="queue-score-label">Signal Score</div>
                      </>
                    ) : (
                      <>
                        <div style={{ color: "#444", fontSize: "22px", fontWeight: "bold" }}>
                          —
                        </div>
                        <div style={{ fontSize: "11px" }}>
                          <Link href="/upgrade" style={{ color: "var(--gold)" }}>
                            Upgrade to view
                          </Link>
                        </div>
                      </>
                    )}

                    {perms.canEditAndPublish && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                        <Link
                          href={`/dashboard/review/${sig.id}`}
                          className="btn-light"
                          style={{
                            fontSize: "12px",
                            padding: "8px 12px",
                            display: "inline-block",
                            textAlign: "center",
                          }}
                        >
                          Edit & Publish
                        </Link>
                        {showQuickArchive && (
                          <button
                            onClick={() => handleQuickArchive(sig.id)}
                            disabled={archiving === sig.id}
                            style={{
                              background: "none",
                              border: "1px solid #333",
                              color: archiving === sig.id ? "#444" : "var(--muted)",
                              fontSize: "11px",
                              padding: "6px 12px",
                              cursor: archiving === sig.id ? "default" : "pointer",
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                            }}
                          >
                            {archiving === sig.id ? "Archiving…" : "↓ Archive"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              marginTop: "32px",
              paddingBottom: "32px",
            }}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  color: page === 0 ? "#444" : "var(--gold)",
                  fontSize: "12px",
                  padding: "6px 14px",
                  cursor: page === 0 ? "default" : "pointer",
                }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                style={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  color: page >= totalPages - 1 ? "#444" : "var(--gold)",
                  fontSize: "12px",
                  padding: "6px 14px",
                  cursor: page >= totalPages - 1 ? "default" : "pointer",
                }}
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}