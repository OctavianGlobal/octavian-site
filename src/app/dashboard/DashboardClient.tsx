"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import OctavianWordmark from "@/components/OctavianWordmark";
import { TIER_PERMISSIONS } from "@/lib/tiers";
import type { SubscriptionTier, DashboardSignal, SignalDomain } from "@/types/supabase";

const DOMAIN_COLORS: Record<string, string> = {
  POWER: "power", MONEY: "money", RULES: "rules", ENVIRONMENT: "env", TECHNOLOGY: "tech",
};

const ALL_DOMAINS: SignalDomain[] = ["POWER", "MONEY", "RULES", "ENVIRONMENT", "TECHNOLOGY"];
const DOMAIN_FALLBACK: SignalDomain = "POWER";
const PAGE_SIZE = 50;
const QUICK_ARCHIVE_THRESHOLD = 0.50;

const TIERS: SubscriptionTier[] = ["free", "signal", "signal_plus", "analyst", "editor"];

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
  const [previewTier, setPreviewTier] = useState<SubscriptionTier>(isEditor ? "editor" : tier);
  const [archiving, setArchiving] = useState<string | null>(null);
  const [bulkThreshold, setBulkThreshold] = useState("40");
  const [bulkCount, setBulkCount] = useState<number | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkDone, setBulkDone] = useState<number | null>(null);
  const [bulkRefreshKey, setBulkRefreshKey] = useState(0);

  const perms = TIER_PERMISSIONS[previewTier];
  const totalPages = Math.ceil(count / PAGE_SIZE);

  useEffect(() => {
    if (!isEditor) return;
    const t = parseFloat(bulkThreshold);
    if (isNaN(t) || t <= 0 || t > 100) { setBulkCount(null); return; }
    const raw = t / 100;
    fetch(`/api/signals/bulk-archive-threshold?threshold=${raw}`)
      .then(r => r.json())
      .then(d => setBulkCount(d.count ?? 0))
      .catch(() => setBulkCount(null));
  }, [bulkThreshold, isEditor, bulkRefreshKey]);

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`/dashboard?${params.toString()}`);
  }

  function handleDomainFilter(d: SignalDomain | null) { pushParams({ domain: d, page: null }); }
  function handlePageChange(newPage: number) { pushParams({ page: newPage === 0 ? null : String(newPage) }); }

  function handleSortField(field: 'date' | 'score') {
    if (field === sort) {
      pushParams({ sort: field, dir: dir === 'desc' ? 'asc' : 'desc', page: null });
    } else {
      pushParams({ sort: field, dir: 'desc', page: null });
    }
  }

  function toggleExpand(id: string) { setExpanded((prev) => (prev === id ? null : id)); }

  async function handleQuickArchive(id: string) {
    setArchiving(id);
    try {
      const res = await fetch('/api/signals/archive', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal_id: id }),
      });
      if (res.ok) router.refresh();
      else alert('Archive failed. Please try again.');
    } catch { alert('Archive failed. Please try again.'); }
    finally { setArchiving(null); }
  }

  async function handleBulkArchive() {
    const t = parseFloat(bulkThreshold);
    if (isNaN(t) || t <= 0 || t > 100) return;
    if (!confirm(`Archive all ${bulkCount} candidate signals scoring below ${bulkThreshold}? This cannot be undone.`)) return;
    setBulkRunning(true); setBulkDone(null);
    try {
      const res = await fetch('/api/signals/bulk-archive-threshold', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: t / 100 }),
      });
      const data = await res.json();
      if (res.ok) {
        setBulkDone(data.archived_count ?? 0); setBulkCount(null);
        setBulkRefreshKey(k => k + 1); router.refresh();
      } else { alert('Bulk archive failed. Please try again.'); }
    } catch { alert('Bulk archive failed. Please try again.'); }
    finally { setBulkRunning(false); }
  }

  const sortArrow = dir === 'desc' ? '▼' : '▲';

  function sortButtonStyle(field: 'date' | 'score'): React.CSSProperties {
    const active = sort === field;
    return {
      background: active ? "#2a2a2a" : "#1a1a1a",
      border: active ? "1px solid rgba(212,175,55,0.4)" : "1px solid #333",
      color: active ? "var(--gold)" : "var(--muted)",
      fontSize: "11px", letterSpacing: "0.08em", padding: "4px 12px",
      cursor: "pointer", textTransform: "uppercase" as const,
    };
  }

  function paginationBtn(disabled: boolean): React.CSSProperties {
    return {
      background: "#1a1a1a", border: "1px solid #333",
      color: disabled ? "#444" : "var(--gold)",
      fontSize: "12px", padding: "6px 14px",
      cursor: disabled ? "default" : "pointer",
    };
  }

  return (
    <>
      {/* ── Masthead ── */}
      <div style={{ background: "#0a0a0a", paddingTop: "82px", paddingBottom: "28px", textAlign: "center", borderBottom: "1px solid #1a1a1a" }}>
        <div className="container">
          <Link href="/home" style={{ display: "inline-block", marginBottom: "10px" }}>
            <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 2L44 10V28C44 40 34 50 24 54C14 50 4 40 4 28V10L24 2Z" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
              <path d="M24 12L36 17V28C36 35.5 30.5 42 24 44.5C17.5 42 12 35.5 12 28V17L24 12Z" fill="#D4AF37" fillOpacity="0.08" stroke="#D4AF37" strokeWidth="0.75" />
            </svg>
          </Link>
          <div>
            <OctavianWordmark size={28} color="#D4AF37" letterSpacing="0.28em" />
          </div>
        </div>
      </div>

      {/* ── Permissions bar ── */}
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "12px 0" }}>
        <div className="container" style={{ display: "flex", gap: "24px", flexWrap: "nowrap", alignItems: "center", overflowX: "auto" }}>
          {[
            { label: "Domain Scores", key: "canViewDomainScores" as const },
            { label: "Signal Score", key: "canViewSignalScore" as const },
            { label: "Confidence", key: "canViewConfidence" as const },
            { label: "Archive", key: "canSearchArchive" as const },
            { label: "Edit & Publish", key: "canEditAndPublish" as const },
          ].map(({ label, key }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              <span style={{
                width: "18px", height: "18px", borderRadius: "50%",
                background: perms[key] ? "rgba(76,175,80,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${perms[key] ? "#4caf50" : "#3a3a3a"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", color: perms[key] ? "#4caf50" : "#666", flexShrink: 0,
              }}>
                {perms[key] ? "✓" : "✗"}
              </span>
              <span style={{
                fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase",
                color: perms[key] ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: "12px", letterSpacing: "0.06em", flexShrink: 0, display: "flex", alignItems: "center", gap: "16px" }}>
            <span>
              <span style={{ color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Archive: </span>
              <span style={{ color: "rgba(255,255,255,0.65)" }}>
                {perms.archiveDaysBack === "unlimited" ? "Unlimited" : perms.archiveDaysBack === 0 ? "None" : `${perms.archiveDaysBack} days`}
              </span>
            </span>
            {isEditor && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>PREVIEW AS:</span>
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
            )}
          </div>
        </div>
      </div>

      {/* ── Full width content ── */}
      <div style={{ background: "var(--paper)", minHeight: "calc(100vh - 200px)" }}>
        <div className="container" style={{ padding: "32px 0" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--line)",
          }}>
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
          {isEditor && (
            <div style={{
              background: "#fafafa", border: "1px solid var(--line)", borderRadius: "8px",
              padding: "14px 18px", marginBottom: "20px",
              display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#888", fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600, flexShrink: 0 }}>
                Bulk Archive
              </span>
              <span style={{ fontSize: "13px", color: "#555", fontFamily: "var(--font-jakarta), sans-serif" }}>
                Archive all candidates scoring below
              </span>
              <input
                type="number" min="1" max="99" value={bulkThreshold}
                onChange={(e) => setBulkThreshold(e.target.value)}
                style={{ width: "64px", padding: "5px 8px", border: "1px solid #d0d0d0", borderRadius: "6px", fontSize: "13px", fontFamily: "var(--font-jakarta), sans-serif", color: "#1a1a1a", background: "#fff", textAlign: "center" }}
              />
              {bulkCount !== null && (
                <span style={{ fontSize: "12px", color: "#888", fontFamily: "var(--font-jakarta), sans-serif" }}>{bulkCount} signals affected</span>
              )}
              <button
                onClick={handleBulkArchive}
                disabled={bulkRunning || bulkCount === 0 || bulkCount === null}
                style={{
                  padding: "6px 16px", fontSize: "12px", fontFamily: "inherit", background: "#1a1a1a",
                  color: bulkRunning || bulkCount === 0 || bulkCount === null ? "#555" : "#D4AF37",
                  border: "1px solid #333", borderRadius: "6px",
                  cursor: bulkRunning || bulkCount === 0 || bulkCount === null ? "default" : "pointer",
                  fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.15s",
                }}
              >
                {bulkRunning ? "Archiving…" : "Archive"}
              </button>
              {bulkDone !== null && (
                <span style={{ fontSize: "12px", color: "#166534", fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600 }}>✓ {bulkDone} archived</span>
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
                border: "1px solid #333", borderRadius: "4px", fontSize: "11px",
                letterSpacing: "0.08em", padding: "4px 10px", cursor: "pointer", textTransform: "uppercase",
              }}
            >All</button>
            {ALL_DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => handleDomainFilter(domain === d ? null : d)}
                className={`tag-pill ${DOMAIN_COLORS[d] ?? ""}`}
                style={{ cursor: "pointer", opacity: domain && domain !== d ? 0.4 : 1, border: domain === d ? "1px solid var(--gold)" : "1px solid transparent" }}
              >{d}</button>
            ))}
            <div style={{ flex: 1 }} />
            {isEditor && (
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => handleSortField('date')} style={sortButtonStyle('date')}>{sort === 'date' ? `${sortArrow} Date` : 'Date'}</button>
                <button onClick={() => handleSortField('score')} style={sortButtonStyle('score')}>{sort === 'score' ? `${sortArrow} Score` : 'Score'}</button>
              </div>
            )}
          </div>

          {signals.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>No signals in the queue.</div>
          ) : (
            signals.map((sig) => {
              const scoreDisplay = perms.canViewSignalScore && sig.score !== null ? Math.round(sig.score * 100) : null;
              const showQuickArchive = isEditor && sig.signal_score_raw !== null && sig.signal_score_raw < QUICK_ARCHIVE_THRESHOLD;

              return (
                <div key={sig.id} className="queue-row" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="queue-title">{sig.cluster_summary ?? "Untitled Signal"}</div>
                    <div className="meta" style={{ margin: "4px 0 8px" }}>
                      <span className="meta-item">{sig.created_at?.slice(0, 10) ?? "—"}</span>
                      <span className="meta-dot" />
                      {(sig.domains_jsonb?.length ? sig.domains_jsonb : [sig.primary_domain ?? DOMAIN_FALLBACK]).map((d) => (
                        <span key={d} className={`tag-pill ${DOMAIN_COLORS[d] ?? ""}`}>{d}</span>
                      ))}
                      {perms.canViewConfidence && sig.confidence !== null && (
                        <span className="meta-item" style={{ color: "var(--muted)" }}>AI conf: {Math.round(sig.confidence * 100)}%</span>
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
                              <div className={`domain-bar-fill ${label.toLowerCase()}`} style={{ width: value !== null ? `${Math.min((value / 5) * 100, 100)}%` : "0%" }} />
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
                        style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "11px", letterSpacing: "0.08em", cursor: "pointer", marginTop: "10px", padding: 0, textTransform: "uppercase" }}
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
                    {isEditor && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                        <Link href={`/dashboard/review/${sig.id}`} className="btn-light" style={{ fontSize: "12px", padding: "8px 12px", display: "inline-block", textAlign: "center" }}>
                          Edit & Publish
                        </Link>
                        {showQuickArchive && (
                          <button
                            onClick={() => handleQuickArchive(sig.id)}
                            disabled={archiving === sig.id}
                            style={{ padding: "6px 12px", fontSize: "12px", fontFamily: "inherit", background: "#ffffff", color: archiving === sig.id ? "#aaa" : "#000000", border: "1px solid #d0d0d0", borderRadius: "10px", cursor: archiving === sig.id ? "default" : "pointer", fontWeight: 600, letterSpacing: "0.02em", transition: "border-color 0.15s" }}
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

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "32px", paddingBottom: "32px" }}>
              <button onClick={() => handlePageChange(0)} disabled={page === 0} style={paginationBtn(page === 0)}>« First</button>
              <button onClick={() => handlePageChange(page - 1)} disabled={page === 0} style={paginationBtn(page === 0)}>← Prev</button>
              <span style={{ fontSize: "12px", color: "var(--muted)", padding: "0 8px" }}>Page {page + 1} of {totalPages}</span>
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} style={paginationBtn(page >= totalPages - 1)}>Next →</button>
              <button onClick={() => handlePageChange(totalPages - 1)} disabled={page >= totalPages - 1} style={paginationBtn(page >= totalPages - 1)}>Last »</button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}