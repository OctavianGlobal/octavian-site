import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import Footer from "@/components/Footer";
import OctavianWordmark from "@/components/OctavianWordmark";
import PipelineHealthFull from "@/components/PipelineHealthFull";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pipeline Health — Octavian Dashboard" };
export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  await requireAdmin();

  return (
    <>
      <div style={{ background: "#0a0a0a", paddingTop: "82px", paddingBottom: "28px", textAlign: "center", borderBottom: "1px solid #1a1a1a" }}>
        <div className="container">
          <Link href="/home" style={{ display: "inline-block", marginBottom: "10px" }}>
            <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 2L44 10V28C44 40 34 50 24 54C14 50 4 40 4 28V10L24 2Z" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
              <path d="M24 12L36 17V28C36 35.5 30.5 42 24 44.5C17.5 42 12 35.5 12 28V17L24 12Z" fill="#D4AF37" fillOpacity="0.08" stroke="#D4AF37" strokeWidth="0.75" />
            </svg>
          </Link>
          <div><OctavianWordmark size={28} color="#D4AF37" letterSpacing="0.28em" /></div>
        </div>
      </div>

      <div style={{ background: "var(--paper)", minHeight: "calc(100vh - 200px)" }}>
        <div className="container" style={{ padding: "32px 0" }}>
          <div style={{ marginBottom: "8px" }}>
            <Link href="/dashboard" style={{ color: "rgba(0,0,0,0.4)", fontSize: "12px", letterSpacing: "0.08em" }}>← Signal Queue</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--line)" }}>
            <div>
              <h1 className="dash-title">Pipeline Health</h1>
              <p className="dash-subtitle">Script run logs — ingest, cluster, classify, score</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/dashboard/sources" className="btn-light" style={{ fontSize: "12px", padding: "8px 14px" }}>Sources</Link>
              <Link href="/dashboard/entities" className="btn-light" style={{ fontSize: "12px", padding: "8px 14px" }}>Entities</Link>
            </div>
          </div>
          <PipelineHealthFull />
        </div>
      </div>
      <Footer />
    </>
  );
}