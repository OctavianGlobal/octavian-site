"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const data = new FormData(e.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (res.ok) {
        window.location.href = json.redirect ?? "/dashboard";
      } else {
        setErrorMsg(json.error ?? "Invalid credentials.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo" style={{ display: "flex", justifyContent: "center" }}>
          <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 2L44 10V28C44 40 34 50 24 54C14 50 4 40 4 28V10L24 2Z" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
            <path d="M24 12L36 17V28C36 35.5 30.5 42 24 44.5C17.5 42 12 35.5 12 28V17L24 12Z" fill="#D4AF37" fillOpacity="0.08" stroke="#D4AF37" strokeWidth="0.75" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 className="auth-title">OCTAVIAN GLOBAL</h1>
        <p className="auth-sub">Sign in to your account</p>

        {status === "error" && errorMsg && (
          <div className="auth-error">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="btn"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              fontFamily: "Cinzel, serif",
              fontSize: "13px",
              letterSpacing: "0.12em",
              cursor: status === "loading" ? "not-allowed" : "pointer",
              opacity: status === "loading" ? 0.7 : 1,
              justifyContent: "center",
            }}
          >
            {status === "loading" ? "Signing in…" : "SIGN IN →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/" style={{ color: "#aaa", fontSize: "12px", letterSpacing: "0.08em", fontFamily: "var(--font-jakarta), sans-serif" }}>
            ← Back to Octavian Global
          </Link>
        </div>
      </div>
    </div>
  );
}