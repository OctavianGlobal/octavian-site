\"use client";

import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";

const MOCK_SIGNALS = [
  {
    id: "sig-001",
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
    published: "2024-03-06",
    status: "candidate",
  },
  {
    id: "sig-002",
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
    published: "2024-03-06",
    status: "candidate",
  },
  {
    id: "sig-003",
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
    published: "2024-03-05",
    status: "candidate",
  },
  {
    id: "sig-004",
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
    published: "2024-03-05",
    status: "candidate",
  },
  {
    id: "sig-005",
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
    published: "2024-03-04",
    status: "candidate",
  },
];

const DOMAIN_COLORS: Record<string, string> = {
  POWER: "power",
  MONEY: "money",
  RULES: "rules",
  TECHNOLOGY: "tech",
  ENVIRONMENT: "env",
};

export default function DashboardPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function handlePublishSelected() {
    if (selected.size === 0) return;
    alert(`Pushing ${selected.size} signal(s) to review queue. (Supabase integration pending)`);
  }

  return (
    <>
      <div style={{ background: "var(--black)", padding: "14px 0", borderBottom: "1px solid #222" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <span style={{ fontFamily: "Cinzel, serif", color: "var(--gold)", fontSize: "14px", letterSpacing: "0.16em" }}>
            OCTAVIAN GLOBAL
          </span>
          <span style={{ color: "#333", fontSize: "12px" }}>|</span>
          <span style={{ color: "rgba(212,175,55,0.6)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Analyst Dashboard
          </span>
          <div style={{ flex: 1 }} />
          <Link href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "0.10em" }}>
            ← Public Site
          </Link>
        </div>
      </div>

      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-title">Navigation</div>
          <Link href="/dashboard" className="dash-nav-link active">Signal Queue</Link>
          <Link href="/dashboard/published" className="dash-nav-link">Published Briefs</Link>
          <Link href="/dashboard/archive" className="dash-nav-link">Archive</Link>
          <div style={{ marginTop: "32px" }}>
            <div className="dash-sidebar-title">Admin</div>
            <Link href="/dashboard/sources" className="dash-nav-link">Sources</Link>
            <Link href="/dashboard/users" className="dash-nav-link">Users</Link>
          </div>
        </aside>

        <main className="dash-main">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Signal Queue</h1>
              <p className="dash-subtitle">
                {MOCK_SIGNALS.length} candidate signals · Select up to 5 to push to review
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {selected.size > 0 && (
                <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                  {selected.size} selected
                </span>
              )}
              <button
                className="btn-gold"
                onClick={handlePublishSelected}
                disabled={selected.size === 0}
                style={{ opacity: selected.size === 0 ? 0.4 : 1 }}
              >
                Push to Review →
              </button>
            </div>
          </div>

          {MOCK_SIGNALS.map((sig) => (
            <div
              key={sig.id}
              className={`queue-row${selected.has(sig.id) ? " selected" : ""}`}
            >
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <input
                    type="checkbox"
                    checked={selected.has(sig.id)}
                    onChange={() => toggleSelect(sig.id)}
                    style={{ marginTop: "4px", accentColor: "var(--gold)", cursor: "pointer" }}
                    disabled={!selected.has(sig.id) && selected.size >= 5}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="queue-title">{sig.title}</div>
                    <div className="meta" style={{ margin: "4px 0 8px" }}>
                      <span className="meta-item">{sig.published}</span>
                      <span className="meta-dot" />
                      <span className={`tag-pill ${DOMAIN_COLORS[sig.domain] ?? ""}`}>{sig.domain}</span>
                      <span className="meta-item" style={{ color: "var(--muted)" }}>
                        AI conf: {Math.round(sig.confidence * 100)}%
                      </span>
                    </div>

                    <div className="queue-tags">
                      {sig.entities.map((e) => (
                        <span key={e} className="tag-pill">{e}</span>
                      ))}
                      {sig.tags.map((t) => (
                        <span key={t} className="tag-pill" style={{ background: "#f5f5f5" }}>
                          {t.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>

                    {expanded === sig.id && (
                      <div className="domain-bars" style={{ marginTop: "14px", maxWidth: "360px" }}>
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
                    )}

                    <button
                      onClick={() => toggleExpand(sig.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--muted)",
                        fontSize: "11px",
                        letterSpacing: "0.08em",
                        cursor: "pointer",
                        marginTop: "10px",
                        padding: 0,
                        textTransform: "uppercase",
                      }}
                    >
                      {expanded === sig.id ? "▲ Less" : "▼ Domain scores"}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="queue-score">{Math.round(sig.score * 100)}</div>
                <div className="queue-score-label">Signal Score</div>
                <Link
                  href={`/dashboard/review/${sig.id}`}
                  className="btn-light"
                  style={{ marginTop: "10px", fontSize: "12px", padding: "8px 12px" }}
                >
                  Edit & Publish
                </Link>
              </div>
            </div>
          ))}
        </main>
      </div>

      <Footer />
    </>
  );
}