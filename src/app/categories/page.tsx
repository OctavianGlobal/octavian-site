import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories — Octavian Global",
  description: "Browse intelligence briefs by domain.",
};

const CATEGORIES = [
  { slug: "geopolitics",        label: "Geopolitics",        desc: "State power, diplomacy, conflict, and strategic competition." },
  { slug: "technology-systems", label: "Technology Systems",  desc: "Compute, semiconductors, AI infrastructure, and digital supply chains." },
  { slug: "economic-structure", label: "Economic Structure",  desc: "Industrial policy, trade, capital flows, and monetary systems." },
  { slug: "institutional-risk", label: "Institutional Risk",  desc: "Regulatory shifts, governance failures, and legal instruments." },
  { slug: "environment",        label: "Environment",         desc: "Climate, resource constraints, and environmental risk signals." },
  { slug: "infrastructure",     label: "Infrastructure",      desc: "Critical systems: energy, logistics, communications, and finance." },
];

export default function CategoriesPage() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Categories" subtag="Browse by intelligence domain" />

      <main id="main" className="page">
        <section className="section container">
<h2 className="page-title">Categories</h2>
          <p className="page-lead">Browse briefs by intelligence domain.</p>

          <div className="brief-list" role="list">
            {CATEGORIES.map((cat) => (
              <article key={cat.slug} className="brief-row" role="listitem">
                <div className="brief-main">
                  <h3 className="brief-title">
                    <Link href={`/categories/${cat.slug}`}>{cat.label}</Link>
                  </h3>
                  <p className="brief-desc">{cat.desc}</p>
                </div>
                <div className="brief-action">
                  <Link className="read" href={`/categories/${cat.slug}`}>
                    View <span className="arrow">→</span>
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