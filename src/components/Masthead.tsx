"use client";

import Link from "next/link";
import Image from "next/image";

interface MastheadProps {
  tagline?: string;
  subtag?: string;
}

export default function Masthead({
  tagline = "Strategic Intelligence Briefs",
  subtag = "Pattern Recognition · Risk Analysis",
}: MastheadProps) {
  return (
    <header className="masthead" style={{ paddingTop: "100px" }}>
      <div className="hero container">
        <Link href="/" style={{ display: "inline-block" }}>
          <Image
            className="logo"
            src="/assets/octavian-logo.svg"
            alt="Octavian Global logo"
            width={400}
            height={400}
            priority
          />
        </Link>
        <p className="tagline">{tagline}</p>
        <p className="subtag">{subtag}</p>
      </div>
    </header>
  );
}