import { createServerSupabaseClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sources — Octavian Dashboard",
};

export const dynamic = "force-dynamic";

interface Source {
  id: string;
  name: string;
  type: string | null;
  credibility_weight: number | null;
  is_active: boolean | null;
  feed_url: string | null;
  ingest_method: string | null;
  last_health: string | null;
  last_http_status: number | null;
  last_entries_count: number | null;
  last_checked_at: string | null;
  last_error: string | null;
  status_group: "healthy" | "no-new-items" | "problem" | null;
}

interface Entity {
  id: string;
  name: string;
  type: string | null;
  canonical_key: string | null;
  created_at: string | null;
}

const STATUS_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  healthy:      { bg: "#f0fdf4", color: "#166534", label: "Healthy" },
  "no-new-items": { bg: "#fefce8", color: "#854d0e", label: "No New Items" },
  problem:      { bg: "#fff5f5", color: "#c0392b", label: "Problem" },
};

const TYPE_LABELS: Record<string, string> = {
  institution: "Institution",
  wire: "Wire",
  media: "Media",
  think_tank: "Think Tank",
  tech: "Tech",
  environmental: "Environmental",
};

const ENTITY_TYPE_COLORS: Record<string, string> = {
  country: "#e8eaf6",
  organization: "#e8f5e9",
  company: "#e3f2fd",
  commodity: "#fff8e1",
  technology: "#e0f2f1",
  person: "#fce4ec",
  infrastructure: "#f3e5f5",
  region: "#e8eaf6",
};

