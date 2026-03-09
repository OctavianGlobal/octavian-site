"use client";

// ============================================================
// src/components/PipelineHealth.tsx
// Octavian Global — Pipeline health widget for analyst dashboard
// Shows last run status, item counts, and 7-day summary per script
// ============================================================

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
  baseline_refresh: "Baseline",
};

const STATUS_COLOR: Record<string, string> = {
  success: "#4caf50",
  partial: "#ff9800",
  failed: "#f44336",
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

export default function PipelineHealth() {
  const [open, setOpen] = useState(false);
  const [runs, setRuns] = useState<PipelineRunSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  useEffect(() => {
    if (open && !lastFetched) {
      fetchHealth();
    }
  }, [open]);

  async function fetchHealth() {
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline/health");
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
        setLastFetched(Date.now());
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  // Compute overall health for the button indicator
  const hasFailure = runs.some((r) => r.last_status === "failed");
  const hasPartial = runs.some((r) => r.last_status === "partial");
  const hasNoData = runs.length === 0 || runs.every((r) => r.last_run_at === null);
  const overallColor = hasNoData
    ? "#555"
    : hasFailure
    ? STATUS_COLOR.failed
    : hasPartial
    ? STATUS_COLOR.partial
    : STATUS_COLOR.success;

  return (
    <div style={{ marginTop: "24px" }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "8px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textAlign: "left",
        }}
      >
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: overallColor,
            flexShrink: 0,
            boxShadow: `0 0 6px ${overallColor}`,
          }}
        />
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-sans, Arial)",
          }}
        >
          Pipeline Health
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "10px",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Expanded panel */}
      {open && (
        <div
          style={{
            margin: "4px 12px 12px",
            background: "#0d0d0d",
            border: "1px solid #1e1e1e",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              borderBottom: "1px solid #1e1e1e",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              Last 7 days
            </span>
            <button
              onClick={fetchHealth}
              disabled={loading}
              style={{
                background: "none",
                border: "none",
                color: "rgba(212,175,55,0.5)",
                fontSize: "10px",
                cursor: "pointer",
                padding: 0,
                letterSpacing: "0.08em",
              }}
            >
              {loading ? "…" : "↺ refresh"}
            </button>
          </div>

          {/* Script rows */}
          {loading && runs.length === 0 ? (
            <div
              style={{
                padding: "16px 12px",
                textAlign: "center",
                fontSize: "11px",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              Loading…
            </div>
          ) : (
            runs.map((run) => {
              const statusColor = run.last_status
                ? STATUS_COLOR[run.last_status] ?? "#555"
                : "#333";
              const statusIcon = run.last_status
                ? STATUS_ICON[run.last_status] ?? "?"
                : "—";

              return (
                <div
                  key={run.script}
                  style={{
                    padding: "8px 12px",
                    borderBottom: "1px solid #141414",
                    display: "grid",
                    gridTemplateColumns: "14px 1fr auto",
                    gap: "8px",
                    alignItems: "start",
                  }}
                >
                  {/* Status icon */}
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: statusColor,
                      lineHeight: "16px",
                    }}
                  >
                    {statusIcon}
                  </span>

                  {/* Script info */}
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.7)",
                        letterSpacing: "0.06em",
                        marginBottom: "2px",
                      }}
                    >
                      {SCRIPT_LABELS[run.script] ?? run.script}
                    </div>
                    {run.last_run_at ? (
                      <div
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.25)",
                        }}
                      >
                        {timeAgo(run.last_run_at)}
                        {run.last_items_processed !== null &&
                          ` · ${run.last_items_processed} items`}
                        {run.last_duration_seconds !== null &&
                          ` · ${run.last_duration_seconds.toFixed(1)}s`}
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.2)",
                        }}
                      >
                        No runs recorded
                      </div>
                    )}
                    {run.last_notes && (
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#ff9800",
                          marginTop: "2px",
                        }}
                      >
                        {run.last_notes}
                      </div>
                    )}
                  </div>

                  {/* 7-day summary */}
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.25)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {run.runs_7d}× / 7d
                    </div>
                    {run.errors_7d > 0 && (
                      <div
                        style={{
                          fontSize: "10px",
                          color: STATUS_COLOR.failed,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {run.errors_7d} err
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Classify credit note */}
          <div
            style={{
              padding: "8px 12px",
              fontSize: "10px",
              color: "rgba(255,255,255,0.15)",
              borderTop: "1px solid #141414",
              lineHeight: "1.5",
            }}
          >
            API credits: check{" "}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: "rgba(212,175,55,0.4)", textDecoration: "none" }}
            >
              console.anthropic.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
