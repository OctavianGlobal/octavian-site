import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const CATEGORIES: Record<string, { label: string; desc: string }> = {
  "geopolitics":        { label: "Geopolitics",        desc: "State power, diplomacy, conflict, and strategic competition." },
  "technology-systems": { label: "Technology Systems",  desc: "Compute, semiconductors, AI infrastructure, and digital supply chains." },
  "economic-structure": { label: "Economic Structure",  desc: "Industrial policy, trade, capital flows, and monetary systems." },
  "institutional-risk": { label: "Institutional Risk",  desc: "Regulatory shifts, governance failures, and legal instruments." },
  "environment":        { label: "Environment",         desc: "Climate, resource constraints, and environmental risk signals." },
  "infrastructure":     { label: "Infrastructure",      desc: "Critical systems: energy, logistics, communications, and finance." },
};

const BRIEFS_BY_CATEGORY: Record<string, { slug: string; title: string; published: string; desc: string }[]> = {
  "geopolitics": [
    { slug: "ai-infrastructure-power-shift", title: "AI Infrastructure Power Shift", published: "June 6, 2024", desc: "Compute concentration is becoming a state-level strategic lever." },
  ],
  "technology-systems": [
    { slug: "structural-signals-ai-infrastructure", title: "Structural Signals Behind Global AI Infrastructure Consolidation", published: "June 13, 2024", desc: "Indicators of sovereign compute blocs forming across policy, capital, and supply chains." },
  ],
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) return { title: "Category Not Found — Octavian Global" };
  return { title: `${cat.label} — Octavian Global`, description: cat.desc };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) notFound();

  const briefs = BRIEFS_BY_CATEGORY[slug] ?? [];

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline={cat.label} subtag="Intelligence Domain" />

      <main id="main" className="page">
        <section className="section container">
          <h2 className="page-title">{cat.label}</h2>
          <p className="page-lead">{cat.desc}</p>

          {briefs.length === 0 ? (
            <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
              No briefs published in this domain yet.
            </p>
          ) : (
            <div className="brief-list" role="list">
              {briefs.map((brief) => (
                <article key={brief.slug} className="brief-row" role="listitem">
                  <div className="brief-main">
                    <h3 className="brief-title">
                      <Link href={`/briefs/${brief.slug}`}>{brief.title}</Link>
                    </h3>
                    <div className="meta">
                      <span className="meta-item">Published: {brief.published}</span>
                    </div>
                    <p className="brief-desc">{brief.desc}</p>
                  </div>
                  <div className="brief-action">
                    <Link className="read" href={`/briefs/${brief.slug}`}>
                      Read <span className="arrow">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="cta-row" style={{ marginTop: "22px" }}>
            <Link className="btn-light" href="/categories">All Categories</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}