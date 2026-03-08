import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Categories — Octavian Global",
  description: "Browse intelligence briefs by domain.",
};

export default async function CategoriesPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("tags")
    .select("id, name")
    .order("name", { ascending: true });

  const tags = (data ?? []) as { id: string; name: string }[];
  const filtered = tags.filter((t) => t.name !== "unclassified_event");

  function formatName(name: string) {
    return name.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Categories" subtag="Browse by intelligence domain" />

      <main id="main" className="page">
        <section className="section container">
          <h2 className="page-title">Categories</h2>
          <p className="page-lead">Browse briefs by intelligence domain.</p>

          <div className="brief-list" role="list">
            {filtered.map((tag) => (
              <article key={tag.id} className="brief-row" role="listitem">
                <div className="brief-main">
                  <h4 className="brief-title">
                    <Link href={`/categories/${tag.name}`}>
                      {formatName(tag.name)}
                    </Link>
                  </h4>
                </div>
                <div className="brief-action">
                  <Link className="read" href={`/categories/${tag.name}`}>
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