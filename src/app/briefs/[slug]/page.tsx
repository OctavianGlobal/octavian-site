import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await (supabase as any)
    .from("signals")
    .select("published_title")
    .eq("id", slug)
    .single();

  return {
    title: data?.published_title
      ? `${data.published_title} — Octavian Global`
      : "Brief — Octavian Global",
  };
}

function parseBrief(md: string) {
  const lines = md.split("\n");
  const sections: { heading: string | null; lines: string[] }[] = [];
  let current: { heading: string | null; lines: string[] } = { heading: null, lines: [] };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current.lines.length > 0 || current.heading) {
        sections.push(current);
      }
      current = { heading: line.replace(/^## /, "").trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length > 0 || current.heading) {
    sections.push(current);
  }
  return sections;
}

export default async function BriefPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: signal, error } = await (supabase as any)
    .from("signals")
    .select(`
      id,
      published_title,
      published_body_md,
      published_at,
      clusters (
        cluster_summary,
        primary_domain
      )
    `)
    .eq("id", slug)
    .eq("status", "published")
    .single();

  if (error || !signal) notFound();

  const cluster = signal.clusters ?? {};
  const sections = signal.published_body_md
    ? parseBrief(signal.published_body_md)
    : [];

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Brief" />

      <main id="main" className="page">
        <section className="section container" style={{ maxWidth: "720px", margin: "0 auto" }}>

          {/* Back link */}
          <div style={{
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: "12px",
            letterSpacing: "0.08em",
            color: "#999",
            marginBottom: "16px",
          }}>
            <Link href="/briefs" style={{ color: "#999", textDecoration: "none" }}>
              ← Briefs
            </Link>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "Cinzel, Georgia, serif",
            fontSize: "clamp(22px, 3vw, 34px)",
            letterSpacing: "0.02em",
            color: "#1a1a1a",
            lineHeight: 1.25,
            marginBottom: "16px",
            fontWeight: 700,
          }}>
            {signal.published_title}
          </h1>

          {/* Meta */}
          <div className="meta" style={{ marginBottom: "32px" }}>
            {signal.published_at && (
              <span className="meta-item">
                {new Date(signal.published_at).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </span>
            )}
            {cluster.primary_domain && (
              <>
                <span className="meta-dot" />
                <span className="meta-item">{cluster.primary_domain}</span>
              </>
            )}
          </div>

          {/* Body */}
          <div style={{
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: "16px",
            lineHeight: 1.8,
            color: "#2a2a2a",
          }}>
            {sections.map((section, i) => (
              <div key={i} style={{ marginBottom: "28px" }}>
                {section.heading && (
                  <p style={{
                    fontWeight: 700,
                    fontSize: "13px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#1a1a1a",
                    marginBottom: "10px",
                  }}>
                    {section.heading}
                  </p>
                )}
                {section.lines
                  .filter(l => l.trim().length > 0)
                  .map((line, j) => {
                    const clean = line
                      .replace(/\*\*(.*?)\*\*/g, "$1")
                      .replace(/\*(.*?)\*/g, "$1")
                      .trim();
                    const isBullet = clean.startsWith("- ") || clean.startsWith("• ");
                    if (isBullet) {
                      return (
                        <div key={j} style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
                          <span style={{ color: "#999", flexShrink: 0 }}>—</span>
                          <span>{clean.replace(/^[-•]\s*/, "")}</span>
                        </div>
                      );
                    }
                    return (
                      <p key={j} style={{ marginBottom: "12px" }}>{clean}</p>
                    );
                  })}
              </div>
            ))}
          </div>

        </section>
      </main>

      <Footer />
    </>
  );
}