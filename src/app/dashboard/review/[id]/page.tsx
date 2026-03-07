"use client";

import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";

const MOCK: Record<string, {
  title: string;
  domain: string;
  tags: string[];
  entities: string[];
  score: number;
  power: number;
  money: number;
  rules: number;
  severity: number;
  confidence: number;
  sources: string[];
  summary: string;
}> = {
  "sig-001": {
    title: "Federal Reserve signals pause in rate cycle amid labor market softening",
    domain: "MONEY",
    tags: ["monetary_policy", "interest_rates"],
    entities: ["United States", "Federal Reserve"],
    score: 0.74,
    power: 1.2,
    money: 4.1,
    rules: 2.8,
    severity: 3.0,
    confidence: 0.91,
    sources: ["Federal Reserve Press Release", "Reuters Economic Feed"],
    summary: "The Federal Reserve issued statements suggesting a rate pause is under consideration following softer-than-expected labor market data. Multiple FOMC members indicated comfort with holding rates steady.",
  },
  "sig-002": {
    title: "USGS reports 6.4 magnitude seismic event near Taiwan Strait",
    domain: "POWER",
    tags: ["natural_disaster", "infrastructure_disruption"],
    entities: ["Taiwan", "China"],
    score: 0.68,
    power: 3.8,
    money: 2.1,
    rules: 0.5,
    severity: 3.5,
    confidence: 0.87,
    sources: ["USGS Earthquake Feed", "GDACS Alert"],
    summary: "USGS recorded a 6.4 magnitude seismic event in the Taiwan Strait region. No tsunami warning issued but infrastructure monitoring is active.",
  },
  "sig-003": {
    title: "European Central Bank updates forward guidance on inflation trajectory",
    domain: "MONEY",
    tags: ["monetary_policy", "inflation"],
    entities: ["European Union", "European Central Bank"],
    score: 0.61,
    power: 0.8,
    money: 3.7,
    rules: 2.2,
    severity: 2.0,
    confidence: 0.88,
    sources: ["ECB Press Release"],
    summary: "The ECB updated its forward guidance signaling a cautious approach to rate adjustments amid mixed inflation data across the eurozone.",
  },
  "sig-004": {
    title: "UN Security Council convenes emergency session on Horn of Africa tensions",
    domain: "POWER",
    tags: ["diplomatic_incident", "military_posture"],
    entities: ["United Nations", "Ethiopia", "Somalia"],
    score: 0.58,
    power: 4.2,
    money: 0.5,
    rules: 1.8,
    severity: 4.0,
    confidence: 0.79,
    sources: ["United Nations Press Release"],
    summary: "The UN Security Council called an emergency session to address escalating tensions between Ethiopia and Somalia over border disputes and militia activity.",
  },
  "sig-005": {
    title: "GDACS issues Level 2 alert for tropical cyclone approaching Indian Ocean coast",
    domain: "ENVIRONMENT",
    tags: ["natural_disaster", "humanitarian_crisis"],
    entities: ["India", "Indian Ocean"],
    score: 0.55,
    power: 1.0,
    money: 1.5,
    rules: 0.8,
    severity: 3.8,
    confidence: 0.93,
    sources: ["GDACS Alert Feed"],
    summary: "GDACS issued a Level 2 alert for a developing tropical cyclone in the Indian Ocean with a projected landfall near the Indian coastline within 72 hours.",
  },
};

