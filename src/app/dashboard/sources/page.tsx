import { createServerSupabaseClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import Footer from "@/components/Footer";
import OctavianWordmark from "@/components/OctavianWordmark";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sources — Octavian Dashboard" };
export const dynamic = "force-dynamic";

interface Source {
  id: string; name: string; type: string | null; credibility_weight: number | null;
  is_active: boolean | null; feed_url: string | null; ingest_method: string | null;
  last_health: string | null; last_http_status: number | null; last_entries_count: number | null;
  last_checked_at: string | null; last_error: string | null;
  status_group: "healthy" | "no-new-items" | "problem" | null;
}

const STATUS_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  healthy:        { bg: "#f0fdf4", color: "#166534", label: "Healthy" },
  "no-new-items": { bg: "#fefce8", color: "#854d0e", label: "No New Items" },
  problem:        { bg: "#fff5f5", color: "#c0392b", label: "Problem" },
};

const TYPE_LABELS: Record<string, string> = {
  institution: "Institution", wire: "Wire", media: "Media",
  think_tank: "Think Tank", tech: "Tech", environmental: "Environmental",
};

function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function SourcesPage() {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data: sourcesRaw } = await supabase
    .from("source_health_dashboard").select("*").order("name");

  const { data: sourcesDetail } = await supabase
    .from("sources")
    .select("name, type, credibility_weight, feed_url, ingest_method, is_active, last_http_status, last_entries_count, last_error, last_checked_at")
    .order("name");

  const sourceMap = new Map<string, any>();
  (sourcesDetail ?? []).forEach((s: any) => sourceMap.set(s.name, s));
  const sources: Source[] = (sourcesRaw ?? []).map((s: any) => ({ ...s, ...(sourceMap.get(s.name) ?? {}) }));

  const healthyCount  = sources.filter(s => s.status_group === "healthy").length;
  const problemCount  = sources.filter(s => s.status_group === "problem").length;
  const noItemsCount  = sources.filter(s => s.status_group === "no-new-items").length;
  const activeCount   = sources.filter(s => s.is_active).length;
  const inactiveCount = sources.filter(s => !s.is_active).length;

  return (
    <>
      <div style={{ background: "#0a0a0a", paddingTop: "82px", paddingBottom: "28px", textAlign: "center", borderBottom: "1px solid #1a1a1a" }}>
        <div className="container">
          <Link href="/home" style={{ display: "inline-block", marginBottom: "10px" }}>
            <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 2L44 10V28C44 40 34 50 24 54C14 50 4 40 4 28V10L24 2Z" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
              <path d="M24 12L36 17V28C36 35.5 30.5 42 24 44.5C17.5 42 12 35.5 12 28V17L24 12Z" fill="#D4AF37" fillOpacity="0.08" stroke="#D4AF37" strokeWidth="0.75" />
            </svg>
          </Link>
          <div><OctavianWordmark size={28} color="#D4AF37" letterSpacing="0.28em" /></div>
        </div>
      </div>

      <div style={{ background: "var(--paper)", minHeight: "calc(100vh - 200px)" }}>
        <div className="container" style={{ padding: "32px 0" }}>
          <div style={{ marginBottom: "8px" }}>
            <Link href="/dashboard" style={{ color: "rgba(0,0,0,0.4)", fontSize: "12px", letterSpacing: "0.08em" }}>← Signal Queue</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--line)" }}>
            <div>
              <h1 className="dash-title">Sources</h1>
              <p className="dash-subtitle">
                {sources.length} total · {activeCount} active · {inactiveCount} inactive · {healthyCount} healthy · {noItemsCount} no new items · {problemCount} problems
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/dashboard/entities" className="btn-light" style={{ fontSize: "12px", padding: "8px 14px" }}>Entities</Link>
              <Link href="/dashboard/pipeline" className="btn-light" style={{ fontSize: "12px", padding: "8px 14px" }}>Pipeline Health</Link>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            {[
              { key: "healthy",        count: healthyCount },
              { key: "no-new-items",   count: noItemsCount },
              { key: "problem",        count: problemCount },
            ].map(({ key, count }) => {
              const s = STATUS_COLOR[key];
              return (
                <div key={key} style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33`, borderRadius: "6px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-jakarta), sans-serif" }}>
                  {count} {s.label}
                </div>
              );
            })}
            <div style={{ background: "#f5f5f5", color: "#555", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-jakarta), sans-serif" }}>
              {activeCount} Active
            </div>
            <div style={{ background: "#f5f5f5", color: "#aaa", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-jakarta), sans-serif" }}>
              {inactiveCount} Inactive
            </div>
          </div>

          <div style={{ border: "1px solid var(--line)", borderRadius: "10px", overflow: "hidden", marginBottom: "48px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: "var(--font-jakarta), sans-serif" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid var(--line)" }}>
                  {["Source", "Type", "Method", "Active", "Status", "HTTP", "Entries", "Last Checked"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#888", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sources.map((s, i) => {
                  const st = STATUS_COLOR[s.status_group ?? "problem"];
                  const isInactive = !s.is_active;
                  return (
                    <tr key={s.name} style={{
                      borderBottom: i < sources.length - 1 ? "1px solid var(--line)" : "none",
                      background: isInactive ? "#fafafa" : i % 2 === 0 ? "#ffffff" : "#fafafa",
                      opacity: isInactive ? 0.6 : 1,
                    }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1a1a1a", maxWidth: "200px" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.feed_url ? (
                            <a href={s.feed_url} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1a1a", textDecoration: "underline", textDecorationColor: "#ccc" }}>{s.name}</a>
                          ) : s.name}
                        </div>
                        {s.last_error && (
                          <div style={{ fontSize: "11px", color: "#c0392b", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.last_error}</div>
                        )}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#555" }}>{s.type ? TYPE_LABELS[s.type] ?? s.type : "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.ingest_method ?? "—"}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        {s.is_active ? (
                          <span style={{ color: "#166534", fontSize: "14px" }}>✓</span>
                        ) : (
                          <span style={{ color: "#ccc", fontSize: "14px" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ background: st?.bg ?? "#f5f5f5", color: st?.color ?? "#555", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {st?.label ?? s.last_health ?? "—"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: s.last_http_status === 200 ? "#166534" : "#c0392b", fontVariantNumeric: "tabular-nums" }}>{s.last_http_status ?? "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#555", fontVariantNumeric: "tabular-nums" }}>{s.last_entries_count ?? "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#888", whiteSpace: "nowrap" }}>{fmt(s.last_checked_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}