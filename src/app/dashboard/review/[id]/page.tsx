"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, use } from "react";
import Footer from "@/components/Footer";

interface SourceItem {
  title: string | null;
  url: string | null;
  snippet: string | null;
  source_name: string | null;
  source_type: string | null;
}

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
  source_items: SourceItem[];
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

interface SocialTeasers {
  power: string | null;
  money: string | null;
  rules: string | null;
}

const DOMAIN_COLORS: Record<string, string> = {
  POWER: "#e53935",
  MONEY: "#43a047",
  RULES: "#1e88e5",
  ENVIRONMENT: "#00897b",
  TECHNOLOGY: "#8e24aa",
};

// ── Source tier logic ─────────────────────────────────────────────────────────

const SOURCE_TIER: Record<string, { label: string; color: string; bg: string }> = {
  institution:   { label: "1st Tier", color: "#166534", bg: "#f0fdf4" },
  wire:          { label: "2nd Tier", color: "#854d0e", bg: "#fefce8" },
  environmental: { label: "2nd Tier", color: "#854d0e", bg: "#fefce8" },
  media:         { label: "2nd Tier", color: "#854d0e", bg: "#fefce8" },
  tech:          { label: "2nd Tier", color: "#854d0e", bg: "#fefce8" },
  think_tank:    { label: "3rd Tier", color: "#991b1b", bg: "#fff5f5" },
};

function getTier(sourceType: string | null) {
  if (!sourceType) return null;
  return SOURCE_TIER[sourceType] ?? null;
}

// ── Stoplight logic ───────────────────────────────────────────────────────────

type StoplightColor = "green" | "yellow" | "red" | "none";

const STOPLIGHT: Record<StoplightColor, { bg: string; border: string; glow: string }> = {
  green:  { bg: "#22c55e", border: "#16a34a", glow: "rgba(34,197,94,0.4)" },
  yellow: { bg: "#eab308", border: "#ca8a04", glow: "rgba(234,179,8,0.4)" },
  red:    { bg: "#ef4444", border: "#dc2626", glow: "rgba(239,68,68,0.4)" },
  none:   { bg: "#d1d5db", border: "#9ca3af", glow: "transparent" },
};

const THRESHOLDS: Record<string, { green: number; yellow: number }> = {
  signal:        { green: 0.65, yellow: 0.40 },
  evidence:      { green: 0.65, yellow: 0.40 },
  impact:        { green: 0.65, yellow: 0.40 },
  novelty:       { green: 0.55, yellow: 0.35 },
  anomaly:       { green: 0.55, yellow: 0.30 },
  credibility:   { green: 0.70, yellow: 0.45 },
  corroboration: { green: 0.50, yellow: 0.25 },
  domain:        { green: 3.5,  yellow: 2.0  },
};

function getStoplight(key: string, value: number | null | undefined): StoplightColor {
  if (value === null || value === undefined || isNaN(value)) return "none";
  const t = THRESHOLDS[key];
  if (!t) return "none";
  if (value >= t.green) return "green";
  if (value >= t.yellow) return "yellow";
  return "red";
}

function StoplightBubble({ color }: { color: StoplightColor }) {
  const s = STOPLIGHT[color];
  return (
    <span style={{
      display: "inline-block", width: "10px", height: "10px", borderRadius: "50%",
      background: s.bg, border: `1px solid ${s.border}`,
      boxShadow: color !== "none" ? `0 0 4px ${s.glow}` : "none", flexShrink: 0,
    }} />
  );
}

function getOverallReadiness(scorePct: number | null): { label: string; color: StoplightColor; desc: string } {
  if (scorePct === null) return { label: "No Score", color: "none", desc: "Signal has not been scored yet" };
  if (scorePct >= 65) return { label: "Publish", color: "green", desc: "Signal meets publishing threshold" };
  if (scorePct >= 40) return { label: "Consider", color: "yellow", desc: "Review carefully before publishing" };
  return { label: "Hold", color: "red", desc: "Signal does not meet publishing threshold" };
}