export default function ReviewPage() {
  const [sigId] = useState("sig-001");
  const sig = MOCK[sigId];

  const [title, setTitle] = useState(sig?.title ?? "");
  const [confidence, setConfidence] = useState("Medium");
  const [body, setBody] = useState(
    sig
      ? `## Executive Summary\n\n${sig.summary}\n\n## Indicators\n\n- \n- \n- \n\n## Analysis\n\n\n\n## Implications\n\n- \n- \n\n## Watch List\n\n- What would confirm the thesis\n- What would falsify the thesis\n\n## Sources\n\n${sig.sources.map((s) => `- ${s}`).join("\n")}`
      : ""
  );
  const [status, setStatus] = useState<"idle" | "saving" | "published" | "error">("idle");

  if (!sig) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <p>Signal not found.</p>
        <Link href="/dashboard" className="btn-light">← Back to Queue</Link>
      </div>
    );
  }

  async function handlePublish() {
    setStatus("saving");
    try {
      await new Promise((r) => setTimeout(r, 800));
      setStatus("published");
    } catch {
      setStatus("error");
    }
  }

  function handleArchive() {
    if (!confirm("Archive this signal? It will be removed from the queue.")) return;
    alert("Archive (Supabase integration pending)");
  }

  const scorePct = Math.round(sig.score * 100);

  return (
    <>
      <div style={{ background: "var(--black)", padding: "14px 0", borderBottom: "1px solid #222" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <span style={{ fontFamily: "Cinzel, serif", color: "var(--gold)", fontSize: "14px", letterSpacing: "0.16em" }}>
            OCTAVIAN GLOBAL
          </span>
          <span style={{ color: "#333", fontSize: "12px" }}>|</span>
          <span style={{ color: "rgba(212,175,55,0.6)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Review & Publish
          </span>
          <div style={{ flex: 1 }} />
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "0.10em" }}>
            ← Signal Queue
          </Link>
        </div>
      </div>

      <div style={{ background: "var(--paper)", minHeight: "calc(100vh - 120px)" }}>
        <div className="container" style={{ padding: "32px 0" }}>

          {status === "published" ? (
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              maxWidth: "560px",
              margin: "0 auto"
            }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: "22px", color: "#166534", marginBottom: "12px" }}>
                Brief Published
              </div>
              <p style={{ color: "#166534", margin: "0 0 20px" }}>
                The brief is now live on the public site.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <Link className="btn" href="/briefs">View Briefs</Link>
                <Link className="btn-light" href="/dashboard">Back to Queue</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "32px", alignItems: "start" }}>

              <div>
                <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "22px", marginBottom: "24px" }}>
                  Edit & Publish Brief
                </h1>

                <div className="field">
                  <label>Published Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief title as it appears publicly"
                  />
                </div>

                <div className="field">
                  <label>Confidence Level</label>
                  <select value={confidence} onChange={(e) => setConfidence(e.target.value)}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div className="field">
                  <label>Brief Body (Markdown)</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    style={{ minHeight: "480px", fontFamily: "monospace", fontSize: "13px", lineHeight: "1.6" }}
                  />
                </div>

                {status === "error" && (
                  <div className="auth-error">Publish failed. Please try again.</div>
                )}

                <div className="form-actions" style={{ marginTop: "8px" }}>
                  <button
                    className="btn-gold"
                    onClick={handlePublish}
                    disabled={status === "saving" || !title.trim()}
                  >
                    {status === "saving" ? "Publishing…" : "Publish Brief →"}
                  </button>
                  <button className="btn-light" onClick={handleArchive}>
                    Archive Signal
                  </button>
                  <Link href="/dashboard" className="btn-light">Cancel</Link>
                </div>
              </div>

              <div style={{ position: "sticky", top: "24px" }}>
                <div className="card" style={{ padding: "22px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "16px" }}>
                    Signal Intelligence
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
                    <span style={{ fontFamily: "Cinzel, serif", fontSize: "42px", fontWeight: 600, color: "var(--gold)", lineHeight: 1 }}>
                      {scorePct}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--muted)" }}>/ 100</span>
                  </div>

                  <div className="domain-bars" style={{ marginBottom: "18px" }}>
                    {[
                      { label: "Power", value: sig.power, cls: "power" },
                      { label: "Money", value: sig.money, cls: "money" },
                      { label: "Rules", value: sig.rules, cls: "rules" },
                    ].map(({ label, value, cls }) => (
                      <div key={label} className="domain-bar-row">
                        <span className="domain-bar-label">{label}</span>
                        <div className="domain-bar-track">
                          <div
                            className={`domain-bar-fill ${cls}`}
                            style={{ width: `${Math.min((value / 5) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="domain-bar-value">{value.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "14px" }}>
                    <div style={{ marginBottom: "4px" }}>AI Confidence: <strong style={{ color: "var(--ink)" }}>{Math.round(sig.confidence * 100)}%</strong></div>
                    <div style={{ marginBottom: "4px" }}>Severity: <strong style={{ color: "var(--ink)" }}>{sig.severity.toFixed(1)} / 5.0</strong></div>
                    <div>Domain: <strong style={{ color: "var(--ink)" }}>{sig.domain}</strong></div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>Entities</div>
                    <div className="queue-tags">
                      {sig.entities.map((e) => (
                        <span key={e} className="tag-pill">{e}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>Tags</div>
                    <div className="queue-tags">
                      {sig.tags.map((t) => (
                        <span key={t} className="tag-pill" style={{ background: "#f5f5f5" }}>{t.replace(/_/g, " ")}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: "16px", borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>Source Items</div>
                    {sig.sources.map((s) => (
                      <div key={s} style={{ fontSize: "12px", color: "#444", marginBottom: "4px" }}>· {s}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}