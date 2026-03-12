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

function renderInline(text: string): React.ReactNode[] {
  // Split on **bold** markers and render accordingly
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ fontWeight: 700, color: "#1a1a1a" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part.replace(/\*(.*?)\*/g, "$1")}</span>;
  });
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
            marginBottom: "24px",
          }}>
            <Link href="/briefs" style={{ color: "#999", textDecoration: "none" }}>
              ← Briefs
            </Link>
          </div>

          {/* Domain tag */}
          {cluster.primary_domain && (
            <div style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: "10px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#D4AF37",
              fontWeight: 700,
              marginBottom: "12px",
            }}>
              {cluster.primary_domain}
            </div>
          )}

          {/* Title */}
          <h1 style={{
            fontFamily: "Cinzel, Georgia, serif",
            fontSize: "clamp(22px, 3vw, 36px)",
            letterSpacing: "0.01em",
            color: "#1a1a1a",
            lineHeight: 1.2,
            marginBottom: "20px",
            fontWeight: 700,
          }}>
            {signal.published_title}
          </h1>

          {/* Date */}
          {signal.published_at && (
            <div style={{
              fontFamily: "var(--font-jakarta), sans-serif",
              fontSize: "12px",
              color: "#999",
              letterSpacing: "0.06em",
              marginBottom: "40px",
              paddingBottom: "24px",
              borderBottom: "1px solid #e8e8e8",
            }}>
              {new Date(signal.published_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
              })}
            </div>
          )}

          {/* Body */}
          <div style={{
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: "16px",
            lineHeight: 1.8,
            color: "#2a2a2a",
          }}>
            {sections.map((section, i) => (
              <div key={i} style={{ marginBottom: "32px" }}>
                {section.heading && (
                  <h2 style={{
                    fontFamily: "Cinzel, Georgia, serif",
                    fontWeight: 700,
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#1a1a1a",
                    marginBottom: "12px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #e8e8e8",
                  }}>
                    {section.heading}
                  </h2>
                )}
                {section.lines
                  .filter(l => l.trim().length > 0)
                  .map((line, j) => {
                    const trimmed = line.trim();
                    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("• ");

                    if (isBullet) {
                      const content = trimmed.replace(/^[-•]\s*/, "");
                      return (
                        <div key={j} style={{
                          display: "flex",
                          gap: "12px",
                          marginBottom: "10px",
                          alignItems: "flex-start",
                        }}>
                          <span style={{
                            color: "#D4AF37",
                            flexShrink: 0,
                            marginTop: "2px",
                            fontSize: "14px",
                          }}>—</span>
                          <span>{renderInline(content)}</span>
                        </div>
                      );
                    }

                    return (
                      <p key={j} style={{ marginBottom: "14px" }}>
                        {renderInline(trimmed)}
                      </p>
                    );
                  })}
              </div>
            ))}
          </div>

          {/* Footer rule */}
<div style={{
  marginTop: "48px",
  paddingTop: "24px",
  borderTop: "1px solid #e8e8e8",
  fontFamily: "var(--font-jakarta), sans-serif",
  fontSize: "11px",
  letterSpacing: "0.10em",
  color: "#bbb",
  textTransform: "uppercase",
  textAlign: "center",
}}>
  Octavian Global · Signal Intelligence
</div>

        </section>
      </main>

      <Footer />
    </>
  );
}