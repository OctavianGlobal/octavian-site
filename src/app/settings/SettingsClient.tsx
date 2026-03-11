"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase.client";

export default function SettingsClient({ displayName }: { displayName: string }) {
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

const supabase = createClient() as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated."); setSaving(false); return; }

const { error: updateError } = await supabase
  .from("profiles")
  .update({ display_name: name.trim() })
  .eq("id", user.id);

    setSaving(false);
    if (updateError) {
      setError("Failed to save. Please try again.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div>
      <p style={{
        fontFamily: "var(--font-jakarta), sans-serif",
        fontSize: "13px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#1a1a1a",
        fontWeight: 700,
        marginBottom: "20px",
      }}>
        Display Name
      </p>

      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your display name"
          style={{
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: "14px",
            padding: "10px 14px",
            border: "1px solid #d0d0d0",
            borderRadius: "6px",
            width: "260px",
            outline: "none",
            color: "#1a1a1a",
          }}
        />
        <button
          onClick={handleSave}
          disabled={saving || name.trim() === displayName}
          style={{
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: "13px",
            letterSpacing: "0.08em",
            padding: "10px 20px",
            background: "#1a1a1a",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: saving || name.trim() === displayName ? "not-allowed" : "pointer",
            opacity: saving || name.trim() === displayName ? 0.5 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {saved && (
        <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: "13px", color: "#1a6e3c", marginTop: "10px" }}>
          Display name updated.
        </p>
      )}
      {error && (
        <p style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: "13px", color: "#c0392b", marginTop: "10px" }}>
          {error}
        </p>
      )}
    </div>
  );
}