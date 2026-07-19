import { fetchAllPosts, type PostSummary } from "@/lib/blog";
import { getProfile } from "@/lib/profile";
import { truncateForMeta } from "@/lib/seo";

export const revalidate = 3600;

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET() {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";
  const title = `${profile.basics.name}'s Blog`;
  const description = truncateForMeta(profile.basics.summary ?? "");

  let posts: PostSummary[] = [];
  try {
    posts = await fetchAllPosts(3600);
  } catch {
    // API unavailable — serve a valid, empty channel rather than a 500
  }

  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${siteUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <description>${esc(p.excerpt ?? "")}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(title)}</title>
    <link>${siteUrl}</link>
    <description>${esc(description)}</description>
    <language>en</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
