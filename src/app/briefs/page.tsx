import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedSignals } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Briefs — Octavian Global",
  description: "Strategic intelligence briefs archive.",
};

export default async function BriefsPage() {
  const { signals } = await getPublishedSignals({ limit: 20 });

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Briefs" subtag="Strategic Intelligence Archive" />

      <main id="main" className="page">
        <section className="section container">
          <h2 className="page-title">Briefs</h2>
          <p className="page-lead">Strategic intelligence archive.</p>

          <div className="brief-list" role="list">
            {signals.length === 0 && (
              <p>No briefs published yet.</p>
            )}
            {signals.map((signal) => (
              <article key={signal.id} className="brief-row" role="listitem">
                <div className="brief-main">
                  <h3 className="brief-title">
                    <Link href={`/briefs/${signal.id}`}>
                      {signal.published_title ?? signal.cluster_summary ?? "Untitled"}
                    </Link>
                  </h3>
                  <div className="meta">
                    <span className="meta-item">
                      Published: {signal.published_at
                        ? new Date(signal.published_at).toLocaleDateString("en-US", {
                            year: "numeric", month: "long", day: "numeric"
                          })
                        : "—"}
                    </span>
                    <span className="meta-dot" />
                    <span className="meta-item">
                      Domain: {signal.primary_domain ?? "—"}
                    </span>
                  </div>
                  <p className="brief-desc">
                    {signal.cluster_summary ?? ""}
                  </p>
                </div>
                <div className="brief-action">
                  <Link className="read" href={`/briefs/${signal.id}`}>
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