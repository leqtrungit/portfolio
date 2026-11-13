import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/profile";
import { fetchAllPosts, translationSlug } from "@/lib/blog";
import { localePath, locales } from "@/lib/i18n/config";

// Re-generate hourly so posts published after the last deploy still appear
// (the backend no longer serves a sitemap — this file is the only one).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  const postEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = (await Promise.all([fetchAllPosts("en", 3600), fetchAllPosts("vi", 3600)])).flat();
    const seen = new Set<string>();
    for (const post of posts) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      const enSlug = translationSlug(post, "en");
      const viSlug = translationSlug(post, "vi");
      const bothPublished = enSlug != null && viSlug != null;
      const languages = {
        en: siteUrl + localePath("en", `/blog/${bothPublished ? enSlug : post.slug}`),
        vi: siteUrl + localePath("vi", `/blog/${bothPublished ? viSlug : post.slug}`),
      };
      postEntries.push(...locales.map(locale => ({
        url: languages[locale],
        lastModified: new Date(post.updated_at ?? post.published_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        ...(bothPublished ? { alternates: { languages: { ...languages, "x-default": languages.en } } } : {}),
      })));
    }
  } catch {
    // Blog API unavailable at build time — skip post entries
  }

  const pages = [
    { path: "/", changeFrequency: "monthly" as const, priority: 1 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
  ];

  const pageEntries: MetadataRoute.Sitemap = pages.flatMap(({ path, changeFrequency, priority }) =>
    locales.map((locale) => ({
      url: siteUrl + (path === "/" && locale === "en" ? "" : localePath(locale, path)),
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: {
          en: siteUrl + (path === "/" ? "" : path),
          vi: siteUrl + localePath("vi", path),
          "x-default": siteUrl + (path === "/" ? "" : path),
        },
      },
    })),
  );

  return [...pageEntries, ...postEntries];
}