function fmt(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return (value * 100).toFixed(0);
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [signal, setSignal] = useState<SignalReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [teasers, setTeasers] = useState<SocialTeasers | null>(null);
  const [validationQuery, setValidationQuery] = useState<string | null>(null);
  const [showTeasers, setShowTeasers] = useState(false);
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

  const handleDraft = useCallback(async () => {
    if (!signal) return;
    setDrafting(true);
    setDraftError("");
    setTeasers(null);
    setValidationQuery(null);
    setShowTeasers(false);
    try {
      const res = await fetch("/api/signals/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal_id: id }),
      });
      if (!res.ok) throw new Error("Draft failed");
      const data = await res.json();
      if (data.draft) setBody(data.draft);
      if (data.teasers) { setTeasers(data.teasers); setShowTeasers(true); }
      if (data.validation_query) setValidationQuery(data.validation_query);
    } catch {
      setDraftError("Draft failed. Try again.");
    } finally {
      setDrafting(false);
    }
  }, [signal, id]);

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
    } catch { setStatus("error"); }
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
    } catch { alert("Archive failed. Please try again."); }
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

  const scorePct = signal.signal_score_raw !== null && !isNaN(signal.signal_score_raw)
    ? Math.round(signal.signal_score_raw * 100)
    : null;

  const rawDomains = (() => {
    if (!signal.domains_jsonb) return [];
    if (Array.isArray(signal.domains_jsonb)) return signal.domains_jsonb;
    if (typeof signal.domains_jsonb === "string") {
      try { return JSON.parse(signal.domains_jsonb); } catch { return []; }
    }
    return [];
  })();
  const domains: string[] = Array.isArray(rawDomains) && rawDomains.length
    ? rawDomains
    : signal.primary_domain ? [signal.primary_domain] : [];

  const readiness = getOverallReadiness(scorePct);
  const readinessStyle = STOPLIGHT[readiness.color];

  // Unique sources with dedup
  const uniqueSources = [...new Map(
    (signal.source_items ?? [])
      .filter((s: SourceItem) => s.source_name)
      .map((s: SourceItem) => [s.source_name, s])
  ).values()];

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

              {/* ── Source context ── */}
              {(signal.source_items ?? []).length > 0 && (
                <div style={{ background: "#fafafa", border: "1px solid #e6e6e6", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#888", marginBottom: "12px", fontFamily: "var(--font-jakarta), sans-serif" }}>
                    Source Items
                  </div>
                  {signal.source_items.map((item, i) => (
                    <div key={i} style={{
                      paddingBottom: i < signal.source_items.length - 1 ? "12px" : "0",
                      marginBottom: i < signal.source_items.length - 1 ? "12px" : "0",
                      borderBottom: i < signal.source_items.length - 1 ? "1px solid #ebebeb" : "none",
                    }}>
                      {item.title && (
                        <div style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: "13px", fontWeight: 600, color: "#1a1a1a", marginBottom: "4px" }}>
                          {item.url ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer"
                              style={{ color: "#1a1a1a", textDecoration: "underline", textDecorationColor: "#ccc" }}>
                              {item.title}
                            </a>
                          ) : item.title}
                        </div>
                      )}
                      {item.url && (
                        <div style={{ fontSize: "11px", color: "#888", marginBottom: item.snippet ? "4px" : "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-jakarta), sans-serif" }}>
                          {item.url}
                        </div>
                      )}
                      {item.snippet && (
                        <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.6, fontFamily: "var(--font-jakarta), sans-serif" }}>
                          {item.snippet}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="field">
                <label>Published Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title as it appears publicly"
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 0 16px" }}>
                <button className="btn-light" onClick={handleDraft} disabled={drafting} style={{ fontSize: "12px" }}>
                  {drafting ? "Drafting…" : body ? "↺ Redraft with AI" : "✦ Get AI Draft"}
                </button>
                {drafting && <span style={{ fontSize: "12px", color: "var(--muted)" }}>Generating brief + social teasers…</span>}
                {draftError && <span style={{ fontSize: "12px", color: "#c62828" }}>{draftError}</span>}
                {!body && !drafting && (
                  <span style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "0.04em" }}>or write the brief manually below</span>
                )}
              </div>

              <div className="field">
                <label>Brief Body (Markdown)</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write the brief here, or click Get AI Draft for a starting point."
                  style={{ minHeight: "460px", fontFamily: "monospace", fontSize: "13px", lineHeight: "1.7", opacity: drafting ? 0.5 : 1, transition: "opacity 0.2s" }}
                />
              </div>

              {/* ── Social teasers panel ── */}
              {teasers && showTeasers && (
                <div style={{ background: "#fafafa", border: "1px solid #e6e6e6", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#888", fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600 }}>
                      Social Teasers
                    </div>
                    <button onClick={() => setShowTeasers(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "12px" }}>Hide</button>
                  </div>
                  {[
                    { key: "power" as const, label: "Power", color: "#e53935" },
                    { key: "money" as const, label: "Money", color: "#43a047" },
                    { key: "rules" as const, label: "Rules", color: "#1e88e5" },
                  ].map(({ key, label, color }) => teasers[key] && (
                    <div key={key} style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color, fontFamily: "Cinzel, serif" }}>{label}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(teasers[key] ?? "")}
                          style={{ background: "none", border: "1px solid #d0d0d0", color: "#888", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", fontFamily: "var(--font-jakarta), sans-serif" }}
                        >
                          Copy
                        </button>
                      </div>
                      <div style={{ fontSize: "12px", color: "#333", lineHeight: 1.6, fontFamily: "var(--font-jakarta), sans-serif", background: "#fff", border: "1px solid #e6e6e6", borderRadius: "6px", padding: "10px 12px" }}>
                        {teasers[key]}
                      </div>
                    </div>
                  ))}
                  {validationQuery && (
                    <div style={{ marginTop: "4px", paddingTop: "14px", borderTop: "1px solid #e6e6e6" }}>
                      <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#888", fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 600, marginBottom: "6px" }}>
                        Validation Query
                      </div>
                      <div style={{ fontSize: "12px", color: "#555", fontFamily: "monospace", background: "#fff", border: "1px solid #e6e6e6", borderRadius: "6px", padding: "8px 12px" }}>
                        {validationQuery}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {status === "error" && (
                <div className="auth-error" style={{ marginBottom: "12px" }}>Publish failed. Please try again.</div>
              )}

              {/* ── Action buttons ABOVE score panel ── */}
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

            {/* ── Right: intelligence panel ── */}
            <div style={{ position: "sticky", top: "24px" }}>
              <div className="card" style={{ padding: "22px" }}>

                <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px" }}>
                  Signal Intelligence
                </div>

                {/* ── Overall readiness banner ── */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  background: readiness.color === "green" ? "rgba(34,197,94,0.08)" : readiness.color === "yellow" ? "rgba(234,179,8,0.08)" : readiness.color === "red" ? "rgba(239,68,68,0.08)" : "#f5f5f5",
                  border: `1px solid ${readinessStyle.border}22`,
                  borderRadius: "8px", padding: "10px 14px", marginBottom: "18px",
                }}>
                  <span style={{
                    width: "12px", height: "12px", borderRadius: "50%", flexShrink: 0,
                    background: readinessStyle.bg, border: `1px solid ${readinessStyle.border}`,
                    boxShadow: readiness.color !== "none" ? `0 0 6px ${readinessStyle.glow}` : "none",
                  }} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, fontFamily: "Cinzel, serif", letterSpacing: "0.08em",
                      color: readiness.color === "green" ? "#166534" : readiness.color === "yellow" ? "#854d0e" : readiness.color === "red" ? "#991b1b" : "#555",
                    }}>
                      {readiness.label}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{readiness.desc}</div>
                  </div>
                </div>

                {/* Signal score */}
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

                {/* Domain score bars with stoplights */}
                <div style={{ marginBottom: "18px" }}>
                  {[
                    { label: "Power", value: signal.power_score, cls: "power" },
                    { label: "Money", value: signal.money_score, cls: "money" },
                    { label: "Rules", value: signal.rules_score, cls: "rules" },
                  ].map(({ label, value, cls }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <span className="domain-bar-label">{label}</span>
                      <div className="domain-bar-track" style={{ flex: 1 }}>
                        <div className={`domain-bar-fill ${cls}`}
                          style={{ width: value !== null && !isNaN(value) ? `${Math.min((value / 5) * 100, 100)}%` : "0%" }} />
                      </div>
                      <span className="domain-bar-value" style={{ width: "28px" }}>
                        {value !== null && !isNaN(value) ? value.toFixed(1) : "—"}
                      </span>
                      <StoplightBubble color={getStoplight("domain", value)} />
                    </div>
                  ))}
                </div>

                {/* Score breakdown with stoplights */}
                <div style={{ borderTop: "1px solid #eee", paddingTop: "14px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "10px" }}>
                    Score Breakdown
                  </div>
                  {[
                    { label: "Evidence",     value: signal.evidence_score,     key: "evidence" },
                    { label: "Impact",       value: signal.impact_score,       key: "impact" },
                    { label: "Novelty",      value: signal.novelty_score,      key: "novelty" },
                    { label: "Anomaly",      value: signal.anomaly_score,      key: "anomaly" },
                    { label: "Credibility",  value: signal.credibility_score,  key: "credibility" },
                    { label: "Corroboration", value: signal.corroboration_score, key: "corroboration" },
                  ].map(({ label, value, key }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                      <span style={{ color: "var(--muted)" }}>{label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums", minWidth: "24px", textAlign: "right" }}>
                          {fmt(value)}
                        </span>
                        <StoplightBubble color={getStoplight(key, value)} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stoplight legend */}
                <div style={{ background: "#f9f9f9", borderRadius: "6px", padding: "8px 12px", marginBottom: "14px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  {[
                    { color: "green" as const, label: "Publish" },
                    { color: "yellow" as const, label: "Consider" },
                    { color: "red" as const, label: "Hold" },
                  ].map(({ color, label }) => (
                    <div key={color} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <StoplightBubble color={color} />
                      <span style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.06em" }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Meta — sources with tier badges */}
                <div style={{ borderTop: "1px solid #eee", paddingTop: "14px", fontSize: "12px", color: "var(--muted)", marginBottom: "16px" }}>
                  {signal.ai_confidence !== null && !isNaN(signal.ai_confidence) && (
                    <div style={{ marginBottom: "8px" }}>
                      AI Confidence: <strong style={{ color: "var(--ink)" }}>{Math.round(signal.ai_confidence * 100)}%</strong>
                    </div>
                  )}
                  <div>
                    <div style={{ marginBottom: "6px" }}>Sources:</div>
                    {uniqueSources.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {uniqueSources.map((s: SourceItem) => {
                          const tier = getTier(s.source_type);
                          return (
                            <div key={s.source_name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <strong style={{ color: "var(--ink)", fontSize: "12px" }}>{s.source_name}</strong>
                              {tier && (
                                <span style={{
                                  fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em",
                                  padding: "2px 6px", borderRadius: "4px",
                                  background: tier.bg, color: tier.color,
                                }}>
                                  {tier.label}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <strong style={{ color: "var(--ink)" }}>
                        {signal.item_count} item{signal.item_count !== 1 ? "s" : ""}
                      </strong>
                    )}
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