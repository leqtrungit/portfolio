import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/profile";
import { fetchAllPosts } from "@/lib/blog";
import { localePath, locales } from "@/lib/i18n/config";

// Re-generate hourly so posts published after the last deploy still appear
// (the backend no longer serves a sitemap — this file is the only one).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await fetchAllPosts(3600);
    postEntries = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at ?? post.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
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
