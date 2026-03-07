import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">OCTAVIAN GLOBAL</div>
        <div className="footer-sub">Strategic Intelligence and Pattern Recognition</div>
        <div className="footer-fine">
          Copyright {year} Octavian Global ·{" "}
          <Link href="https://octavian.global" style={{ color: "inherit" }}>
            octavian.global
          </Link>
        </div>
      </div>
    </footer>
  );
}