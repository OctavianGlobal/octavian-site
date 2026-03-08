"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase.client";

export default function StickyNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
      if (window.scrollY > 10) setMenuOpen(false);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingAuth(false); return; }

      const { data } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user.id)
        .single()

      const profile = data as { display_name: string | null; email: string | null } | null
      const name = profile?.display_name || user.email?.split('@')[0] || 'U'
      setDisplayName(name)
      setLoadingAuth(false)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await fetch('/api/auth/login', { method: 'DELETE' })
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: "/briefs",     label: "Briefs" },
    { href: "/categories", label: "Categories" },
    { href: "/about",      label: "About" },
    { href: "/method",     label: "Method" },
    { href: "/contact",    label: "Contact" },
  ];

  const initial = displayName ? displayName.charAt(0).toUpperCase() : null;
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.97)",
        borderBottom: (scrolled || isDashboard) ? "1px solid rgba(212,175,55,0.18)" : "1px solid transparent",
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
        {/* Brand lockup — always visible on dashboard, fades in on scroll elsewhere */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            opacity: (scrolled || isDashboard) ? 1 : 0,
            pointerEvents: (scrolled || isDashboard) ? "auto" : "none",
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

        {/* Desktop nav */}
        <nav
          style={{ display: "flex", gap: "18px", alignItems: "center" }}
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

          {/* Auth controls */}
          {!loadingAuth && (
            displayName ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "8px" }}>
                <div style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "rgba(212,175,55,0.15)",
                  border: "1px solid rgba(212,175,55,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Cinzel, serif",
                  fontSize: "13px",
                  color: "var(--gold)",
                  flexShrink: 0,
                }}>
                  {initial}
                </div>
                <button
                  onClick={handleSignOut}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "11px",
                    letterSpacing: "0.10em",
                    cursor: "pointer",
                    padding: 0,
                    textTransform: "uppercase",
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  color: "var(--gold)",
                  textDecoration: "none",
                  border: "1px solid rgba(212,175,55,0.3)",
                  padding: "5px 12px",
                  marginLeft: "8px",
                }}
              >
                Sign In
              </Link>
            )
          )}
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
            {!loadingAuth && (
              displayName ? (
                <button
                  onClick={handleSignOut}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px 0",
                    fontFamily: "Cinzel, serif",
                    fontSize: "16px",
                    letterSpacing: "0.12em",
                    color: "rgba(212,175,55,0.6)",
                    borderBottom: "1px solid rgba(212,175,55,0.10)",
                    textAlign: "right",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "12px 0",
                    fontFamily: "Cinzel, serif",
                    fontSize: "16px",
                    letterSpacing: "0.12em",
                    color: "var(--gold)",
                    textDecoration: "none",
                    textAlign: "right",
                  }}
                >
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}