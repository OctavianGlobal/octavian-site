import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedSignals } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Octavian Global — Strategic Intelligence",
  description: "Structured signal intelligence. Pattern recognition.",
};

export const dynamic = "force-dynamic";

function extractFirstLine(md: string | null | undefined): string {
  if (!md) return "";
  const line = md.split('\n').find(l => {
    const t = l.trim();
    return t.length > 0 && !t.startsWith('#') && !t.startsWith('**') && !t.startsWith('*') && !t.startsWith('|');
  });
  return line?.replace(/\*\*/g, '').trim() ?? "";
}

export default async function HomePage() {
  const { signals } = await getPublishedSignals({ limit: 6 });
  const [featured, ...recent] = signals;

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Strategic Intelligence" />

      <main id="main" className="page">
        <section className="section container">

          {/* ── Featured brief ── */}
          {featured ? (
            <div className="card featured" style={{ marginBottom: "32px" }}>
              <div className="meta" style={{ marginBottom: "10px" }}>
                <span className="meta-item">
                  {featured.published_at
                    ? new Date(featured.published_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })
                    : "—"}
                </span>
              </div>
              <h2 className="featured-title">
                {featured.published_title ?? featured.cluster_summary ?? "Untitled"}
              </h2>
              <p style={{
                color: "#444",
                fontSize: "16px",
                lineHeight: 1.7,
                margin: "12px 0 20px",
                fontFamily: "var(--font-jakarta), sans-serif",
              }}>
                {extractFirstLine(featured.published_body_md)}
              </p>
              <div className="cta-row">
                <Link className="btn" href={`/briefs/${featured.id}`}>
                  Read Brief <span className="arrow">→</span>
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)" }}>
              No briefs published yet.
            </div>
          )}

          {/* ── Recent briefs ── */}
          {recent.length > 0 && (
            <>
              <div className="section-title">
                <span className="label">Recent Briefs</span>
                <div className="rule" />
              </div>

              <div className="brief-list" role="list">
                {recent.map((signal) => (
                  <article key={signal.id} className="brief-row" role="listitem">
                    <div className="brief-main">
                      <h3 className="brief-title">
                        <Link href={`/briefs/${signal.id}`}>
                          {signal.published_title ?? signal.cluster_summary ?? "Untitled"}
                        </Link>
                      </h3>
                      <div className="meta">
                        <span className="meta-item">
                          {signal.published_at
                            ? new Date(signal.published_at).toLocaleDateString("en-US", {
                                year: "numeric", month: "long", day: "numeric"
                              })
                            : "—"}
                        </span>
                      </div>
                      {extractFirstLine(signal.published_body_md) && (
                        <p className="brief-desc">
                          {extractFirstLine(signal.published_body_md)}
                        </p>
                      )}
                    </div>
                    <div className="brief-action">
                      <Link className="read" href={`/briefs/${signal.id}`}>
                        Read <span className="arrow">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

        </section>
      </main>

      <Footer />
    </>
  );
}