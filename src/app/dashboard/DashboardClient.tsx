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
const TIER_VALUES: SubscriptionTier[] = ["free", "signal", "signal_plus", "analyst", "editor"];

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

  // ── Load preview tier from localStorage (editor only) ──
  useEffect(() => {
    if (!isEditor) return;
    const saved = localStorage.getItem("octavian_preview_tier");
    if (saved && (TIER_VALUES as string[]).includes(saved)) {
      setPreviewTier(saved as SubscriptionTier);
    }
  }, [isEditor]);

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

  function parseDomains(sig: DashboardSignal): string[] {
    if (!sig.domains_jsonb) return [sig.primary_domain ?? DOMAIN_FALLBACK];
    if (Array.isArray(sig.domains_jsonb)) return sig.domains_jsonb.length ? sig.domains_jsonb : [sig.primary_domain ?? DOMAIN_FALLBACK];
    if (typeof sig.domains_jsonb === "string") {
      try {
        const parsed = JSON.parse(sig.domains_jsonb);
        return Array.isArray(parsed) && parsed.length ? parsed : [sig.primary_domain ?? DOMAIN_FALLBACK];
      } catch { return [sig.primary_domain ?? DOMAIN_FALLBACK]; }
    }
    return [sig.primary_domain ?? DOMAIN_FALLBACK];
  }

  // Format a UTC ISO string to a short local date e.g. "Mar 18, 2026"
  function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return iso.slice(0, 10); }
  }

  // Format item_age (decimal days) to a readable number e.g. "1.4 days" or "0.3 days"
  function fmtAge(days: number | null): string {
    if (days === null || days === undefined) return "—";
    return `${days.toFixed(1)} days`;
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

  function upgradeMessage(): string {
    if (tier === "free") return "Upgrade to Signal to unlock Domain Gauges on every brief";
    if (tier === "signal") return "Upgrade to Signal Plus to see numerical Signal Scores and AI Confidence";
    return "Upgrade to Analyst for unlimited archive access and 3D Globe visualization";
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
            { label: "Domain Scores",  key: "canViewDomainScores" as const },
            { label: "Signal Score",   key: "canViewSignalScore" as const },
            { label: "Confidence",     key: "canViewConfidence" as const },
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
        </div>
      </div>

      {/* ── Upgrade nudge — non-editor, non-analyst users ── */}
      {!isEditor && tier !== "analyst" && (
        <div style={{ background: "rgba(212,175,55,0.05)", borderBottom: "1px solid rgba(212,175,55,0.10)", padding: "8px 0" }}>
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-jakarta), sans-serif" }}>
              {upgradeMessage()}
            </span>
            <Link href="/tiers" style={{ fontSize: "11px", color: "#D4AF37", letterSpacing: "0.10em", textDecoration: "none", whiteSpace: "nowrap", fontFamily: "Cinzel, serif", flexShrink: 0 }}>
              View Tiers →
            </Link>
          </div>
        </div>
      )}

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

          {/* ── Advanced Archive Tool ── */}
          {isEditor && (
            <AdvancedArchiveTool onComplete={() => { setBulkRefreshKey(k => k + 1); router.refresh(); }} />
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

              return (
                <div key={sig.id} className="queue-row" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="queue-title">{sig.cluster_summary ?? "Untitled Signal"}</div>

                    {/* ── Primary meta row: signal date + domains + confidence ── */}
                    <div className="meta" style={{ margin: "4px 0 6px" }}>
                      <span className="meta-item">{sig.created_at?.slice(0, 10) ?? "—"}</span>
                      <span className="meta-dot" />
                      {parseDomains(sig).map((d) => (
                        <span key={d} className={`tag-pill ${DOMAIN_COLORS[d] ?? ""}`}>{d}</span>
                      ))}
                      {perms.canViewConfidence && sig.confidence !== null && (
                        <span className="meta-item" style={{ color: "var(--muted)" }}>AI conf: {Math.round(sig.confidence * 100)}%</span>
                      )}
                    </div>

                    {/* ── Item provenance row: published, fetched, age ── */}
                    <div style={{
                      display: "flex", gap: "16px", flexWrap: "wrap",
                      margin: "0 0 8px",
                      fontFamily: "var(--font-jakarta), sans-serif",
                    }}>
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                        <span style={{ color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginRight: "4px" }}>Published</span>
                        <span style={{ color: "var(--ink)", fontWeight: 500 }}>{fmtDate(sig.primary_published_at)}</span>
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                        <span style={{ color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginRight: "4px" }}>Fetched</span>
                        <span style={{ color: "var(--ink)", fontWeight: 500 }}>{fmtDate(sig.primary_fetched_at)}</span>
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                        <span style={{ color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginRight: "4px" }}>Age</span>
                        <span style={{
                          color: sig.primary_item_age !== null && sig.primary_item_age > 3 ? "#c0392b" : "var(--ink)",
                          fontWeight: 500,
                        }}>
                          {fmtAge(sig.primary_item_age)}
                        </span>
                      </span>
                    </div>

                    {/* ── Expanded domain scores ── */}
                    {expanded === sig.id && perms.canViewDomainScores && (
                      <div style={{ marginTop: "8px" }}>
                        {sig.primary_snippet && (
                          <p style={{ fontSize: "12px", color: "#444", lineHeight: 1.6, margin: "0 0 10px", fontFamily: "var(--font-jakarta), sans-serif" }}>
                            {sig.primary_snippet.slice(0, 220)}{sig.primary_snippet.length > 220 ? "…" : ""}
                          </p>
                        )}
                        {sig.primary_source_name && (
                          <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-jakarta), sans-serif" }}>
                            Source: <strong style={{ color: "var(--ink)" }}>{sig.primary_source_name}</strong>
                          </div>
                        )}
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
                      </div>
                    )}

                    {perms.canViewDomainScores && (
                      <button
                        onClick={() => toggleExpand(sig.id)}
                        style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "11px", letterSpacing: "0.08em", cursor: "pointer", marginTop: "6px", padding: 0, textTransform: "uppercase" }}
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
                          <Link href="/tiers" style={{ color: "var(--gold)" }}>Upgrade to view</Link>
                        </div>
                      </>
                    )}
                    {isEditor && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                        <Link href={`/dashboard/review/${sig.id}`} className="btn-light" style={{ fontSize: "12px", padding: "8px 12px", display: "inline-block", textAlign: "center" }}>
                          Edit & Publish
                        </Link>
                        <button
                          onClick={() => handleQuickArchive(sig.id)}
                          disabled={archiving === sig.id}
                          style={{ padding: "6px 12px", fontSize: "12px", fontFamily: "inherit", background: "#ffffff", color: archiving === sig.id ? "#aaa" : "#000000", border: "1px solid #d0d0d0", borderRadius: "10px", cursor: archiving === sig.id ? "default" : "pointer", fontWeight: 600, letterSpacing: "0.02em", transition: "border-color 0.15s" }}
                        >
                          {archiving === sig.id ? "Archiving…" : "↓ Archive"}
                        </button>
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

// ── Advanced Archive Tool Component ──────────────────────────────────────────

function AdvancedArchiveTool({ onComplete }: { onComplete: () => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<string>("below_score");
  const [score, setScore] = useState("40");
  const [date, setDate] = useState("");
  const [domain, setDomain] = useState("POWER");
  const [preview, setPreview] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState("");

  const MODE_LABELS: Record<string, string> = {
    below_score:        "Below score threshold",
    null_scores:        "Null scores only",
    older_than:         "Older than date",
    domain_below_score: "Domain + score",
    nuclear:            "ALL candidates",
  };

  function resetState() { setPreview(null); setConfirmed(false); setDone(null); setError(""); }

  async function handlePreview() {
    setPreviewing(true); setPreview(null); setError(""); setConfirmed(false);
    try {
      const params = new URLSearchParams({ mode });
      if (mode === "below_score" || mode === "domain_below_score") params.set("score", score);
      if (mode === "older_than") params.set("date", date);
      if (mode === "domain_below_score") params.set("domain", domain);
      const res = await fetch(`/api/signals/advanced-archive?${params.toString()}`);
      const data = await res.json();
      setPreview(data.count ?? 0);
    } catch { setError("Preview failed. Try again."); }
    finally { setPreviewing(false); }
  }

  async function handleArchive() {
    if (!confirmed) return;
    setRunning(true); setError("");
    try {
      const body: any = { mode, confirmed: true };
      if (mode === "below_score" || mode === "domain_below_score") body.score = parseFloat(score);
      if (mode === "older_than") body.date = date;
      if (mode === "domain_below_score") body.domain = domain;
      const res = await fetch("/api/signals/advanced-archive", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) { setDone(data.archived_count ?? 0); setPreview(null); setConfirmed(false); onComplete(); }
      else { setError(data.error ?? "Archive failed."); }
    } catch { setError("Archive failed. Try again."); }
    finally { setRunning(false); }
  }

  const isNuclear = mode === "nuclear";

  return (
    <div style={{ background: "#fafafa", border: "1px solid var(--line)", borderRadius: "8px", marginBottom: "20px", overflow: "hidden" }}>
      <button
        onClick={() => { setOpen(o => !o); resetState(); }}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-jakarta), sans-serif" }}
      >
        <span style={{ fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#888", fontWeight: 600 }}>⚡ Advanced Archive</span>
        <span style={{ fontSize: "11px", color: "#aaa" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--line)" }}>
          <div style={{ marginTop: "14px", marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", display: "block", marginBottom: "6px", fontFamily: "var(--font-jakarta), sans-serif" }}>Archive Mode</label>
            <select value={mode} onChange={(e) => { setMode(e.target.value); resetState(); }} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: "6px", fontSize: "13px", fontFamily: "var(--font-jakarta), sans-serif", color: "#1a1a1a", background: "#fff" }}>
              {Object.entries(MODE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {mode === "below_score" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", color: "#555", fontFamily: "var(--font-jakarta), sans-serif" }}>Score below</span>
              <input type="number" min="1" max="100" value={score} onChange={(e) => { setScore(e.target.value); resetState(); }} style={{ width: "70px", padding: "6px 8px", border: "1px solid #d0d0d0", borderRadius: "6px", fontSize: "13px", color: "#1a1a1a", background: "#fff", textAlign: "center" }} />
            </div>
          )}

          {mode === "older_than" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", color: "#555", fontFamily: "var(--font-jakarta), sans-serif" }}>Older than</span>
              <input type="date" value={date} onChange={(e) => { setDate(e.target.value); resetState(); }} style={{ padding: "6px 10px", border: "1px solid #d0d0d0", borderRadius: "6px", fontSize: "13px", color: "#1a1a1a", background: "#fff" }} />
            </div>
          )}

          {mode === "domain_below_score" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
              <select value={domain} onChange={(e) => { setDomain(e.target.value); resetState(); }} style={{ padding: "6px 10px", border: "1px solid #d0d0d0", borderRadius: "6px", fontSize: "13px", color: "#1a1a1a", background: "#fff" }}>
                {["POWER", "MONEY", "RULES", "ENVIRONMENT", "TECHNOLOGY"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span style={{ fontSize: "13px", color: "#555", fontFamily: "var(--font-jakarta), sans-serif" }}>below score</span>
              <input type="number" min="1" max="100" value={score} onChange={(e) => { setScore(e.target.value); resetState(); }} style={{ width: "70px", padding: "6px 8px", border: "1px solid #d0d0d0", borderRadius: "6px", fontSize: "13px", color: "#1a1a1a", background: "#fff", textAlign: "center" }} />
            </div>
          )}

          {isNuclear && (
            <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "6px", padding: "10px 14px", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 600, fontFamily: "var(--font-jakarta), sans-serif" }}>⚠ This will archive ALL candidate signals regardless of score or date.</span>
            </div>
          )}

          {mode === "null_scores" && (
            <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: "6px", padding: "10px 14px", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", color: "#854d0e", fontFamily: "var(--font-jakarta), sans-serif" }}>Archives all candidates with no signal score (unscored by pipeline).</span>
            </div>
          )}

          <button onClick={handlePreview} disabled={previewing || (mode === "older_than" && !date)} style={{ padding: "7px 16px", fontSize: "12px", fontFamily: "inherit", background: "#1a1a1a", color: previewing ? "#555" : "#D4AF37", border: "1px solid #333", borderRadius: "6px", cursor: previewing || (mode === "older_than" && !date) ? "default" : "pointer", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "12px" }}>
            {previewing ? "Previewing…" : "Preview"}
          </button>

          {preview !== null && (
            <div style={{ marginBottom: "12px" }}>
              <div style={{ padding: "12px 14px", borderRadius: "6px", marginBottom: "12px", background: preview === 0 ? "#f0fdf4" : isNuclear ? "#fff5f5" : "#fefce8", border: `1px solid ${preview === 0 ? "#bbf7d0" : isNuclear ? "#fecaca" : "#fde047"}` }}>
                <span style={{ fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-jakarta), sans-serif", color: preview === 0 ? "#166534" : isNuclear ? "#991b1b" : "#854d0e" }}>
                  {preview === 0 ? "✓ No signals match — nothing to archive" : `${preview} signal${preview !== 1 ? "s" : ""} will be archived`}
                </span>
              </div>
              {preview > 0 && (
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                  <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} style={{ marginTop: "2px", width: "16px", height: "16px", cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "#555", fontFamily: "var(--font-jakarta), sans-serif", lineHeight: 1.5 }}>
                    I understand this will permanently archive {preview} signal{preview !== 1 ? "s" : ""} and this action cannot be undone.
                  </span>
                </label>
              )}
            </div>
          )}

          {preview !== null && preview > 0 && (
            <button onClick={handleArchive} disabled={!confirmed || running} style={{ padding: "8px 20px", fontSize: "12px", fontFamily: "inherit", background: confirmed ? (isNuclear ? "#991b1b" : "#1a1a1a") : "#e5e7eb", color: confirmed ? (isNuclear ? "#ffffff" : "#D4AF37") : "#9ca3af", border: `1px solid ${confirmed ? (isNuclear ? "#7f1d1d" : "#333") : "#d1d5db"}`, borderRadius: "6px", cursor: !confirmed || running ? "default" : "pointer", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", transition: "all 0.15s" }}>
              {running ? "Archiving…" : isNuclear ? "⚠ Archive ALL" : "Archive"}
            </button>
          )}

          {done !== null && <div style={{ marginTop: "10px", fontSize: "12px", color: "#166534", fontWeight: 600, fontFamily: "var(--font-jakarta), sans-serif" }}>✓ {done} signal{done !== 1 ? "s" : ""} archived successfully</div>}
          {error && <div style={{ marginTop: "10px", fontSize: "12px", color: "#991b1b", fontFamily: "var(--font-jakarta), sans-serif" }}>{error}</div>}
        </div>
      )}
    </div>
  );
}
