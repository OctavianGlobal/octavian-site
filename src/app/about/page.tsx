import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Octavian Global",
  description: "About Octavian Global strategic intelligence.",
};

export default function AboutPage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="About" subtag="Strategic Intelligence Briefs" />

      <main id="main" className="page">
        <section className="section container">
          <h2 className="page-title">About Octavian Global</h2>
          <p className="page-lead">
            Octavian Global publishes structured intelligence briefs focused on early signals, cross-domain patterns,
            and strategic risk. The objective is clarity: what is changing, why it matters, and what to watch next.
          </p>

          <div className="prose">
            <h2>Positioning</h2>
            <p>
              This is not a general news site. Briefs are written as analytic memos: compact, sourced, and structured.
              The goal is to identify emerging patterns before narratives harden and before institutions are forced into
              reactive posture.
            </p>

            <h2>Domains</h2>
            <p>Coverage is intentionally limited to areas where structural signals can be measured and compared over time:</p>
            <ul>
              <li>Geopolitics and statecraft</li>
              <li>Technology systems and infrastructure</li>
              <li>Economic structure and industrial policy</li>
              <li>Institutional risk and regulatory shifts</li>
            </ul>

            <h2>Editorial Standard</h2>
            <p>
              Each brief should be readable in under ten minutes, with a clear thesis, supporting indicators, and an explicit
              "what changes next" section. Over time, the archive becomes a signal library.
            </p>

            <h2>Contact</h2>
            <p>
              For private briefings, partnerships, or questions about methodology, use the{" "}
              <Link href="/contact" style={{ color: "var(--gold)" }}>contact page</Link>.
            </p>
          </div>
        </section>

        <section className="section container">
          <div className="mini-links">
            <Link href="/briefs">Briefs</Link>
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