"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { TIER_PERMISSIONS } from "@/lib/tiers";
import type { SubscriptionTier, PublishedSignal, SignalDomain } from "@/types/supabase";
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

const TIERS: SubscriptionTier[] = [
  "free",
  "signal",
  "signal_plus",
  "analyst",
  "editor",
];

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
        </div>
      </div>

      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-title">Navigation</div>
          <Link href="/dashboard" className="dash-nav-link">
            Signal Queue
          </Link>
          <Link href="/dashboard/published" className="dash-nav-link active">
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

          {signals.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
              No briefs published yet.
            </div>
          ) : (
            signals.map((sig) => (
              <article
                key={sig.id}
                className="brief-row"
                style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
              >
                <div className="brief-main" style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="brief-title">
                    <Link href={`/briefs/${sig.id}`}>
                      {sig.published_title ?? sig.cluster_summary ?? "Untitled"}
                    </Link>
                  </h3>
                  <div className="meta" style={{ margin: "4px 0 8px" }}>
                    <span className="meta-item">
                      {sig.published_at
                        ? new Date(sig.published_at).toLocaleDateString("en-US", {
                            year: "numeric", month: "long", day: "numeric",
                          })
                        : "—"}
                    </span>
                    <span className="meta-dot" />
                    {sig.primary_domain && (
                      <span className={`tag-pill ${DOMAIN_COLORS[sig.primary_domain] ?? ""}`}>
                        {sig.primary_domain}
                      </span>
                    )}
                  </div>
                  <p className="brief-desc">
                    {sig.cluster_summary ?? ""}
                  </p>
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
                  <Link
                    href={`/briefs/${sig.id}`}
                    className="read"
                    style={{ display: "block", marginTop: "8px", fontSize: "13px" }}
                  >
                    Read →
                  </Link>
                  {isEditor && (
                    <Link
                      href={`/dashboard/review/${sig.id}`}
                      className="btn-light"
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        padding: "6px 10px",
                        display: "inline-block",
                      }}
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