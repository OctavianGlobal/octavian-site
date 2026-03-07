"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface MastheadProps {
  tagline?: string;
  subtag?: string;
}

export default function Masthead({
  tagline = "Strategic Intelligence Briefs",
  subtag = "Pattern Recognition · Risk Analysis",
}: MastheadProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 310);
      if (window.scrollY > 310) setMenuOpen(false);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/briefs",     label: "Briefs" },
    { href: "/categories", label: "Categories" },
    { href: "/about",      label: "About" },
    { href: "/method",     label: "Method" },
    { href: "/contact",    label: "Contact" },
  ];

  return (
    <>
      {/* ── Sticky nav ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
         background: "rgba(0,0,0,0.97)",
          borderBottom: scrolled ? "1px solid rgba(212,175,55,0.18)" : "1px solid transparent",
          backdropFilter: "blur(8px)",
          transition: "background 0.25s, border-color 0.25s",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            padding: "10px 0",
          }}
        >
          {/* Left: brand lockup */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              opacity: scrolled ? 1 : 0,
              pointerEvents: scrolled ? "auto" : "none",
              transition: "opacity 0.25s",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <Image
              src="/assets/octavian-shield-logo.svg"
              alt="Octavian Global"
              width={42}
              height={42}
              style={{ display: "block" }}
            />
            <span
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: "24px",
                letterSpacing: "0.18em",
                color: "var(--gold)",
                whiteSpace: "nowrap",
              }}
            >
              OCTAVIAN GLOBAL
            </span>
          </Link>

          <div style={{ flex: 1 }} />

          {/* Desktop nav links */}
          <nav
            style={{
              display: "flex",
              gap: "18px",
              alignItems: "center",
            }}
            className="nav-desktop"
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${pathname.startsWith(l.href) ? " active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "var(--gold)",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px 8px",
              lineHeight: 1,
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            style={{
              background: "rgba(0,0,0,0.97)",
              borderTop: "1px solid rgba(212,175,55,0.18)",
              padding: "12px 0 18px",
            }}
          >
            <div className="container">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
style={{
                    display: "block",
                    padding: "12px 0",
                    fontFamily: "Cinzel, serif",
                    fontSize: "16px",
                    letterSpacing: "0.12em",
                    color: pathname.startsWith(l.href) ? "#ffffff" : "var(--gold-hi)",
                    borderBottom: "1px solid rgba(212,175,55,0.10)",
                    textDecoration: "none",
                    textAlign: "right",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Hero masthead ── */}
      <header className="masthead" style={{ paddingTop: "100px" }}>
        <div className="hero container">
          <Link href="/" style={{ display: "inline-block" }}>
            <Image
              className="logo"
              src="/assets/octavian-logo.svg"
              alt="Octavian Global logo"
              width={400}
              height={400}
              priority
            />
          </Link>
          <p className="tagline">{tagline}</p>
          <p className="subtag">{subtag}</p>
        </div>
      </header>
    </>
  );
}