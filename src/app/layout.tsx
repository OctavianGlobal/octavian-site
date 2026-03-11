import type { Metadata } from "next";
import { Cinzel, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NavWrapper from "@/components/NavWrapper";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Octavian Global — Strategic Intelligence Briefs",
  description: "Strategic intelligence briefs focused on pattern recognition and risk analysis.",
  metadataBase: new URL("https://octavian.global"),
  openGraph: {
    siteName: "Octavian Global",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${inter.variable} ${plusJakarta.variable}`}>
        <NavWrapper />
        {children}
      </body>
    </html>
  );
}