function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function SourcesPage() {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  // Fetch sources via view
  const { data: sourcesRaw } = await supabase
    .from("source_health_dashboard")
    .select("*")
    .order("name");

  // Fetch full sources for credibility + feed url
  const { data: sourcesDetail } = await supabase
    .from("sources")
    .select("name, type, credibility_weight, feed_url, ingest_method, is_active, last_http_status, last_entries_count, last_error, last_checked_at")
    .order("name");

  // Merge
  const sourceMap = new Map<string, any>();
  (sourcesDetail ?? []).forEach((s: any) => sourceMap.set(s.name, s));

  const sources: Source[] = (sourcesRaw ?? []).map((s: any) => ({
    ...s,
    ...(sourceMap.get(s.name) ?? {}),
  }));

  // Fetch entities
  const { data: entitiesRaw, count: entityCount } = await supabase
    .from("entities")
    .select("id, name, type, canonical_key, created_at", { count: "exact" })
    .order("name");

  const entities: Entity[] = entitiesRaw ?? [];

  const healthyCount = sources.filter(s => s.status_group === "healthy").length;
  const problemCount = sources.filter(s => s.status_group === "problem").length;
  const noItemsCount = sources.filter(s => s.status_group === "no-new-items").length;

  return (
    <>
      {/* Nav */}
      <div style={{ background: "var(--black)", padding: "14px 0", borderBottom: "1px solid #222", marginTop: "62px" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <span style={{ color: "rgba(212,175,55,0.6)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Analyst Dashboard
          </span>
          <div style={{ flex: 1 }} />
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "0.10em" }}>
            ← Signal Queue
          </Link>
        </div>
      </div>

      <div className="dash-shell">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-title">Navigation</div>
          <Link href="/dashboard" className="dash-nav-link">Signal Queue</Link>
          <Link href="/dashboard/published" className="dash-nav-link">Published Briefs</Link>
          <Link href="/dashboard/archive" className="dash-nav-link">Archive</Link>
          <div style={{ marginTop: "32px" }}>
            <div className="dash-sidebar-title">Admin</div>
            <Link href="/dashboard/sources" className="dash-nav-link active">Sources</Link>
            <Link href="/dashboard/users" className="dash-nav-link">Users</Link>
          </div>
        </aside>

        <main className="dash-main">

          {/* ── Source Health Header ── */}
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Sources</h1>
              <p className="dash-subtitle">
                {sources.length} sources · {healthyCount} healthy · {noItemsCount} no new items · {problemCount} problems
              </p>
            </div>
          </div>

          {/* ── Health summary pills ── */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            {[
              { key: "healthy", count: healthyCount },
              { key: "no-new-items", count: noItemsCount },
              { key: "problem", count: problemCount },
            ].map(({ key, count }) => {
              const s = STATUS_COLOR[key];
              return (
                <div key={key} style={{
                  background: s.bg,
                  color: s.color,
                  border: `1px solid ${s.color}33`,
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "var(--font-jakarta), sans-serif",
                }}>
                  {count} {s.label}
                </div>
              );
            })}
          </div>

          {/* ── Sources Table ── */}
          <div style={{
            border: "1px solid var(--line)",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "48px",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: "var(--font-jakarta), sans-serif" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid var(--line)" }}>
                  {["Source", "Type", "Method", "Status", "HTTP", "Entries", "Credibility", "Last Checked"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontSize: "11px",
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: "#888",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sources.map((s, i) => {
                  const st = STATUS_COLOR[s.status_group ?? "problem"];
                  return (
                    <tr key={s.name} style={{
                      borderBottom: i < sources.length - 1 ? "1px solid var(--line)" : "none",
                      background: i % 2 === 0 ? "#ffffff" : "#fafafa",
                    }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1a1a1a", maxWidth: "200px" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.feed_url ? (
                            <a href={s.feed_url} target="_blank" rel="noopener noreferrer"
                              style={{ color: "#1a1a1a", textDecoration: "underline", textDecorationColor: "#ccc" }}>
                              {s.name}
                            </a>
                          ) : s.name}
                        </div>
                        {s.last_error && (
                          <div style={{ fontSize: "11px", color: "#c0392b", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.last_error}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#555" }}>
                        {s.type ? TYPE_LABELS[s.type] ?? s.type : "—"}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {s.ingest_method ?? "—"}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          background: st?.bg ?? "#f5f5f5",
                          color: st?.color ?? "#555",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}>
                          {st?.label ?? s.last_health ?? "—"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: s.last_http_status === 200 ? "#166534" : "#c0392b", fontVariantNumeric: "tabular-nums" }}>
                        {s.last_http_status ?? "—"}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#555", fontVariantNumeric: "tabular-nums" }}>
                        {s.last_entries_count ?? "—"}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#555", fontVariantNumeric: "tabular-nums" }}>
                        {s.credibility_weight !== null ? s.credibility_weight.toFixed(2) : "—"}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#888", whiteSpace: "nowrap" }}>
                        {fmt(s.last_checked_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Entities Section ── */}
          <div className="dash-header" style={{ marginBottom: "16px" }}>
            <div>
              <h2 className="dash-title" style={{ fontSize: "20px" }}>Entities</h2>
              <p className="dash-subtitle">{entityCount ?? 0} tracked entities</p>
            </div>
          </div>

          {/* Entity type breakdown */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            {Object.entries(
              entities.reduce((acc, e) => {
                const t = e.type ?? "unknown";
                acc[t] = (acc[t] ?? 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} style={{
                background: ENTITY_TYPE_COLORS[type] ?? "#f5f5f5",
                color: "#333",
                borderRadius: "6px",
                padding: "4px 12px",
                fontSize: "12px",
                fontFamily: "var(--font-jakarta), sans-serif",
                fontWeight: 500,
              }}>
                {type} · {count}
              </div>
            ))}
          </div>

          {/* Entities table */}
          <div style={{
            border: "1px solid var(--line)",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "48px",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: "var(--font-jakarta), sans-serif" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid var(--line)" }}>
                  {["Name", "Type", "Canonical Key", "Added"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      fontSize: "11px",
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: "#888",
                      fontWeight: 600,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entities.map((e, i) => (
                  <tr key={e.id} style={{
                    borderBottom: i < entities.length - 1 ? "1px solid var(--line)" : "none",
                    background: i % 2 === 0 ? "#ffffff" : "#fafafa",
                  }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1a1a1a" }}>{e.name}</td>
                    <td style={{ padding: "10px 14px" }}>
                      {e.type && (
                        <span style={{
                          background: ENTITY_TYPE_COLORS[e.type] ?? "#f5f5f5",
                          color: "#333",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 500,
                        }}>
                          {e.type}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#888", fontFamily: "monospace", fontSize: "11px" }}>
                      {e.canonical_key ?? "—"}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#888", whiteSpace: "nowrap" }}>
                      {fmt(e.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      <Footer />
    </>
  );
}