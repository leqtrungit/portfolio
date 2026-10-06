import { getProfile } from "@/lib/profile";
import { localePath, ogLocale, type Locale } from "./config";

export function localizedAlternates(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: {
      en: localePath("en", path),
      vi: localePath("vi", path),
      "x-default": localePath("en", path),
    },
  };
}

// Next replaces the whole `openGraph` object per segment, so a page that sets
// its own og:url must repeat the layout's locale/siteName fields.
export function localizedOpenGraph(
  locale: Locale,
  path: string,
  fields: { title: string; description?: string },
) {
  const other: Locale = locale === "en" ? "vi" : "en";
  return {
    type: "website" as const,
    url: localePath(locale, path),
    siteName: getProfile(locale).basics.name,
    title: fields.title,
    description: fields.description,
    locale: ogLocale[locale],
    alternateLocale: [ogLocale[other]],
  };
}
