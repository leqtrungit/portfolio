import { readFileSync } from "node:fs";
import path from "node:path";
import type { CSSProperties, ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Newsreader } from "next/font/google";
import { tokens } from "@/lib/tokens";
import { getProfile } from "@/lib/profile";
import { truncateForMeta } from "@/lib/seo";
import { AnalyticsTracker } from "@/components/ui/AnalyticsTracker";

// Inlined (not `import "./globals.css"`) so this ~2KB stylesheet ships in the
// initial HTML instead of as a separate render-blocking request.
const globalCss = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

const profile = getProfile();
const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";
const title = `${profile.basics.name} — ${profile.basics.label}`;
// SERP/OG snippets get cut off past ~160 chars — keep the on-page hero copy
// (which reads `profile.basics.summary` directly) untouched and only clip
// the metadata copies.
const metaDescription = truncateForMeta(profile.basics.summary ?? "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s — ${profile.basics.name}`,
  },
  description: metaDescription,
  openGraph: {
    type: "profile",
    url: "/",
    siteName: profile.basics.name,
    title,
    description: metaDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: metaDescription,
  },
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export const viewport: Viewport = {
  themeColor: tokens.accent,
};

const currentJob = profile.work.find((job) => !job.endDate) ?? profile.work[0];

const personJsonLd = {
  "@type": "Person",
  name: profile.basics.name,
  jobTitle: profile.basics.label,
  email: profile.basics.email,
  url: siteUrl,
  image: `${siteUrl}/portrait.png`,
  worksFor: currentJob ? { "@type": "Organization", name: currentJob.name } : undefined,
  sameAs: profile.basics.profiles.map((p) => p.url),
  address: profile.basics.location?.city
    ? {
        "@type": "PostalAddress",
        addressLocality: profile.basics.location.city,
        addressCountry: profile.basics.location.countryCode,
      }
    : undefined,
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    personJsonLd,
    {
      "@type": "WebSite",
      name: `${profile.basics.name}'s Blog`,
      url: siteUrl,
      description: metaDescription,
      publisher: { "@type": "Person", name: profile.basics.name, url: siteUrl },
    },
    {
      "@type": "Blog",
      name: `${profile.basics.name}'s Blog`,
      url: `${siteUrl}/blog`,
      description: metaDescription,
      publisher: { "@type": "Person", name: profile.basics.name, url: siteUrl },
    },
  ],
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
  style: ["normal", "italic"],
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
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
        <AnalyticsTracker />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </body>
    </html>
  );
}
