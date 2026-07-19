import { fetchAllPosts, type PostSummary } from "@/lib/blog";
import { getProfile } from "@/lib/profile";

export const revalidate = 3600;

export async function GET() {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  let posts: PostSummary[] = [];
  try {
    posts = await fetchAllPosts(3600);
  } catch {}

  const lines = [
    `# ${profile.basics.name}'s Blog`,
    "",
    `> ${profile.basics.summary ?? ""}`,
    "",
    "## Posts",
    "",
    ...posts.map(
      (p) =>
        `- [${p.title}](${siteUrl}/blog/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ""}`
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
