import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import Footer from "@/components/Footer";
import OctavianWordmark from "@/components/OctavianWordmark";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Entities — Octavian Dashboard" };
export const dynamic = "force-dynamic";

interface Entity {
  id: string; name: string; type: string | null;
  canonical_key: string | null; created_at: string | null;
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  country: "#e8eaf6", organization: "#e8f5e9", company: "#e3f2fd",
  commodity: "#fff8e1", technology: "#e0f2f1", person: "#fce4ec",
  infrastructure: "#f3e5f5", region: "#e8eaf6",
};

function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function EntitiesPage() {
  await requireAdmin();
  // ✅ Use service client (bypasses RLS) — this page is admin-only so it's safe
  const supabase = createServiceClient();

  const { data: entitiesRaw, count: entityCount } = await supabase
    .from("entities")
    .select("id, name, type, canonical_key, created_at", { count: "exact" })
    .order("type")
    .order("name");

  const entities: Entity[] = (entitiesRaw ?? []) as Entity[];

  const typeCounts = entities.reduce((acc, e) => {
    const t = e.type ?? "unknown";
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
              <h1 className="dash-title">Entities</h1>
              <p className="dash-subtitle">{entityCount ?? 0} tracked entities</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/dashboard/sources" className="btn-light" style={{ fontSize: "12px", padding: "8px 14px" }}>Sources</Link>
              <Link href="/dashboard/pipeline" className="btn-light" style={{ fontSize: "12px", padding: "8px 14px" }}>Pipeline Health</Link>
            </div>
          </div>

          {/* Type breakdown pills */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
            {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} style={{ background: ENTITY_TYPE_COLORS[type] ?? "#f5f5f5", color: "#333", borderRadius: "6px", padding: "4px 12px", fontSize: "12px", fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 500 }}>
                {type} · {count}
              </div>
            ))}
          </div>

          {entities.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
              No entities found.
            </div>
          ) : (
            <div style={{ border: "1px solid var(--line)", borderRadius: "10px", overflow: "hidden", marginBottom: "48px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: "var(--font-jakarta), sans-serif" }}>
                <thead>
                  <tr style={{ background: "#fafafa", borderBottom: "1px solid var(--line)" }}>
                    {["Name", "Type", "Canonical Key", "Added"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#888", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entities.map((e, i) => (
                    <tr key={e.id} style={{ borderBottom: i < entities.length - 1 ? "1px solid var(--line)" : "none", background: i % 2 === 0 ? "#ffffff" : "#fafafa" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1a1a1a" }}>{e.name}</td>
                      <td style={{ padding: "10px 14px" }}>
                        {e.type && (
                          <span style={{ background: ENTITY_TYPE_COLORS[e.type] ?? "#f5f5f5", color: "#333", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 500 }}>{e.type}</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#888", fontFamily: "monospace", fontSize: "11px" }}>{e.canonical_key ?? "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#888", whiteSpace: "nowrap" }}>{fmt(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
