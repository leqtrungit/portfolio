import type { CSSProperties, ReactNode } from "react";
import { Bricolage_Grotesque, JetBrains_Mono, Newsreader } from "next/font/google";
import { tokens } from "@/lib/tokens";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
  variable: "--font-newsreader",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jetbrainsMono.variable} ${newsreader.variable}`}
      style={{ "--ac": tokens.accent } as CSSProperties}
    >
      <body style={{ fontFamily: tokens.fonts.display, margin: 0 }}>{children}</body>
    </html>
  );
}
