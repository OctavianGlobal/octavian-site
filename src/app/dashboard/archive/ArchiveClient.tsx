"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { TIER_PERMISSIONS } from "@/lib/tiers";
import type { SubscriptionTier, PublishedSignal, SignalDomain } from "@/types/supabase";

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

  const [previewTier, setPreviewTier] = useState<SubscriptionTier>(isEditor ? "editor" : tier);
  const perms = TIER_PERMISSIONS[previewTier];
  const totalPages = Math.ceil(count / PAGE_SIZE);

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

  function paginationBtn(disabled: boolean): React.CSSProperties {
    return {
      background: "#1a1a1a", border: "1px solid #333",
      color: disabled ? "#444" : "var(--gold)",
      fontSize: "12px", padding: "6px 14px",
      cursor: disabled ? "default" : "pointer",
    };
  }

  const dateInputStyle: React.CSSProperties = {
    background: "#ffffff", border: "1px solid #d0d0d0",
    color: "#1a1a1a", fontSize: "13px", padding: "6px 10px",
    borderRadius: "6px", cursor: "pointer",
    fontFamily: "var(--font-jakarta), sans-serif",
    outline: "none", width: "130px",
  };

  return (
    <>
      {/* ── Top bar ── */}
      <div style={{ background: "var(--black)", padding: "14px 0", borderBottom: "1px solid #222", marginTop: "62px" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ flex: 1 }} />
          {isEditor && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>PREVIEW AS:</span>
              <select
                value={previewTier}
                onChange={(e) => setPreviewTier(e.target.value as SubscriptionTier)}
                style={{ background: "#111", border: "1px solid #333", color: "var(--gold)", fontSize: "11px", padding: "4px 8px", cursor: "pointer" }}
              >
                {(["free", "signal", "signal_plus", "analyst", "editor"] as SubscriptionTier[]).map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ").toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Permissions bar ── */}
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "12px 0" }}>
        <div className="container" style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
          {[
            { label: "Domain Scores", key: "canViewDomainScores" as const },
            { label: "Signal Score", key: "canViewSignalScore" as const },
            { label: "Confidence", key: "canViewConfidence" as const },
            { label: "Archive", key: "canSearchArchive" as const },
          ].map(({ label, key }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                width: "18px", height: "18px", borderRadius: "50%",
                background: perms[key] ? "rgba(76,175,80,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${perms[key] ? "#4caf50" : "#333"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", color: perms[key] ? "#4caf50" : "#444", flexShrink: 0,
              }}>
                {perms[key] ? "✓" : "✗"}
              </span>
              <span style={{
                fontSize: "12px", letterSpacing: "0.06em",
                color: perms[key] ? "rgba(255,255,255,0.7)" : "#444",
                textTransform: "uppercase",
              }}>
                {label}
              </span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>
            ARCHIVE:{" "}
            <span style={{ color: "rgba(255,255,255,0.65)" }}>
              {perms.archiveDaysBack === "unlimited" ? "Unlimited" : perms.archiveDaysBack === 0 ? "None" : `${perms.archiveDaysBack} days`}
            </span>
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
              <h1 className="dash-title">Archived Signals</h1>
              <p className="dash-subtitle">
                {restricted
                  ? "Upgrade to access the archive"
                  : `${count} signals${domain ? ` · ${domain}` : ""}${dateFrom || dateTo ? ` · ${dateFrom ?? "start"} → ${dateTo ?? "today"}` : ""}${totalPages > 1 ? ` · Page ${page + 1} of ${totalPages}` : ""}`
                }
              </p>
            </div>
          </div>

          {restricted ? (
            <div style={{ padding: "64px 0", textAlign: "center" }}>
              <div style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "16px" }}>
                Archive access requires Analyst tier or higher.
              </div>
              <Link href="/upgrade" className="btn-gold">Upgrade to unlock →</Link>
            </div>
          ) : (
            <>
              {/* ── Filters ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleDomainFilter(null)}
                    style={{
                      background: domain === null ? "var(--gold)" : "#1a1a1a",
                      color: domain === null ? "var(--black)" : "var(--muted)",
                      border: "1px solid #333", borderRadius: "4px",
                      fontSize: "11px", letterSpacing: "0.08em",
                      padding: "4px 10px", cursor: "pointer", textTransform: "uppercase",
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

                {perms.canSearchArchive && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
                    background: "#fafafa", border: "1px solid var(--line)",
                    borderRadius: "8px", padding: "12px 16px",
                  }}>
                    <span style={{
                      fontSize: "11px", color: "#888", letterSpacing: "0.10em",
                      textTransform: "uppercase", fontFamily: "var(--font-jakarta), sans-serif",
                      fontWeight: 600, flexShrink: 0,
                    }}>
                      Date Range
                    </span>
                    <input type="date" value={dateFrom ?? ""} onChange={(e) => handleDateFrom(e.target.value)} style={dateInputStyle} />
                    <span style={{ color: "#aaa", fontSize: "13px" }}>→</span>
                    <input type="date" value={dateTo ?? ""} onChange={(e) => handleDateTo(e.target.value)} style={dateInputStyle} />
                    {(dateFrom || dateTo) && (
                      <button
                        onClick={handleClearDates}
                        style={{
                          background: "none", border: "1px solid #d0d0d0", color: "#888",
                          fontSize: "11px", cursor: "pointer", letterSpacing: "0.08em",
                          textTransform: "uppercase", borderRadius: "6px", padding: "6px 10px",
                          fontFamily: "var(--font-jakarta), sans-serif",
                        }}
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>
                )}
              </div>

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
                        <span className="meta-item">{(sig.published_at ?? sig.created_at)?.slice(0, 10) ?? "—"}</span>
                        <span className="meta-dot" />
                        <span className={`tag-pill ${DOMAIN_COLORS[sig.primary_domain ?? "POWER"] ?? ""}`}>
                          {sig.primary_domain ?? "POWER"}
                        </span>
                        <span style={{
                          fontSize: "10px", color: sig.status === "published" ? "#4caf50" : "var(--muted)",
                          letterSpacing: "0.08em", textTransform: "uppercase", marginLeft: "6px",
                        }}>
                          {sig.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0, width: "110px" }}>
                      {perms.canViewSignalScore && sig.score !== null ? (
                        <>
                          <div className="queue-score">{Math.round(sig.score * 100)}</div>
                          <div className="queue-score-label">Signal Score</div>
                        </>
                      ) : (
                        <div style={{ color: "#444", fontSize: "22px", fontWeight: "bold" }}>—</div>
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

              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "32px", paddingBottom: "32px" }}>
                  <button onClick={() => handlePageChange(0)} disabled={page === 0} style={paginationBtn(page === 0)}>« First</button>
                  <button onClick={() => handlePageChange(page - 1)} disabled={page === 0} style={paginationBtn(page === 0)}>← Prev</button>
                  <span style={{ fontSize: "12px", color: "var(--muted)", padding: "0 8px" }}>Page {page + 1} of {totalPages}</span>
                  <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} style={paginationBtn(page >= totalPages - 1)}>Next →</button>
                  <button onClick={() => handlePageChange(totalPages - 1)} disabled={page >= totalPages - 1} style={paginationBtn(page >= totalPages - 1)}>Last »</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}