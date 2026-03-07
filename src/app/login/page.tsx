"use client";

import Image from "next/image";
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
        <div className="auth-logo">
          <Image
            src="/assets/octavian-logo.svg"
            alt="Octavian Global"
            width={80}
            height={80}
          />
        </div>
        <h1 className="auth-title">OCTAVIAN GLOBAL</h1>
        <p className="auth-sub">Sign in to your account</p>

        {(status === "error" && errorMsg) && (
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
            className="btn"
            type="submit"
            disabled={status === "loading"}
            style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
          >
            {status === "loading" ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/" style={{ color: "rgba(212,175,55,0.6)", fontSize: "12px", letterSpacing: "0.08em" }}>
            ← Back to Octavian Global
          </Link>
        </div>
      </div>
    </div>
  );
}