import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const BRIEFS: Record<string, {
  title: string;
  published: string;
  domain: string;
  confidence: string;
  sections: { heading: string; items?: string[]; paragraphs?: string[] }[];
}> = {
  "ai-infrastructure-power-shift": {
    title: "AI Infrastructure Power Shift",
    published: "June 6, 2024",
    domain: "Geopolitics",
    confidence: "Medium",
    sections: [
      {
        heading: "Executive Summary",
        paragraphs: [
          "Compute is consolidating into a small number of hyperscale operators and jurisdictions. As AI workloads scale, compute access behaves less like a normal market input and more like strategic infrastructure.",
          "This brief outlines the signals to watch and why this consolidation changes state leverage, industrial policy, and risk.",
        ],
      },
      {
        heading: "Core Thesis",
        paragraphs: [
          "The strategic unit is shifting from models to compute capacity. Actors that control power, chips, permitting, and network adjacency will shape the next decade of AI capability distribution.",
        ],
      },
      {
        heading: "Indicators",
        items: [
          "Concentration of hyperscale buildouts in a small set of regions with favorable energy and permitting.",
          "Public policy movement toward sovereign compute, national AI strategies, and domestic chip priorities.",
          "Rising coupling between AI capacity and power availability, grid constraints, and long-lead infrastructure.",
          "Export controls and industrial policy increasingly targeting compute-enabling inputs and chokepoints.",
        ],
      },
      {
        heading: "Analysis",
        paragraphs: [
          "AI capability scales with compute, but compute scales with physical constraints: energy, land, cooling, skilled labor, chip supply, and network adjacency. Those constraints create predictable consolidation dynamics. When compute becomes scarce or gated, policy instruments follow.",
          "The geopolitical implication is not that AI stops diffusing, but that diffusion becomes tiered. States and firms closest to compute supply chains gain negotiation leverage across trade, security, and standards.",
        ],
      },
      {
        heading: "Implications",
        items: [
          "State leverage: compute policy becomes a bargaining tool comparable to energy and finance.",
          "Industrial policy: incentives and restrictions expand from chips into power and siting.",
          "Corporate strategy: long-term contracts for power and capacity become competitive moats.",
          "Security: concentrated capacity increases single-point-of-failure and targeting risk.",
        ],
      },
      {
        heading: "Watch List",
        items: [
          "Grid constraints, interconnect queues, and large-load negotiations with utilities.",
          "Policy movement toward compute export licensing, sovereign cloud requirements, or localization mandates.",
          "Chip supply shocks or new export control packages tied explicitly to AI compute thresholds.",
          "Evidence of capacity rationing, priority access deals, or state-backed compute procurement.",
        ],
      },
      {
        heading: "Notes",
        paragraphs: [
          "Confidence is medium because the consolidation pattern is clear, but policy response speed varies by region. This brief should be updated as compute gating instruments become explicit.",
        ],
      },
    ],
  },
  "structural-signals-ai-infrastructure": {
    title: "Structural Signals Behind Global AI Infrastructure Consolidation",
    published: "June 13, 2024",
    domain: "Technology Systems",
    confidence: "Medium",
    sections: [
      {
        heading: "Executive Summary",
        paragraphs: [
          "Sovereign compute blocs are forming across policy, capital, and supply chains. This brief tracks the structural indicators behind the consolidation and what it implies for technology governance and industrial strategy.",
        ],
      },
      {
        heading: "Indicators",
        items: [
          "National AI strategies increasingly include domestic compute targets and chip stockpiling provisions.",
          "Capital flows into hyperscale infrastructure are concentrating in a small number of jurisdictions.",
          "Supply chain chokepoints — advanced packaging, HBM, and interconnect — are becoming policy levers.",
        ],
      },
      {
        heading: "Analysis",
        paragraphs: [
          "The pattern mirrors earlier resource consolidation cycles. When a strategic input becomes scarce, states intervene to secure domestic supply. Compute is following this trajectory faster than most policy frameworks anticipated.",
        ],
      },
      {
        heading: "Implications",
        items: [
          "Technology standards will increasingly reflect compute geography, not neutral technical merit.",
          "Firms outside dominant compute jurisdictions face structural disadvantage in AI capability development.",
        ],
      },
      {
        heading: "Watch List",
        items: [
          "Confirm: new bilateral compute access agreements or sovereign AI fund announcements.",
          "Falsify: open compute access treaties or significant non-US hyperscale buildouts.",
        ],
      },
    ],
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brief = BRIEFS[slug];
  if (!brief) return { title: "Brief Not Found — Octavian Global" };
  return {
    title: `${brief.title} — Octavian Global`,
    description: `${brief.domain} · Confidence: ${brief.confidence}`,
  };
}

export default async function BriefPage({ params }: Props) {
  const { slug } = await params;
  const brief = BRIEFS[slug];
  if (!brief) notFound();

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Brief" subtag="Strategic Intelligence" />

      <main id="main" className="page">
        <section className="section container">
          <h2 className="page-title">{brief.title}</h2>

          <div className="meta">
            <span className="meta-item">Published: {brief.published}</span>
            <span className="meta-dot" />
            <span className="meta-item">Domain: {brief.domain}</span>
            <span className="meta-dot" />
            <span className="meta-item">Confidence: {brief.confidence}</span>
            <span className="score-locked">Signal Score: Subscriber Access</span>
          </div>

          <article className="prose">
            {brief.sections.map((section) => (
              <div key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs?.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {section.items && (
                  <ul>
                    {section.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </article>

          <div className="cta-row" style={{ marginTop: "22px" }}>
            <Link className="btn-light" href="/briefs">Back to Briefs</Link>
            <Link className="btn-light" href="/">Home</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
} 