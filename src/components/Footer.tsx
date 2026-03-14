import Link from "next/link";
import OctavianWordmark from "@/components/OctavianWordmark";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <nav style={{
          display: "flex", gap: "10px", alignItems: "center",
          justifyContent: "center", flexWrap: "wrap", marginBottom: "28px",
        }}>
          {[
            { href: "/briefs",  label: "Briefs" },
            { href: "/tiers",   label: "Tiers" },
            { href: "/about",   label: "About" },
            { href: "/method",  label: "Method" },
            { href: "/contact", label: "Contact" },
          ].map((link, i, arr) => (
            <span key={link.href} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link href={link.href} style={{
                fontFamily: "var(--font-jakarta), sans-serif", fontSize: "12px",
                letterSpacing: "0.16em", color: "#ffffff",
                textDecoration: "none", textTransform: "uppercase",
              }}>
                {link.label}
              </Link>
              {i < arr.length - 1 && (
                <span style={{ color: "rgba(212,175,55,0.4)", fontSize: "11px" }}>·</span>
              )}
            </span>
          ))}
        </nav>
        <div className="footer-brand">
          <OctavianWordmark size={18} color="#D4AF37" letterSpacing="0.28em" />
        </div>
        <div className="footer-sub">Strategic Intelligence and Pattern Recognition</div>
        <div className="footer-fine">
          Copyright {year} Octavian Global ·{" "}
          <Link href="https://octavian.global" style={{ color: "inherit" }}>octavian.global</Link>
        </div>
      </div>
    </footer>
  );
}