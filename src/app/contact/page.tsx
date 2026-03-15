"use client";

import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Masthead tagline="Contact" />

      <main id="main" className="page">
        <section className="section container">
          <h2 className="page-title">Contact</h2>
          <p className="page-lead">
            Use this form for private briefing requests, partnerships, or general questions.
          </p>

          {status === "sent" ? (
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "10px",
              padding: "22px",
              maxWidth: "600px",
              color: "#166534"
            }}>
              Message received. We will respond to your inquiry within 2 business days.
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              {status === "error" && (
                <div className="auth-error" style={{ marginBottom: "16px" }}>
                  Something went wrong. Please try again or email contact@octavian.global directly.
                </div>
              )}

              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" autoComplete="name" required />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" required />
              </div>

              <div className="field">
                <label htmlFor="topic">Topic</label>
                <input id="topic" name="topic" placeholder="Briefing request, partnership, question" />
              </div>

              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Include context, timeline, and what you need."
                />
              </div>

              <div className="form-actions">
                <button className="btn" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : <>Send <span className="arrow">→</span></>}
                </button>
                <Link className="btn-light" href="/">Back to Briefs</Link>
              </div>

              <div className="fineprint">
                Privacy: do not include sensitive personal data. This is an initial contact channel.
                Responses go to contact@octavian.global.
              </div>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}