"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const data = new FormData(e.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const name = data.get("name") as string;

    if (mode === "login") {
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
    } else {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const json = await res.json();
        if (res.ok) {
          window.location.href = "/dashboard";
        } else {
          setErrorMsg(json.error ?? "Signup failed.");
          setStatus("error");
        }
      } catch {
        setErrorMsg("Network error. Please try again.");
        setStatus("error");
      }
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px",
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.40)",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        </div>

        {/* Wordmark */}
        <h1 style={{
          fontFamily: "Cinzel, serif",
          fontSize: "20px",
          letterSpacing: "0.18em",
          color: "#1a1a1a",
          textAlign: "center",
          margin: "0 0 6px",
          fontWeight: 600,
        }}>
          OCTAVIAN GLOBAL
        </h1>
        <p style={{
          fontFamily: "var(--font-jakarta), sans-serif",
          fontSize: "13px",
          color: "#888",
          textAlign: "center",
          margin: "0 0 32px",
          letterSpacing: "0.04em",
        }}>
          {mode === "login" ? "Sign in to your account" : "Create a free account"}
        </p>

        {status === "error" && errorMsg && (
          <div style={{
            background: "#fff5f5",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#c0392b",
            fontSize: "13px",
            marginBottom: "16px",
            fontFamily: "var(--font-jakarta), sans-serif",
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="field">
              <label htmlFor="name" style={{ color: "#333" }}>Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Your name"
                style={{ background: "#fafafa", borderColor: "#e0e0e0", color: "#1a1a1a" }}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email" style={{ color: "#333" }}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              style={{ background: "#fafafa", borderColor: "#e0e0e0", color: "#1a1a1a" }}
            />
          </div>

          <div className="field">
            <label htmlFor="password" style={{ color: "#333" }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              placeholder="••••••••"
              minLength={mode === "signup" ? 8 : undefined}
              style={{ background: "#fafafa", borderColor: "#e0e0e0", color: "#1a1a1a" }}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              background: "#1a1a1a",
              color: "#D4AF37",
              border: "none",
              borderRadius: "8px",
              fontFamily: "Cinzel, serif",
              fontSize: "13px",
              letterSpacing: "0.12em",
              cursor: status === "loading" ? "not-allowed" : "pointer",
              opacity: status === "loading" ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {status === "loading"
              ? mode === "login" ? "Signing in…" : "Creating account…"
              : mode === "login" ? "SIGN IN →" : "CREATE ACCOUNT →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          {mode === "login" ? (
            <span style={{ color: "#888", fontSize: "12px", fontFamily: "var(--font-jakarta), sans-serif" }}>
              No account?{" "}
              <button
                onClick={() => { setMode("signup"); setStatus("idle"); setErrorMsg(""); }}
                style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                Create one free
              </button>
            </span>
          ) : (
            <span style={{ color: "#888", fontSize: "12px", fontFamily: "var(--font-jakarta), sans-serif" }}>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setStatus("idle"); setErrorMsg(""); }}
                style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                Sign in
              </button>
            </span>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/" style={{ color: "#aaa", fontSize: "12px", letterSpacing: "0.08em", fontFamily: "var(--font-jakarta), sans-serif" }}>
            ← Back to Octavian Global
          </Link>
        </div>
      </div>
    </div>
  );
}