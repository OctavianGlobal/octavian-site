import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Briefs — Octavian Global",
  description: "Strategic intelligence briefs archive.",
};

const BRIEFS = [
  {
    slug: "structural-signals-ai-infrastructure",
    title: "Structural Signals Behind Global AI Infrastructure Consolidation",
    published: "June 13, 2024",
    domain: "Technology Systems",
    desc: "Indicators of sovereign compute blocs forming across policy, capital, and supply chains.",
  },
  {
    slug: "ai-infrastructure-power-shift",
    title: "AI Infrastructure Power Shift",
    published: "June 6, 2024",
    domain: "Geopolitics",
    desc: "Compute concentration is becoming a state-level strategic lever.",
  },
];

export default function BriefsPage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Briefs" subtag="Strategic Intelligence Archive" />

      <main id="main" className="page">
        <section className="section container">
<h2 className="page-title">Briefs</h2>
          <p className="page-lead">Strategic intelligence archive.</p>

          <div className="brief-list" role="list">
            {BRIEFS.map((brief) => (
              <article key={brief.slug} className="brief-row" role="listitem">
                <div className="brief-main">
                  <h3 className="brief-title">
                    <Link href={`/briefs/${brief.slug}`}>{brief.title}</Link>
                  </h3>
                  <div className="meta">
                    <span className="meta-item">Published: {brief.published}</span>
                    <span className="meta-dot" />
                    <span className="meta-item">Domain: {brief.domain}</span>
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
        </section>
      </main>

      <Footer />
    </>
  );
}