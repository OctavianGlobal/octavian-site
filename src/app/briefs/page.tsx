import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import BriefsList from "@/components/BriefsList";
import type { Metadata } from "next";
import { getPublishedSignals } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Briefs — Octavian Global",
  description: "Strategic intelligence briefs archive.",
};

export const dynamic = "force-dynamic";

export default async function BriefsPage() {
  const { signals, count } = await getPublishedSignals({ limit: 20 });

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Briefs" />
      <main id="main" className="page">
        <section className="section container">
          <BriefsList initialSignals={signals} totalCount={count} />
        </section>
      </main>
      <Footer />
    </>
  );
}