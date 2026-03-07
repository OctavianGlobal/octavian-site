import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Method — Octavian Global",
  description: "Methodology for Octavian Global intelligence briefs.",
};

export default function MethodPage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Method" subtag="Signals · Scoring · Patterns" />

      <main id="main" className="page">
        <section className="section container">
          <h2 className="page-title">Methodology</h2>
          <p className="page-lead">
            Octavian Global briefs are built from structured inputs, explicit scoring, and repeatable pattern checks.
            The goal is not volume — it is signal clarity: what is changing, how fast, and what it implies next.
          </p>

          <div className="prose">
            <h2>Principles</h2>
            <ul>
              <li><strong>Structured over narrative:</strong> each brief uses consistent sections and explicit indicators.</li>
              <li><strong>Cross-domain validation:</strong> signals are checked across independent source types.</li>
              <li><strong>Measured uncertainty:</strong> confidence is stated; unknowns are listed as open variables.</li>
              <li><strong>Archive continuity:</strong> briefs link forward and backward to build a signal library.</li>
            </ul>

            <h2>Pipeline</h2>
            <p>
              The pipeline below is intentionally simple. It can be executed manually, partially automated, or fully
              automated over time without changing the editorial structure.
            </p>

            <h2>1. Ingest</h2>
            <p>
              Collect events, datasets, and authoritative reporting. Normalize time, entities, and geography so signals
              are comparable week to week.
            </p>
            <ul>
              <li>Inputs: RSS feeds, APIs, official statements, datasets, reputable reporting.</li>
              <li>Normalization: timestamp, region, actor, category, and source reliability tier.</li>
            </ul>

            <h2>2. Entity + Topic Tagging</h2>
            <p>
              Each item is tagged with actors (states, institutions, firms), topics (energy, compute, finance),
              and relevance domain (geopolitics, infrastructure, technology systems, institutions).
            </p>
            <ul>
              <li>Entity list: countries, alliances, agencies, critical firms, and key infrastructure nodes.</li>
              <li>Topic taxonomy: a controlled vocabulary to prevent tag sprawl.</li>
            </ul>

            <h2>3. Signal Scoring</h2>
            <p>
              Items are scored on a small set of repeatable dimensions. This keeps scoring transparent and makes
              anomalies detectable.
            </p>
            <ul>
              <li><strong>Impact:</strong> potential magnitude if the signal persists.</li>
              <li><strong>Evidence:</strong> source quality and cross-source agreement.</li>
              <li><strong>Novelty:</strong> deviation from historical baseline patterns.</li>
              <li><strong>Anomaly:</strong> frequency and severity outliers.</li>
            </ul>

            <h2>4. Pattern Recognition</h2>
            <p>
              Scored signals are checked against historical baselines. The key output is not the event itself,
              but whether it is an outlier relative to prior behavior.
            </p>
            <ul>
              <li>Baselines: 7-day, 30-day, 365-day rolling comparisons.</li>
              <li>Outlier checks: frequency spikes, new actor involvement, new geography, or new policy instruments.</li>
              <li>Correlation checks: co-movement across domains.</li>
            </ul>

            <h2>5. Brief Assembly</h2>
            <p>Each brief is written in the same structure to make the archive scannable and comparable.</p>
            <ul>
              <li><strong>Executive Summary:</strong> 3–5 sentences: thesis + why now.</li>
              <li><strong>Indicators:</strong> the scored signals supporting the thesis.</li>
              <li><strong>Analysis:</strong> what the pattern suggests, with assumptions stated.</li>
              <li><strong>Implications:</strong> 2–4 decision-relevant consequences.</li>
              <li><strong>Watch List:</strong> what would confirm or falsify the thesis.</li>
              <li><strong>Confidence:</strong> Low / Medium / High with justification.</li>
            </ul>

            <h2>Reliability Tiers</h2>
            <ul>
              <li><strong>Tier 1:</strong> official releases, primary datasets, direct transcripts.</li>
              <li><strong>Tier 2:</strong> major reputable outlets and specialist journals.</li>
              <li><strong>Tier 3:</strong> single-source claims, commentary (lead indicators only).</li>
            </ul>

            <h2>What This Produces Over Time</h2>
            <p>
              The system creates an archive that can be searched and compared. The value compounds: patterns become
              visible not because the analysis is louder, but because the dataset becomes deeper.
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