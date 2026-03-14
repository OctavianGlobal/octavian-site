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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
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
        .select("display_name, email, is_admin, is_editor")
        .eq("id", user.id)
        .single();

      const profile = data as {
        display_name: string | null;
        email: string | null;
        is_admin: boolean | null;
        is_editor: boolean | null;
      } | null;

      const name = profile?.display_name || user.email?.split("@")[0] || "U";
      setDisplayName(name);
      setUserEmail(user.email ?? null);
      setIsAdmin(profile?.is_admin ?? false);
      setIsEditor(profile?.is_editor ?? false);
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
const showBrand = scrolled;

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
              minWidth: "200px",
              zIndex: 200,
            }}>
              {!loadingAuth && (
                <>
                  {displayName ? (
                    <>
                      {/* User identity */}
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
                        <div style={{ overflow: "hidden" }}>
                          <div style={{
                            fontFamily: "var(--font-jakarta), sans-serif",
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.8)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {displayName}
                          </div>
                          {userEmail && (
                            <div style={{
                              fontFamily: "var(--font-jakarta), sans-serif",
                              fontSize: "11px",
                              color: "rgba(255,255,255,0.35)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                              {userEmail}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Main nav */}
                      <NavLink href="/dashboard" label="Signal Queue" pathname={pathname} hovered={hoveredItem} setHovered={setHoveredItem} onClose={() => setMenuOpen(false)} />
                      <NavLink href="/dashboard/published" label="Published Briefs" pathname={pathname} hovered={hoveredItem} setHovered={setHoveredItem} onClose={() => setMenuOpen(false)} />
                      <NavLink href="/dashboard/archive" label="Archived Signals" pathname={pathname} hovered={hoveredItem} setHovered={setHoveredItem} onClose={() => setMenuOpen(false)} />
                      <NavLink href="/settings" label="Settings" pathname={pathname} hovered={hoveredItem} setHovered={setHoveredItem} onClose={() => setMenuOpen(false)} />

                      {/* Admin section */}
                      {(isAdmin || isEditor) && (
                        <>
                          <div style={{
                            padding: "8px 18px 4px",
                            fontSize: "10px",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "rgba(212,175,55,0.45)",
                            borderTop: "1px solid rgba(212,175,55,0.12)",
                            marginTop: "4px",
                            fontFamily: "Cinzel, serif",
                          }}>
                            Admin
                          </div>
                          {isAdmin && (
                            <>
                              <NavLink href="/dashboard/sources" label="Sources" pathname={pathname} hovered={hoveredItem} setHovered={setHoveredItem} onClose={() => setMenuOpen(false)} />
                              <NavLink href="/dashboard/users" label="Users" pathname={pathname} hovered={hoveredItem} setHovered={setHoveredItem} onClose={() => setMenuOpen(false)} />
                            </>
                          )}
                          {isEditor && (
                            <NavLink href="/dashboard/sources" label="Pipeline Health" pathname={pathname} hovered={hoveredItem} setHovered={setHoveredItem} onClose={() => setMenuOpen(false)} />
                          )}
                        </>
                      )}

                      {/* Sign out */}
                      <button
                        onClick={handleSignOut}
                        onMouseEnter={() => setHoveredItem("signout")}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "12px 18px",
                          textAlign: "left",
                          background: hoveredItem === "signout" ? "rgba(212,175,55,0.08)" : "transparent",
                          cursor: "pointer",
                          borderTop: "1px solid rgba(212,175,55,0.12)",
                          borderBottom: "none",
                          borderLeft: "none",
                          borderRight: "none",
                          color: "rgba(255,255,255,0.5)",
                          fontFamily: "var(--font-jakarta), sans-serif",
                          fontSize: "13px",
                          letterSpacing: "0.08em",
                          transition: "background 0.15s",
                        }}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <NavLink href="/login" label="Sign In" pathname={pathname} hovered={hoveredItem} setHovered={setHoveredItem} onClose={() => setMenuOpen(false)} />
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

function NavLink({
  href,
  label,
  pathname,
  hovered,
  setHovered,
  onClose,
}: {
  href: string;
  label: string;
  pathname: string;
  hovered: string | null;
  setHovered: (v: string | null) => void;
  onClose: () => void;
}) {
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const isHovered = hovered === href;
  return (
    <Link
      href={href}
      onClick={onClose}
      onMouseEnter={() => setHovered(href)}
      onMouseLeave={() => setHovered(null)}
      style={{
        display: "block",
        padding: "12px 18px",
        fontFamily: "var(--font-jakarta), sans-serif",
        fontSize: "13px",
        letterSpacing: "0.08em",
        color: active ? "#D4AF37" : "rgba(255,255,255,0.8)",
        textDecoration: "none",
        borderBottom: "1px solid rgba(212,175,55,0.08)",
        background: isHovered ? "rgba(212,175,55,0.08)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      {label}
    </Link>
  );
}