"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
const PAGE_SIZE = 50;
const QUICK_ARCHIVE_THRESHOLD = 0.50;

const TIERS: SubscriptionTier[] = [
  "free", "signal", "signal_plus", "analyst", "editor",
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
  dir: 'asc' | 'desc';
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
  dir,
}: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [previewTier, setPreviewTier] = useState<SubscriptionTier>(tier);
  const [archiving, setArchiving] = useState<string | null>(null);
  const [bulkThreshold, setBulkThreshold] = useState("40");
  const [bulkCount, setBulkCount] = useState<number | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkDone, setBulkDone] = useState<number | null>(null);

  const perms = TIER_PERMISSIONS[previewTier];
  const totalPages = Math.ceil(count / PAGE_SIZE);

  // Preview count when threshold changes
  useEffect(() => {
    if (!perms.canEditAndPublish) return;
    const t = parseFloat(bulkThreshold);
    if (isNaN(t) || t <= 0 || t > 100) { setBulkCount(null); return; }
    const raw = t / 100;
    fetch(`/api/signals/bulk-archive-threshold?threshold=${raw}`)
      .then(r => r.json())
      .then(d => setBulkCount(d.count ?? 0))
      .catch(() => setBulkCount(null));
  }, [bulkThreshold, perms.canEditAndPublish]);

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

  function handleSortField(field: 'date' | 'score') {
    if (field === sort) {
      pushParams({ sort: field, dir: dir === 'desc' ? 'asc' : 'desc', page: null });
    } else {
      pushParams({ sort: field, dir: 'desc', page: null });
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  async function handleQuickArchive(id: string) {
    setArchiving(id);
    try {
      const res = await fetch('/api/signals/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal_id: id }),
      });
      if (res.ok) router.refresh();
      else alert('Archive failed. Please try again.');
    } catch {
      alert('Archive failed. Please try again.');
    } finally {
      setArchiving(null);
    }
  }

  async function handleBulkArchive() {
    const t = parseFloat(bulkThreshold);
    if (isNaN(t) || t <= 0 || t > 100) return;
    if (!confirm(`Archive all ${bulkCount} candidate signals scoring below ${bulkThreshold}? This cannot be undone.`)) return;

    setBulkRunning(true);
    setBulkDone(null);
    try {
      const res = await fetch('/api/signals/bulk-archive-threshold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: t / 100 }),
      });
      const data = await res.json();
      if (res.ok) {
        setBulkDone(data.archived_count ?? 0);
        router.refresh();
      } else {
        alert('Bulk archive failed. Please try again.');
      }
    } catch {
      alert('Bulk archive failed. Please try again.');
    } finally {
      setBulkRunning(false);
    }
  }

  const sortArrow = dir === 'desc' ? '▼' : '▲';

  function sortButtonStyle(field: 'date' | 'score'): React.CSSProperties {
    const active = sort === field;
    return {
      background: active ? "#2a2a2a" : "#1a1a1a",
      border: active ? "1px solid rgba(212,175,55,0.4)" : "1px solid #333",
      color: active ? "var(--gold)" : "var(--muted)",
      fontSize: "11px",
      letterSpacing: "0.08em",
      padding: "4px 12px",
      cursor: "pointer",
      textTransform: "uppercase" as const,
    };
  }

  function paginationBtn(disabled: boolean): React.CSSProperties {
    return {
      background: "#1a1a1a",
      border: "1px solid #333",
      color: disabled ? "#444" : "var(--gold)",
      fontSize: "12px",
      padding: "6px 14px",
      cursor: disabled ? "default" : "pointer",
    };
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
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "0.08em" }}>PREVIEW AS:</span>
            <select
              value={previewTier}
              onChange={(e) => setPreviewTier(e.target.value as SubscriptionTier)}
              style={{ background: "#111", border: "1px solid #333", color: "var(--gold)", fontSize: "11px", padding: "4px 8px", cursor: "pointer" }}
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
          <span style={{ color: perms.canViewDomainScores ? "#4caf50" : "#555" }}>{perms.canViewDomainScores ? "✓" : "✗"} Domain Scores</span>
          <span style={{ color: perms.canViewSignalScore ? "#4caf50" : "#555" }}>{perms.canViewSignalScore ? "✓" : "✗"} Signal Score</span>
          <span style={{ color: perms.canViewConfidence ? "#4caf50" : "#555" }}>{perms.canViewConfidence ? "✓" : "✗"} Confidence</span>
          <span style={{ color: perms.canSearchArchive ? "#4caf50" : "#555" }}>{perms.canSearchArchive ? "✓" : "✗"} Archive</span>
          <span style={{ color: perms.canEditAndPublish ? "#4caf50" : "#555" }}>{perms.canEditAndPublish ? "✓" : "✗"} Edit & Publish</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>
            Archive: {perms.archiveDaysBack === "unlimited" ? "Unlimited" : perms.archiveDaysBack === 0 ? "None" : `${perms.archiveDaysBack} days`}
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
              </p>
            </div>
          </div>

          {/* ── Bulk Archive Tool ── */}
          {perms.canEditAndPublish && (
            <div style={{
              background: "#fafafa",
              border: "1px solid var(--line)",
              borderRadius: "8px",
              padding: "14px 18px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}>
              <span style={{
                fontSize: "11px",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "#888",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontWeight: 600,
                flexShrink: 0,
              }}>
                Bulk Archive
              </span>
              <span style={{ fontSize: "13px", color: "#555", fontFamily: "var(--font-jakarta), sans-serif" }}>
                Archive all candidates scoring below
              </span>
              <input
                type="number"
                min="1"
                max="99"
                value={bulkThreshold}
                onChange={(e) => setBulkThreshold(e.target.value)}
                style={{
                  width: "64px",
                  padding: "5px 8px",
                  border: "1px solid #d0d0d0",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  color: "#1a1a1a",
                  background: "#fff",
                  textAlign: "center",
                }}
              />
              {bulkCount !== null && (
                <span style={{ fontSize: "12px", color: "#888", fontFamily: "var(--font-jakarta), sans-serif" }}>
                  {bulkCount} signals affected
                </span>
              )}
              <button
                onClick={handleBulkArchive}
                disabled={bulkRunning || bulkCount === 0 || bulkCount === null}
                style={{
                  padding: "6px 16px",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  background: "#1a1a1a",
                  color: bulkRunning || bulkCount === 0 || bulkCount === null ? "#555" : "#D4AF37",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  cursor: bulkRunning || bulkCount === 0 || bulkCount === null ? "default" : "pointer",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  transition: "color 0.15s",
                }}
              >
                {bulkRunning ? "Archiving…" : "Archive"}
              </button>
              {bulkDone !== null && (
                <span style={{ fontSize: "12px", color: "#166534", fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600 }}>
                  ✓ {bulkDone} archived
                </span>
              )}
            </div>
          )}

          {/* ── Filters + sort ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
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

            {perms.canEditAndPublish && (
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => handleSortField('date')} style={sortButtonStyle('date')}>
                  {sort === 'date' ? `${sortArrow} Date` : 'Date'}
                </button>
                <button onClick={() => handleSortField('score')} style={sortButtonStyle('score')}>
                  {sort === 'score' ? `${sortArrow} Score` : 'Score'}
                </button>
              </div>
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
                <div key={sig.id} className="queue-row" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="queue-title">{sig.cluster_summary ?? "Untitled Signal"}</div>
                    <div className="meta" style={{ margin: "4px 0 8px" }}>
                      <span className="meta-item">{sig.created_at?.slice(0, 10) ?? "—"}</span>
                      <span className="meta-dot" />
                      {(sig.domains_jsonb?.length
                        ? sig.domains_jsonb
                        : [sig.primary_domain ?? DOMAIN_FALLBACK]
                      ).map((d) => (
                        <span key={d} className={`tag-pill ${DOMAIN_COLORS[d] ?? ""}`}>{d}</span>
                      ))}
                      {perms.canViewConfidence && sig.confidence !== null && (
                        <span className="meta-item" style={{ color: "var(--muted)" }}>
                          AI conf: {Math.round(sig.confidence * 100)}%
                        </span>
                      )}
                    </div>

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
                                style={{ width: value !== null ? `${Math.min((value / 5) * 100, 100)}%` : "0%" }}
                              />
                            </div>
                            <span className="domain-bar-value">{value !== null ? value.toFixed(1) : "—"}</span>
                          </div>
                        ))}
                        <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "8px" }}>{sig.cluster_summary}</div>
                      </div>
                    )}

                    {perms.canViewDomainScores && (
                      <button
                        onClick={() => toggleExpand(sig.id)}
                        style={{
                          background: "none", border: "none", color: "var(--muted)",
                          fontSize: "11px", letterSpacing: "0.08em", cursor: "pointer",
                          marginTop: "10px", padding: 0, textTransform: "uppercase",
                        }}
                      >
                        {expanded === sig.id ? "▲ Less" : "▼ Domain Scores"}
                      </button>
                    )}
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0, width: "110px" }}>
                    {perms.canViewSignalScore ? (
                      <>
                        <div className="queue-score">{scoreDisplay !== null ? scoreDisplay : "—"}</div>
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

                    {perms.canEditAndPublish && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                        <Link
                          href={`/dashboard/review/${sig.id}`}
                          className="btn-light"
                          style={{ fontSize: "12px", padding: "8px 12px", display: "inline-block", textAlign: "center" }}
                        >
                          Edit & Publish
                        </Link>
                        {showQuickArchive && (
                          <button
                            onClick={() => handleQuickArchive(sig.id)}
                            disabled={archiving === sig.id}
                            style={{
                              padding: "6px 12px", fontSize: "12px", fontFamily: "inherit",
                              background: "#ffffff", color: archiving === sig.id ? "#aaa" : "#000000",
                              border: "1px solid #d0d0d0", borderRadius: "10px",
                              cursor: archiving === sig.id ? "default" : "pointer",
                              fontWeight: 600, letterSpacing: "0.02em", transition: "border-color 0.15s",
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
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "32px", paddingBottom: "32px" }}>
              <button onClick={() => handlePageChange(0)} disabled={page === 0} style={paginationBtn(page === 0)}>« First</button>
              <button onClick={() => handlePageChange(page - 1)} disabled={page === 0} style={paginationBtn(page === 0)}>← Prev</button>
              <span style={{ fontSize: "12px", color: "var(--muted)", padding: "0 8px" }}>
                Page {page + 1} of {totalPages}
              </span>
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} style={paginationBtn(page >= totalPages - 1)}>Next →</button>
              <button onClick={() => handlePageChange(totalPages - 1)} disabled={page >= totalPages - 1} style={paginationBtn(page >= totalPages - 1)}>Last »</button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}