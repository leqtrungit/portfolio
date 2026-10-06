import { readFileSync } from "node:fs";
import path from "node:path";
import type { CSSProperties, ReactNode } from "react";
import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { tokens } from "@/lib/tokens";
import { fontVariables } from "@/lib/fonts";
import { getProfile } from "@/lib/profile";
import { truncateForMeta } from "@/lib/seo";
import { fill, isLocale, locales, htmlLang, localePath, ogLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { localizedAlternates } from "@/lib/i18n/seo";
import { AnalyticsTracker } from "@/components/ui/AnalyticsTracker";

// Inlined (not `import "./globals.css"`) so this ~2KB stylesheet ships in the
// initial HTML instead of as a separate render-blocking request.
const globalCss = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

const siteUrl = getProfile().basics.url ?? "https://lequoctrung.vn";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const profile = getProfile(locale);
  const title = `${profile.basics.name} — ${profile.basics.label}`;
  // SERP/OG snippets get cut off past ~160 chars — keep the on-page hero copy
  // (which reads `profile.basics.summary` directly) untouched and only clip
  // the metadata copies.
  const metaDescription = truncateForMeta(profile.basics.summary ?? "");
  const other: Locale = locale === "en" ? "vi" : "en";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s — ${profile.basics.name}`,
    },
    description: metaDescription,
    openGraph: {
      type: "profile",
      url: localePath(locale, "/"),
      siteName: profile.basics.name,
      title,
      description: metaDescription,
      locale: ogLocale[locale],
      alternateLocale: [ogLocale[other]],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
    },
    alternates: {
      ...localizedAlternates(locale, "/"),
      types: { "application/rss+xml": "/feed.xml" },
    },
  };
}

export const viewport: Viewport = {
  themeColor: tokens.accent,
};

function buildSiteJsonLd(locale: Locale) {
  const profile = getProfile(locale);
  const metaDescription = truncateForMeta(profile.basics.summary ?? "");
  const blogName = fill(getDictionary(locale).blog.siteName, { name: profile.basics.name });
  const currentJob = profile.work.find((job) => !job.endDate) ?? profile.work[0];
  const publisher = { "@type": "Person", name: profile.basics.name, url: siteUrl };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
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
      },
      {
        "@type": "WebSite",
        name: blogName,
        url: siteUrl,
        inLanguage: htmlLang[locale],
        description: metaDescription,
        publisher,
      },
      {
        "@type": "Blog",
        name: blogName,
        url: `${siteUrl}${localePath(locale, "/blog")}`,
        inLanguage: htmlLang[locale],
        description: metaDescription,
        publisher,
      },
    ],
  };
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={htmlLang[lang]}
      className={fontVariables}
      style={{ "--ac": tokens.accent } as CSSProperties}
    >
      <body style={{ fontFamily: tokens.fonts.display, margin: 0 }}>
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
        <AnalyticsTracker />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSiteJsonLd(lang)) }}
        />
      </body>
    </html>
  );
}
