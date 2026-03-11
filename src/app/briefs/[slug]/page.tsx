import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSignalById } from "@/lib/queries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brief = await getSignalById(slug);
  if (!brief) return { title: "Brief Not Found — Octavian Global" };
  return {
    title: `${brief.published_title} — Octavian Global`,
    description: brief.cluster_summary ?? "",
  };
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function parseBrief(md: string) {
  const lines = md
    .replace(/\*\*([^*]+)\*\*/g, (_, inner) => `__BOLD__${inner}__BOLD__`)
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const sections: { type: string; content: string }[] = [];

  for (const line of lines) {
    const clean = line.replace(/__BOLD__/g, "");
    const isBold = line.startsWith("__BOLD__") && line.endsWith("__BOLD__");
    const isBullet = line.startsWith("- ");

    if (isBold && ["Signal", "Why It Matters", "Watch", "Sources"].includes(clean)) {
      sections.push({ type: "heading", content: clean });
    } else if (isBold && !isBullet) {
      sections.push({ type: "title", content: clean });
    } else if (isBullet) {
      sections.push({ type: "bullet", content: line.replace(/^- /, "") });
    } else {
      sections.push({ type: "paragraph", content: line });
    }
  }

  return sections;
}

export default async function BriefPage({ params }: Props) {
  const { slug } = await params;
  const brief = await getSignalById(slug);
  if (!brief) notFound();

  const sections = brief.published_body_md ? parseBrief(brief.published_body_md) : [];

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Strategic Intelligence" />

      <main id="main" className="page">
        <section className="section container" style={{ maxWidth: "720px", margin: "0 auto" }}>
{/* Breadcrumb */}
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
            fontSize: "clamp(20px, 3vw, 30px)",
            letterSpacing: "0.04em",
            color: "#1a1a1a",
            lineHeight: 1.3,
            marginBottom: "12px",
            fontWeight: 700,
          }}>
            {brief.published_title}
          </h1>

          {/* Meta */}
          <div style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            marginBottom: "40px",
            paddingBottom: "20px",
            borderBottom: "1px solid rgba(0,0,0,0.12)",
          }}>
            <span style={{
              fontSize: "13px",
              color: "#888",
              fontFamily: "var(--font-jakarta), sans-serif",
            }}>
              {formatDate(brief.published_at)}
            </span>
            {brief.primary_domain && (
              <>
                <span style={{ color: "#ccc", fontSize: "12px" }}>·</span>
                <span style={{
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#888",
                  fontFamily: "var(--font-jakarta), sans-serif",
                }}>
                  {brief.primary_domain}
                </span>
              </>
            )}
          </div>

          {/* Body */}
          <article style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
            {sections.map((s, i) => {

              // Skip duplicate title — published_title handles it
              if (s.type === "title") return null;

              if (s.type === "heading") return (
                <div key={i} style={{
                  marginTop: "36px",
                  marginBottom: "14px",
                }}>
                  <span style={{
                    fontFamily: "var(--font-jakarta), sans-serif",
                    fontSize: "13px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#1a1a1a",
                    fontWeight: 700,
                  }}>
                    {s.content}
                  </span>
                </div>
              );

              if (s.type === "bullet") return (
                <div key={i} style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "10px",
                  paddingLeft: "4px",
                }}>
                  <span style={{
                    color: "#999",
                    fontSize: "14px",
                    flexShrink: 0,
                    marginTop: "3px",
                  }}>—</span>
                  <span style={{
                    fontSize: "15px",
                    lineHeight: 1.7,
                    color: "#2a2a2a",
                    fontFamily: "var(--font-jakarta), sans-serif",
                  }}>
                    {s.content}
                  </span>
                </div>
              );

              return (
                <p key={i} style={{
                  fontSize: "16px",
                  lineHeight: 1.8,
                  color: "#2a2a2a",
                  marginBottom: "16px",
                  fontFamily: "var(--font-jakarta), sans-serif",
                }}>
                  {s.content}
                </p>
              );
            })}
          </article>

          {/* Back links */}
          <div className="cta-row" style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(0,0,0,0.1)",
          }}>
            <Link className="btn-light" href="/briefs">← All Briefs</Link>
            <Link className="btn-light" href="/home">Home</Link>
          </div>

        </section>
      </main>

      <Footer />
    </>
  );
}