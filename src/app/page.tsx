import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";

const FEATURED = {
  slug: "ai-infrastructure-power-shift",
  title: "AI Infrastructure Power Shift",
  published: "June 6, 2024",
  domain: "Geopolitics",
  confidence: "Medium",
  lead: "Compute is consolidating into a small number of jurisdictions and hyperscale operators. That consolidation is becoming a strategic lever — comparable to energy chokepoints — with downstream impacts on policy, trade, and security.",
};

const RECENT = [
  {
    slug: "ai-infrastructure-power-shift",
    title: "AI Infrastructure Power Shift",
    published: "June 6, 2024",
    domain: "Geopolitics",
    desc: "Compute concentration is becoming a state-level strategic lever.",
  },
  {
    slug: "structural-signals-ai-infrastructure",
    title: "Structural Signals Behind Global AI Infrastructure Consolidation",
    published: "June 13, 2024",
    domain: "Technology Systems",
    desc: "Indicators of sovereign compute blocs forming across policy, capital, and supply chains.",
  },
];

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead />

      <main id="main" className="page">
        <section className="section container">
          <div className="section-title">
            <span className="rule" />
            <span className="label">LATEST BRIEF</span>
            <span className="rule" />
          </div>

          <article className="card featured">
            <h2 className="featured-title">{FEATURED.title}</h2>
            <div className="meta">
              <span className="meta-item">Published: {FEATURED.published}</span>
              <span className="meta-dot" />
              <span className="meta-item">Domain: {FEATURED.domain}</span>
              <span className="meta-dot" />
              <span className="meta-item">Confidence: {FEATURED.confidence}</span>
            </div>
            <p className="lead">{FEATURED.lead}</p>
            <div className="cta-row">
              <Link className="btn" href={`/briefs/${FEATURED.slug}`}>
                Read Brief <span className="arrow">→</span>
              </Link>
              <Link className="btn-light" href="/briefs">All Briefs</Link>
            </div>
          </article>
        </section>

        <section className="section container">
          <div className="section-title">
            <span className="rule" />
            <span className="label">RECENT BRIEFS</span>
            <span className="rule" />
          </div>

          <div className="brief-list" role="list">
            {RECENT.map((brief) => (
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

        <section className="section container">
          <div className="mini-links">
            <Link href="/briefs">Briefs</Link>
            <span className="sep">·</span>
            <Link href="/categories">Categories</Link>
            <span className="sep">·</span>
            <Link href="/about">About</Link>
            <span className="sep">·</span>
            <Link href="/method">Method</Link>
            <span className="sep">·</span>
            <Link href="/contact">Contact</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}