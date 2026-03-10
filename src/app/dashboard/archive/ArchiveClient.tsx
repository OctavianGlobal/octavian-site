"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { TIER_PERMISSIONS } from "@/lib/tiers";
import type {
  SubscriptionTier,
  PublishedSignal,
  SignalDomain,
} from "@/types/supabase";
import PipelineHealth from "@/components/PipelineHealth";

const DOMAIN_COLORS: Record<string, string> = {
  POWER: "power",
  MONEY: "money",
  RULES: "rules",
  ENVIRONMENT: "env",
  TECHNOLOGY: "tech",
};

const ALL_DOMAINS: SignalDomain[] = ["POWER", "MONEY", "RULES", "ENVIRONMENT", "TECHNOLOGY"];
const PAGE_SIZE = 25;

interface ArchiveClientProps {
  isEditor: boolean;
  isAdmin: boolean;
  signals: PublishedSignal[];
  count: number;
  restricted: boolean;
  tier: SubscriptionTier;
  page: number;
  domain: SignalDomain | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export default function ArchiveClient({
  isEditor,
  isAdmin,
  signals,
  count,
  restricted,
  tier,
  page,
  domain,
  dateFrom,
  dateTo,
}: ArchiveClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [previewTier, setPreviewTier] = useState<SubscriptionTier>(tier);
  const perms = TIER_PERMISSIONS[previewTier];
  const totalPages = Math.ceil(count / PAGE_SIZE);

  // ── URL param helpers ────────────────────────────────────────────────────

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`/dashboard/archive?${params.toString()}`);
  }

  function handleDomainFilter(d: SignalDomain | null) {
    pushParams({ domain: d, page: null });
  }

  function handlePageChange(newPage: number) {
    pushParams({ page: newPage === 0 ? null : String(newPage) });
  }

  function handleDateFrom(val: string) {
    pushParams({ from: val || null, page: null });
  }

  function handleDateTo(val: string) {
    pushParams({ to: val || null, page: null });
  }

  function handleClearDates() {
    pushParams({ from: null, to: null, page: null });
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
              {(["free", "signal", "signal_plus", "analyst", "editor"] as SubscriptionTier[]).map((t) => (
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
        </div>
      </div>

      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-title">Navigation</div>
          <Link href="/dashboard" className="dash-nav-link">
            Signal Queue
          </Link>
          <Link href="/dashboard/published" className="dash-nav-link">
            Published Briefs
          </Link>
          <Link href="/dashboard/archive" className="dash-nav-link active">
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
              <h1 className="dash-title">Archive</h1>
              <p className="dash-subtitle">
                {restricted
                  ? "Upgrade to access the archive"
                  : `${count} signals${domain ? ` · ${domain}` : ""}${dateFrom || dateTo ? ` · ${dateFrom ?? "start"} → ${dateTo ?? "today"}` : ""}${totalPages > 1 ? ` · Page ${page + 1} of ${totalPages}` : ""}`
                }
              </p>
            </div>
          </div>

          {/* ── Restricted state ── */}
          {restricted ? (
            <div style={{ padding: "64px 0", textAlign: "center" }}>
              <div style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "16px" }}>
                Archive access requires Signal Plus or higher.
              </div>
              <Link href="/upgrade" className="btn-gold">
                Upgrade to unlock →
              </Link>
            </div>
          ) : (
            <>
              {/* ── Filters ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>

                {/* Domain pills */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
                </div>

                {/* Date range — Analyst+ only */}
                {perms.canSearchArchive && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Date Range:
                    </span>
                    <input
                      type="date"
                      value={dateFrom ?? ""}
                      onChange={(e) => handleDateFrom(e.target.value)}
                      style={{
                        background: "#111",
                        border: "1px solid #333",
                        color: "var(--gold)",
                        fontSize: "12px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ color: "var(--muted)", fontSize: "12px" }}>→</span>
                    <input
                      type="date"
                      value={dateTo ?? ""}
                      onChange={(e) => handleDateTo(e.target.value)}
                      style={{
                        background: "#111",
                        border: "1px solid #333",
                        color: "var(--gold)",
                        fontSize: "12px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                    />
                    {(dateFrom || dateTo) && (
                      <button
                        onClick={handleClearDates}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--muted)",
                          fontSize: "11px",
                          cursor: "pointer",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── Signal list ── */}
              {signals.length === 0 ? (
                <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                  No signals found.
                </div>
              ) : (
                signals.map((sig) => (
                  <div key={sig.id} className="queue-row" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="queue-title">
                        {sig.published_title ?? sig.cluster_summary ?? "Untitled Signal"}
                      </div>
                      <div className="meta" style={{ margin: "4px 0 8px" }}>
                        <span className="meta-item">
                          {(sig.published_at ?? sig.created_at)?.slice(0, 10) ?? "—"}
                        </span>
                        <span className="meta-dot" />
                        <span
                          className={`tag-pill ${DOMAIN_COLORS[sig.primary_domain ?? "POWER"] ?? ""}`}
                        >
                          {sig.primary_domain ?? "POWER"}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            color: sig.status === "published" ? "#4caf50" : "var(--muted)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            marginLeft: "6px",
                          }}
                        >
                          {sig.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0, width: "110px" }}>
                      {perms.canViewSignalScore && sig.score !== null ? (
                        <>
                          <div className="queue-score">
                            {Math.round(sig.score * 100)}
                          </div>
                          <div className="queue-score-label">Signal Score</div>
                        </>
                      ) : (
                        <div style={{ color: "#444", fontSize: "22px", fontWeight: "bold" }}>—</div>
                      )}
                      {isEditor && (
                        <Link
                          href={`/dashboard/review/${sig.id}`}
                          className="btn-light"
                          style={{
                            marginTop: "10px",
                            fontSize: "12px",
                            padding: "8px 12px",
                            display: "inline-block",
                          }}
                        >
                          Edit & Publish
                        </Link>
                      )}
                    </div>
                  </div>
                ))
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
            </>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}