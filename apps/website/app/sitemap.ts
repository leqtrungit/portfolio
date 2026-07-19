import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/profile";
import { fetchAllPosts } from "@/lib/blog";

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

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...postEntries,
  ];
}
