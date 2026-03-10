"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, use } from "react";
import Footer from "@/components/Footer";

interface SignalReviewData {
  id: string;
  cluster_id: string;
  status: string;
  created_at: string;
  published_title: string | null;
  published_body_md: string | null;
  cluster_summary: string | null;
  primary_domain: string | null;
  domains_jsonb: string[];
  entity_names: string[];
  tag_names: string[];
  item_count: number;
  signal_score_raw: number | null;
  power_score: number | null;
  money_score: number | null;
  rules_score: number | null;
  ai_confidence: number | null;
  evidence_score: number | null;
  impact_score: number | null;
  novelty_score: number | null;
  anomaly_score: number | null;
  credibility_score: number | null;
  corroboration_score: number | null;
  severity_modifier: number | null;
}

const DOMAIN_COLORS: Record<string, string> = {
  POWER: "#e53935",
  MONEY: "#43a047",
  RULES: "#1e88e5",
  ENVIRONMENT: "#00897b",
  TECHNOLOGY: "#8e24aa",
};

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [signal, setSignal] = useState<SignalReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "published" | "archived" | "error">("idle");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/signals/review/${id}`);
      if (!res.ok) { setNotFound(true); setLoading(false); return; }
      const data: SignalReviewData = await res.json();
      setSignal(data);
      setTitle(data.published_title ?? data.cluster_summary ?? "");
      setBody(data.published_body_md ?? "");
      setLoading(false);
    }
    load();
  }, [id]);

  // ── NO auto-draft on load — editor decides when to use AI ──

  const handleDraft = useCallback(async () => {
    if (!signal) return;
    setDrafting(true);
    setDraftError("");
    try {
      const res = await fetch("/api/signals/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal_id: id }),
      });
      if (!res.ok) throw new Error("Draft failed");
      const { draft, suggested_title } = await res.json();
      setBody(draft);
      if (suggested_title && !title) setTitle(suggested_title);
    } catch {
      setDraftError("Draft failed. Try again.");
    } finally {
      setDrafting(false);
    }
  }, [signal, id, title]);

  async function handlePublish() {
    if (!title.trim()) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/signals/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signal_id: id,
          published_title: title.trim(),
          published_body_md: body.trim(),
        }),
      });
      if (!res.ok) throw new Error("Publish failed");
      setStatus("published");
    } catch {
      setStatus("error");
    }
  }

  async function handleArchive() {
    if (!confirm("Archive this signal? It will be removed from the queue.")) return;
    try {
      const res = await fetch("/api/signals/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal_id: id }),
      });
      if (!res.ok) throw new Error("Archive failed");
      setStatus("archived");
    } catch {
      alert("Archive failed. Please try again.");
    }
  }

  if (loading) return (
    <div style={{ padding: "80px", textAlign: "center", color: "var(--muted)" }}>Loading signal…</div>
  );

  if (notFound || !signal) return (
    <div style={{ padding: "80px", textAlign: "center" }}>
      <p style={{ color: "var(--muted)", marginBottom: "16px" }}>Signal not found.</p>
      <Link href="/dashboard" className="btn-light">← Back to Queue</Link>
    </div>
  );

  const scorePct = signal.signal_score_raw !== null ? Math.round(signal.signal_score_raw * 100) : null;
  const domains: string[] = signal.domains_jsonb?.length ? signal.domains_jsonb : signal.primary_domain ? [signal.primary_domain] : [];

  if (status === "published") return (
    <>
      <NavBar />
      <div style={{ background: "var(--paper)", minHeight: "calc(100vh - 120px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "40px", textAlign: "center", maxWidth: "480px" }}>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: "#166534", marginBottom: "12px" }}>Brief Published</div>
          <p style={{ color: "#166534", margin: "0 0 24px" }}>The brief is now live on the public site.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link className="btn" href="/briefs">View Briefs</Link>
            <Link className="btn-light" href="/dashboard">Back to Queue</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );

  if (status === "archived") return (
    <>
      <NavBar />
      <div style={{ background: "var(--paper)", minHeight: "calc(100vh - 120px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff8f0", border: "1px solid #fed7aa", borderRadius: "12px", padding: "40px", textAlign: "center", maxWidth: "480px" }}>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: "#92400e", marginBottom: "12px" }}>Signal Archived</div>
          <p style={{ color: "#92400e", margin: "0 0 24px" }}>This signal has been removed from the queue.</p>
          <Link className="btn-light" href="/dashboard">Back to Queue</Link>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <NavBar />
      <div style={{ background: "var(--paper)", minHeight: "calc(100vh - 120px)" }}>
        <div className="container" style={{ padding: "32px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>

            {/* ── Left: editor ── */}
            <div>
              <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "20px", marginBottom: "6px" }}>Edit & Publish Brief</h1>
              <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "24px" }}>
                Signal detected {signal.created_at?.slice(0, 10)} · {signal.item_count} source item{signal.item_count !== 1 ? "s" : ""}
              </p>

              <div className="field">
                <label>Published Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title as it appears publicly"
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 0 16px" }}>
                <button
                  className="btn-light"
                  onClick={handleDraft}
                  disabled={drafting}
                  style={{ fontSize: "12px" }}
                >
                  {drafting ? "Drafting…" : body ? "↺ Redraft with AI" : "✦ Get AI Draft"}
                </button>
                {drafting && (
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Generating brief…</span>
                )}
                {draftError && (
                  <span style={{ fontSize: "12px", color: "#c62828" }}>{draftError}</span>
                )}
                {!body && !drafting && (
                  <span style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "0.04em" }}>
                    or write the brief manually below
                  </span>
                )}
              </div>

              <div className="field">
                <label>Brief Body (Markdown)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write the brief here, or click Get AI Draft for a starting point."
                  style={{
                    minHeight: "460px",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    lineHeight: "1.7",
                    opacity: drafting ? 0.5 : 1,
                    transition: "opacity 0.2s",
                  }}
                />
              </div>

              {status === "error" && (
                <div className="auth-error" style={{ marginBottom: "12px" }}>Publish failed. Please try again.</div>
              )}

              <div className="form-actions" style={{ marginTop: "8px" }}>
                <button
                  className="btn-gold"
                  onClick={handlePublish}
                  disabled={status === "saving" || !title.trim() || drafting}
                >
                  {status === "saving" ? "Publishing…" : "Publish Brief →"}
                </button>
                <button className="btn-light" onClick={handleArchive}>Archive Signal</button>
                <Link href="/dashboard" className="btn-light">Cancel</Link>
              </div>
            </div>

            {/* ── Right: full intelligence panel ── */}
            <div style={{ position: "sticky", top: "24px" }}>
              <div className="card" style={{ padding: "22px" }}>

                {/* Signal score */}
                <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px" }}>
                  Signal Intelligence
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontFamily: "Cinzel, serif", fontSize: "42px", fontWeight: 600, color: "var(--gold)", lineHeight: 1 }}>
                    {scorePct !== null ? scorePct : "—"}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>/ 100</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "18px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Signal Score
                </div>

                {/* Domain pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                  {domains.map((d) => (
                    <span key={d} style={{
                      fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
                      padding: "3px 8px", borderRadius: "4px",
                      border: `1px solid ${DOMAIN_COLORS[d] ?? "#999"}`,
                      color: DOMAIN_COLORS[d] ?? "#999", background: "transparent",
                    }}>
                      {d}
                    </span>
                  ))}
                </div>

                {/* Domain score bars */}
                <div style={{ marginBottom: "18px" }}>
                  {[
                    { label: "Power", value: signal.power_score, cls: "power" },
                    { label: "Money", value: signal.money_score, cls: "money" },
                    { label: "Rules", value: signal.rules_score, cls: "rules" },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="domain-bar-row">
                      <span className="domain-bar-label">{label}</span>
                      <div className="domain-bar-track">
                        <div className={`domain-bar-fill ${cls}`}
                          style={{ width: value !== null ? `${Math.min((value / 5) * 100, 100)}%` : "0%" }} />
                      </div>
                      <span className="domain-bar-value">{value !== null ? value.toFixed(1) : "—"}</span>
                    </div>
                  ))}
                </div>

                {/* Score components */}
                <div style={{ borderTop: "1px solid #eee", paddingTop: "14px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>
                    Score Breakdown
                  </div>
                  {[
                    { label: "Evidence", value: signal.evidence_score },
                    { label: "Impact", value: signal.impact_score },
                    { label: "Novelty", value: signal.novelty_score },
                    { label: "Anomaly", value: signal.anomaly_score },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                      <span style={{ color: "var(--muted)" }}>{label}</span>
                      <span style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                        {value !== null ? (value * 100).toFixed(0) : "—"}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                    <span style={{ color: "var(--muted)" }}>Credibility</span>
                    <span style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                      {signal.credibility_score !== null ? (signal.credibility_score * 100).toFixed(0) : "—"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "var(--muted)" }}>Corroboration</span>
                    <span style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                      {signal.corroboration_score !== null ? (signal.corroboration_score * 100).toFixed(0) : "—"}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div style={{ borderTop: "1px solid #eee", paddingTop: "14px", fontSize: "12px", color: "var(--muted)", marginBottom: "16px" }}>
                  {signal.ai_confidence !== null && (
                    <div style={{ marginBottom: "4px" }}>
                      AI Confidence: <strong style={{ color: "var(--ink)" }}>{Math.round(signal.ai_confidence * 100)}%</strong>
                    </div>
                  )}
                  <div>
                    Sources: <strong style={{ color: "var(--ink)" }}>{signal.item_count} item{signal.item_count !== 1 ? "s" : ""}</strong>
                  </div>
                </div>

                {/* Entities */}
                {(signal.entity_names ?? []).length > 0 && (
                  <div style={{ borderTop: "1px solid #eee", paddingTop: "14px", marginBottom: "14px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>Entities</div>
                    <div className="queue-tags">
                      {(signal.entity_names ?? []).map((e) => (
                        <span key={e} className="tag-pill">{e}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {(signal.tag_names ?? []).length > 0 && (
                  <div style={{ borderTop: "1px solid #eee", paddingTop: "14px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>Tags</div>
                    <div className="queue-tags">
                      {(signal.tag_names ?? []).map((t) => (
                        <span key={t} className="tag-pill" style={{ background: "#f5f5f5" }}>
                          {t.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function NavBar() {
  return (
    <div style={{ background: "var(--black)", padding: "14px 0", borderBottom: "1px solid #222" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <span style={{ fontFamily: "Cinzel, serif", color: "var(--gold)", fontSize: "14px", letterSpacing: "0.16em" }}>OCTAVIAN GLOBAL</span>
        <span style={{ color: "#333", fontSize: "12px" }}>|</span>
        <span style={{ color: "rgba(212,175,55,0.6)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Review & Publish</span>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "0.10em" }}>← Signal Queue</Link>
      </div>
    </div>
  );
}