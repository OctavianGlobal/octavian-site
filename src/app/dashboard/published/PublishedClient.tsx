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

const TIERS: SubscriptionTier[] = ["free", "signal", "signal_plus", "analyst", "editor"];

interface PublishedClientProps {
  isAdmin: boolean;
  isEditor: boolean;
  signals: PublishedSignal[];
  count: number;
  page: number;
  domain: SignalDomain | null;
}

export default function PublishedClient({
  isAdmin,
  isEditor,
  signals,
  count,
  page,
  domain,
}: PublishedClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [previewTier, setPreviewTier] = useState<SubscriptionTier>("editor");
  const perms = TIER_PERMISSIONS[previewTier];
  const totalPages = Math.ceil(count / PAGE_SIZE);

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`/dashboard/published?${params.toString()}`);
  }

  function handleDomainFilter(d: SignalDomain | null) {
    pushParams({ domain: d, page: null });
  }

  function handlePageChange(newPage: number) {
    pushParams({ page: newPage === 0 ? null : String(newPage) });
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
          <div style={{ flex: 1 }} />
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

      {/* ── Permissions bar ── */}
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "12px 0" }}>
        <div className="container" style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
          {[
            { label: "Domain Scores", key: "canViewDomainScores" as const },
            { label: "Signal Score", key: "canViewSignalScore" as const },
            { label: "Confidence", key: "canViewConfidence" as const },
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
              <h1 className="dash-title">Published Briefs</h1>
              <p className="dash-subtitle">
                {count} published briefs
                {domain && ` · ${domain}`}
                {totalPages > 1 && ` · Page ${page + 1} of ${totalPages}`}
              </p>
            </div>
          </div>

          {/* ── Domain filter pills ── */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
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

          {signals.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
              No briefs published yet.
            </div>
          ) : (
            signals.map((sig) => (
              <article key={sig.id} className="brief-row" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div className="brief-main" style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="brief-title">
                    <Link href={`/briefs/${sig.id}`}>
                      {sig.published_title ?? sig.cluster_summary ?? "Untitled"}
                    </Link>
                  </h3>
                  <div className="meta" style={{ margin: "4px 0 8px" }}>
                    <span className="meta-item">
                      {sig.published_at
                        ? new Date(sig.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                        : "—"}
                    </span>
                    <span className="meta-dot" />
                    {sig.primary_domain && (
                      <span className={`tag-pill ${DOMAIN_COLORS[sig.primary_domain] ?? ""}`}>
                        {sig.primary_domain}
                      </span>
                    )}
                  </div>
                  <p className="brief-desc">{sig.cluster_summary ?? ""}</p>
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
                  <Link href={`/briefs/${sig.id}`} className="read" style={{ display: "block", marginTop: "8px", fontSize: "13px" }}>
                    Read →
                  </Link>
                  {isEditor && (
                    <Link
                      href={`/dashboard/review/${sig.id}`}
                      className="btn-light"
                      style={{ marginTop: "8px", fontSize: "12px", padding: "6px 10px", display: "inline-block" }}
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </article>
            ))
          )}

          {/* ── Pagination ── */}
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