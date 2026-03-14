"use client";

import { useState, useEffect } from "react";

interface PipelineRunSummary {
  script: string;
  last_run_at: string | null;
  last_status: string | null;
  last_items_processed: number | null;
  last_items_total: number | null;
  last_api_errors: number | null;
  last_duration_seconds: number | null;
  last_notes: string | null;
  runs_7d: number;
  items_7d: number;
  errors_7d: number;
}

const SCRIPT_LABELS: Record<string, string> = {
  ingest: "Ingest",
  classify: "Classify",
  cluster: "Cluster",
  score: "Score",
  baseline_refresh: "Baseline Refresh",
};

const STATUS_COLOR: Record<string, string> = {
  success: "#166534",
  partial: "#854d0e",
  failed: "#991b1b",
};

const STATUS_BG: Record<string, string> = {
  success: "#f0fdf4",
  partial: "#fefce8",
  failed: "#fff5f5",
};

const STATUS_BORDER: Record<string, string> = {
  success: "#bbf7d0",
  partial: "#fde047",
  failed: "#fecaca",
};

const STATUS_ICON: Record<string, string> = {
  success: "✓",
  partial: "⚠",
  failed: "✗",
};

function timeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PipelineHealthFull() {
  const [runs, setRuns] = useState<PipelineRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  async function fetchHealth() {
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline/health");
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
        setLastFetched(new Date().toLocaleTimeString());
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  const SCRIPT_ORDER = ["ingest", "cluster", "classify", "score", "baseline_refresh"];
  const sorted = [...runs].sort((a, b) =>
    SCRIPT_ORDER.indexOf(a.script) - SCRIPT_ORDER.indexOf(b.script)
  );

  const hasFailure = runs.some(r => r.last_status === "failed");
  const hasPartial = runs.some(r => r.last_status === "partial");
  const overallStatus = hasFailure ? "failed" : hasPartial ? "partial" : "success";

  return (
    <div>
      {/* ── Overall status banner ── */}
      <div style={{
        background: STATUS_BG[overallStatus],
        border: `1px solid ${STATUS_BORDER[overallStatus]}`,
        borderRadius: "8px", padding: "14px 18px",
        display: "flex", alignItems: "center", gap: "12px",
        marginBottom: "24px",
      }}>
        <span style={{
          width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
          background: STATUS_COLOR[overallStatus],
        }} />
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: STATUS_COLOR[overallStatus], fontFamily: "Cinzel, serif", letterSpacing: "0.08em" }}>
            {hasFailure ? "Pipeline Failure Detected" : hasPartial ? "Partial Run" : "All Systems Normal"}
          </div>
          <div style={{ fontSize: "12px", color: "#888", fontFamily: "var(--font-jakarta), sans-serif" }}>
            {lastFetched ? `Last checked ${lastFetched}` : "Checking…"}
          </div>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          style={{ marginLeft: "auto", background: "none", border: "1px solid #d0d0d0", color: "#555", fontSize: "12px", padding: "6px 14px", borderRadius: "6px", cursor: loading ? "default" : "pointer", fontFamily: "var(--font-jakarta), sans-serif" }}
        >
          {loading ? "Refreshing…" : "↺ Refresh"}
        </button>
      </div>

      {/* ── Script cards ── */}
      {loading && runs.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>Loading pipeline data…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {sorted.map((run) => {
            const status = run.last_status ?? "unknown";
            const color = STATUS_COLOR[status] ?? "#555";
            const bg = STATUS_BG[status] ?? "#f5f5f5";
            const border = STATUS_BORDER[status] ?? "#e5e7eb";
            const icon = STATUS_ICON[status] ?? "?";

            return (
              <div key={run.script} style={{ border: "1px solid var(--line)", borderRadius: "10px", overflow: "hidden", background: "#fff" }}>
                {/* Card header */}
                <div style={{ background: bg, borderBottom: `1px solid ${border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color }}>{icon}</span>
                  <span style={{ fontFamily: "Cinzel, serif", fontSize: "14px", fontWeight: 600, color: "#1a1a1a", letterSpacing: "0.06em" }}>
                    {SCRIPT_LABELS[run.script] ?? run.script}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 600, color, background: bg, border: `1px solid ${border}`, padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {status}
                  </span>
                </div>

                {/* Card body */}
                <div style={{ padding: "14px 16px" }}>
                  {run.last_run_at ? (
                    <>
                      <div style={{ fontSize: "13px", color: "#1a1a1a", marginBottom: "8px", fontFamily: "var(--font-jakarta), sans-serif" }}>
                        <strong>Last run:</strong> {timeAgo(run.last_run_at)}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "12px", color: "#555", fontFamily: "var(--font-jakarta), sans-serif" }}>
                        {run.last_items_processed !== null && (
                          <div><span style={{ color: "#888" }}>Items:</span> {run.last_items_processed}{run.last_items_total ? ` / ${run.last_items_total}` : ""}</div>
                        )}
                        {run.last_duration_seconds !== null && (
                          <div><span style={{ color: "#888" }}>Duration:</span> {run.last_duration_seconds.toFixed(1)}s</div>
                        )}
                        {run.last_api_errors !== null && run.last_api_errors > 0 && (
                          <div style={{ color: "#991b1b" }}><span>Errors:</span> {run.last_api_errors}</div>
                        )}
                        <div><span style={{ color: "#888" }}>7d runs:</span> {run.runs_7d}</div>
                        {run.errors_7d > 0 && (
                          <div style={{ color: "#991b1b" }}><span>7d errors:</span> {run.errors_7d}</div>
                        )}
                      </div>
                      {run.last_notes && (
                        <div style={{ marginTop: "8px", fontSize: "11px", color: "#854d0e", background: "#fefce8", border: "1px solid #fde047", borderRadius: "4px", padding: "4px 8px", fontFamily: "var(--font-jakarta), sans-serif" }}>
                          {run.last_notes}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: "12px", color: "#888", fontFamily: "var(--font-jakarta), sans-serif" }}>No runs recorded</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* API credits note */}
      <div style={{ marginTop: "24px", fontSize: "12px", color: "#888", fontFamily: "var(--font-jakarta), sans-serif" }}>
        Anthropic API credits: check{" "}
        <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: "var(--gold)" }}>
          console.anthropic.com
        </a>
      </div>
    </div>
  );
}