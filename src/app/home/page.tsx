import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { getPublishedSignals } from "@/lib/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Octavian Global — Strategic Intelligence",
  description: "Strategic intelligence briefs focused on pattern recognition and risk analysis.",
};

export const dynamic = "force-dynamic";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HomePage() {
  const { signals } = await getPublishedSignals({ limit: 9 });
  const featured = signals[0] ?? null;
  const recent = signals.slice(1, 9);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead />

      <main id="main" className="page">

        {/* Latest Brief */}
        {featured && (
          <section className="section container">
            <div className="section-title">
              <span className="rule" />
              <span className="label">LATEST BRIEF</span>
              <span className="rule" />
            </div>

            <article className="card featured">
              <h2 className="featured-title">{featured.published_title}</h2>
              <div className="meta">
                <span className="meta-item">Published: {formatDate(featured.published_at)}</span>
                {featured.primary_domain && (
                  <>
                    <span className="meta-dot" />
                    <span className="meta-item">Domain: {featured.primary_domain}</span>
                  </>
                )}
              </div>
              <p className="lead">{featured.cluster_summary}</p>
              <div className="cta-row">
                <Link className="btn" href={`/briefs/${featured.id}`}>
                  Read Brief <span className="arrow">→</span>
                </Link>
                <Link className="btn-light" href="/briefs">All Briefs</Link>
              </div>
            </article>
          </section>
        )}

        {/* Recent Briefs */}
        {recent.length > 0 && (
          <section className="section container">
            <div className="section-title">
              <span className="rule" />
              <span className="label">RECENT BRIEFS</span>
              <span className="rule" />
            </div>

            <div className="brief-list" role="list">
              {recent.map((brief) => (
                <article key={brief.id} className="brief-row" role="listitem">
                  <div className="brief-main">
                    <h3 className="brief-title">
                      <Link href={`/briefs/${brief.id}`}>{brief.published_title}</Link>
                    </h3>
                    <div className="meta">
                      <span className="meta-item">Published: {formatDate(brief.published_at)}</span>
                      {brief.primary_domain && (
                        <>
                          <span className="meta-dot" />
                          <span className="meta-item">Domain: {brief.primary_domain}</span>
                        </>
                      )}
                    </div>
                    <p className="brief-desc">{brief.cluster_summary}</p>
                  </div>
                  <div className="brief-action">
                    <Link className="read" href={`/briefs/${brief.id}`}>
                      Read <span className="arrow">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

             </main>

      <Footer />
    </>
  );
}