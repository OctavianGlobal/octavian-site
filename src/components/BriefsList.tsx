"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublishedSignal } from "@/types/supabase";

function getFirstLine(body: string | null): string {
  if (!body) return "";
  return (
    body
      .split("\n")
      .find((line) => {
        const t = line.trim();
        return t.length > 0 && !t.startsWith("#") && !t.startsWith("**") && !t.startsWith("*");
      })
      ?.replace(/\*\*/g, "")
      .trim() ?? ""
  );
}

export default function BriefsList({
  initialSignals,
  totalCount,
}: {
  initialSignals: PublishedSignal[];
  totalCount: number;
}) {
  const [signals, setSignals] = useState<PublishedSignal[]>(initialSignals);
  const [loading, setLoading] = useState(false);

  const hasMore = signals.length < totalCount;

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/briefs?offset=${signals.length}&limit=20`);
      const data = await res.json();
      setSignals((prev) => [...prev, ...data.signals]);
    } catch (e) {
      console.error("Failed to load more briefs", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="brief-list" role="list">
        {signals.length === 0 && <p>No briefs published yet.</p>}
        {signals.map((signal) => {
          const firstLine = getFirstLine(signal.published_body_md);
          return (
            <article key={signal.id} className="brief-row" role="listitem">
              <div className="brief-main">
                <h3 className="brief-title">
                  <Link href={`/briefs/${signal.id}`}>
                    {signal.published_title ?? signal.cluster_summary ?? "Untitled"}
                  </Link>
                </h3>
                <div className="meta">
                  <span className="meta-item">
                    Published:{" "}
                    {signal.published_at
                      ? new Date(signal.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                {firstLine && <p className="brief-desc">{firstLine}</p>}
              </div>
              <div className="brief-action">
                <Link className="read" href={`/briefs/${signal.id}`}>
                  Read <span className="arrow">→</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            onClick={loadMore}
            disabled={loading}
            style={{
              padding: "10px 28px",
              fontFamily: "Cinzel, serif",
              fontSize: "12px",
              letterSpacing: "0.12em",
              background: "transparent",
              border: "1px solid #D4AF37",
              color: "#D4AF37",
              borderRadius: "4px",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {loading ? "Loading…" : `Load More  (${signals.length} of ${totalCount})`}
          </button>
        </div>
      )}

      {!hasMore && signals.length > 20 && (
        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "12px", color: "var(--muted)" }}>
          All {totalCount} briefs loaded
        </p>
      )}
    </>
  );
}