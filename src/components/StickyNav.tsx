"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase.client";
import OctavianWordmark from "@/components/OctavianWordmark";

export default function StickyNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 105);
      if (window.scrollY > 105) setMenuOpen(false);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu]")) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingAuth(false); return; }

      const { data } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", user.id)
        .single();

      const profile = data as { display_name: string | null; email: string | null } | null;
      const name = profile?.display_name || user.email?.split("@")[0] || "U";
      setDisplayName(name);
      setLoadingAuth(false);
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await fetch("/api/auth/login", { method: "DELETE" });
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const initial = displayName ? displayName.charAt(0).toUpperCase() : null;
  const isDashboard = pathname.startsWith("/dashboard");
  const showBrand = scrolled || isDashboard;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: "rgba(0,0,0,0.97)",
      borderBottom: showBrand ? "1px solid rgba(212,175,55,0.18)" : "1px solid transparent",
      backdropFilter: "blur(8px)",
      transition: "border-color 0.25s",
    }}>
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 0",
        }}
      >
        {/* Left — Shield + Wordmark */}
        <Link
          href="/home"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
            opacity: showBrand ? 1 : 0,
            pointerEvents: showBrand ? "auto" : "none",
            transition: "opacity 0.25s",
          }}
        >
          <svg width="36" height="42" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M24 2L44 10V28C44 40 34 50 24 54C14 50 4 40 4 28V10L24 2Z"
              stroke="#D4AF37"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M24 12L36 17V28C36 35.5 30.5 42 24 44.5C17.5 42 12 35.5 12 28V17L24 12Z"
              fill="#D4AF37"
              fillOpacity="0.08"
              stroke="#D4AF37"
              strokeWidth="0.75"
            />
          </svg>
          <OctavianWordmark size={18} color="#D4AF37" letterSpacing="0.18em" />
        </Link>

        <div style={{ flex: 1 }} />

        {/* Right — Hamburger */}
        <div style={{ position: "relative" }} data-menu>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            style={{
              background: "none",
              border: "1px solid rgba(212,175,55,0.3)",
              color: "#D4AF37",
              cursor: "pointer",
              padding: "6px 10px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {menuOpen ? (
              <span style={{ fontSize: "16px", lineHeight: 1, color: "#D4AF37" }}>✕</span>
            ) : (
              <>
                <span style={{ display: "block", width: "18px", height: "1px", background: "#D4AF37" }} />
                <span style={{ display: "block", width: "18px", height: "1px", background: "#D4AF37" }} />
                <span style={{ display: "block", width: "18px", height: "1px", background: "#D4AF37" }} />
              </>
            )}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              background: "#0a0a0a",
              border: "1px solid rgba(212,175,55,0.2)",
              minWidth: "180px",
              zIndex: 200,
            }}>
              {!loadingAuth && (
                <>
                  {displayName ? (
                    <>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "14px 18px",
                        borderBottom: "1px solid rgba(212,175,55,0.12)",
                      }}>
                        <div style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          background: "rgba(212,175,55,0.15)",
                          border: "1px solid rgba(212,175,55,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Cinzel, serif",
                          fontSize: "14px",
                          color: "#D4AF37",
                          flexShrink: 0,
                        }}>
                          {initial}
                        </div>
                        <span style={{
                          fontFamily: "var(--font-jakarta), sans-serif",
                          fontSize: "14px",
                          color: "rgba(255,255,255,0.8)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {displayName}
                        </span>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        onMouseEnter={() => setHoveredItem("dashboard")}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={dropdownItemStyle(pathname.startsWith("/dashboard"), hoveredItem === "dashboard")}
                      >
                        Dashboard
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setMenuOpen(false)}
                        onMouseEnter={() => setHoveredItem("settings")}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={dropdownItemStyle(pathname.startsWith("/settings"), hoveredItem === "settings")}
                      >
                        Settings
                      </Link>

                      <button
                        onClick={handleSignOut}
                        onMouseEnter={() => setHoveredItem("signout")}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          ...dropdownItemStyle(false, hoveredItem === "signout"),
                          width: "100%",
                          textAlign: "left",
                          background: hoveredItem === "signout" ? "rgba(212,175,55,0.18)" : "transparent",
                          cursor: "pointer",
                          borderTop: "1px solid rgba(212,175,55,0.12)",
                          color: "#ffffff",
                          fontFamily: "var(--font-jakarta), sans-serif",
                          fontSize: "13px",
                          letterSpacing: "0.08em",
                          border: "none",
                          borderBottom: "1px solid rgba(212,175,55,0.08)",
                        }}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      onMouseEnter={() => setHoveredItem("login")}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={dropdownItemStyle(false, hoveredItem === "login")}
                    >
                      Sign In
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function dropdownItemStyle(active: boolean, hovered?: boolean): React.CSSProperties {
  return {
    display: "block",
    padding: "12px 18px",
    fontFamily: "var(--font-jakarta), sans-serif",
    fontSize: "13px",
    letterSpacing: "0.08em",
    color: active ? "#D4AF37" : "#ffffff",
    textDecoration: "none",
    borderBottom: "1px solid rgba(212,175,55,0.08)",
    transition: "background 0.15s",
    background: hovered ? "rgba(212,175,55,0.18)" : "transparent",
    cursor: "pointer",
  };
}