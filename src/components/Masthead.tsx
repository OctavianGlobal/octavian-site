import Link from "next/link";

interface MastheadProps {
  tagline?: string;
}

export default function Masthead({
  tagline = "Strategic Intelligence",
}: MastheadProps) {
  return (
    <header style={{
      background: "#0a0a0a",
      borderBottom: "1px solid #222",
      paddingTop: "64px",
      paddingBottom: "40px",
      textAlign: "center",
    }}>
      <div className="container">

        {/* Shield */}
        <Link href="/home" style={{ display: "inline-block", marginBottom: "8px" }}>
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
        </Link>

        {/* Wordmark */}
        <div style={{
          fontFamily: "Cinzel, Georgia, serif",
          fontSize: "clamp(18px, 4vw, 28px)",
          letterSpacing: "0.28em",
          color: "#D4AF37",
          marginBottom: "10px",
        }}>
          OCTAVIAN GLOBAL
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: "var(--font-jakarta), Georgia, sans-serif",
          fontSize: "clamp(11px, 2vw, 13px)",
          letterSpacing: "0.28em",
          color: "#ffffff",
          textTransform: "uppercase",
        }}>
          {tagline}
        </div>

      </div>
    </header>
  );
}