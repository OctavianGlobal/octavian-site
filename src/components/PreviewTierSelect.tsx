"use client";

import { useState, useEffect } from "react";

const TIERS = ["free", "signal", "signal_plus", "analyst", "editor"] as const;

export default function PreviewTierSelect() {
  const [value, setValue] = useState("editor");

  useEffect(() => {
    const saved = localStorage.getItem("octavian_preview_tier");
    if (saved && (TIERS as readonly string[]).includes(saved)) {
      setValue(saved);
    }
  }, []);

  function handleChange(val: string) {
    setValue(val);
    localStorage.setItem("octavian_preview_tier", val);
  }

  return (
    <div>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        style={{
          background: "#fff", border: "1px solid #d0d0d0", color: "#1a1a1a",
          fontSize: "13px", padding: "8px 12px", borderRadius: "6px",
          cursor: "pointer", fontFamily: "var(--font-jakarta), sans-serif",
        }}
      >
        {TIERS.map((t) => (
          <option key={t} value={t}>{t.replace(/_/g, " ").toUpperCase()}</option>
        ))}
      </select>
      <p style={{ fontSize: "11px", color: "#aaa", marginTop: "8px", fontFamily: "var(--font-jakarta), sans-serif" }}>
        Changes take effect when you navigate to the Signal Queue. Persists across sessions.
      </p>
    </div>
  );
}