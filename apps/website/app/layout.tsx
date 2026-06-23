import type { CSSProperties, ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Newsreader } from "next/font/google";
import { tokens } from "@/lib/tokens";
import { getProfile } from "@/lib/profile";
import "./globals.css";

const profile = getProfile();
const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";
const title = `${profile.basics.name} — ${profile.basics.label}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s — ${profile.basics.name}`,
  },
  description: profile.basics.summary,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: profile.basics.name,
    title,
    description: profile.basics.summary,
    locale: "en_US",
    images: [{ url: "/portrait.png", width: 750, height: 1000, alt: `${profile.basics.name} portrait` }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: profile.basics.summary,
    images: ["/portrait.png"],
  },
};

export const viewport: Viewport = {
  themeColor: tokens.accent,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.basics.name,
  jobTitle: profile.basics.label,
  email: profile.basics.email,
  url: profile.basics.url,
  image: profile.basics.url ? `${profile.basics.url}/portrait.png` : undefined,
  sameAs: profile.basics.profiles.map((p) => p.url),
  address: profile.basics.location?.city
    ? {
        "@type": "PostalAddress",
        addressLocality: profile.basics.location.city,
        addressCountry: profile.basics.location.countryCode,
      }
    : undefined,
};

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
      <body style={{ fontFamily: tokens.fonts.display, margin: 0 }}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
