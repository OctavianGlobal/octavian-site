"use client";

import Image from "next/image";
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
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          <Image
            src="/assets/octavian-logo.svg"
            alt="Octavian Global"
            width={80}
            height={80}
          />
        </div>
        <h1 className="auth-title">OCTAVIAN GLOBAL</h1>
        <p className="auth-sub">
          {mode === "login" ? "Sign in to your account" : "Create a free account"}
        </p>

        {status === "error" && errorMsg && (
          <div className="auth-error">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Your name"
              />
            </div>
          )}

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
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              placeholder="••••••••"
              minLength={mode === "signup" ? 8 : undefined}
            />
          </div>

          <button
            className="btn"
            type="submit"
            disabled={status === "loading"}
            style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
          >
            {status === "loading"
              ? mode === "login" ? "Signing in…" : "Creating account…"
              : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          {mode === "login" ? (
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
              No account?{" "}
              <button
                onClick={() => { setMode("signup"); setStatus("idle"); setErrorMsg(""); }}
                style={{ color: "rgba(212,175,55,0.8)", background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}
              >
                Create one free
              </button>
            </span>
          ) : (
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setStatus("idle"); setErrorMsg(""); }}
                style={{ color: "rgba(212,175,55,0.8)", background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}
              >
                Sign in
              </button>
            </span>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/" style={{ color: "rgba(212,175,55,0.6)", fontSize: "12px", letterSpacing: "0.08em" }}>
            ← Back to Octavian Global
          </Link>
        </div>
      </div>
    </div>
  );
}