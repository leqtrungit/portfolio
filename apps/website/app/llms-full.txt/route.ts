import { fetchAllPosts, fetchPost } from "@/lib/blog";
import { isLocale } from "@/lib/i18n/config";
import { getProfile } from "@/lib/profile";

export const revalidate = 3600;

export async function GET() {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  const sections: string[] = [
    `# ${profile.basics.name}'s Blog`,
    "",
    `> ${profile.basics.summary ?? ""}`,
    "",
  ];

  try {
    const posts = await fetchAllPosts("en", 3600);
    for (const summary of posts) {
      const post = await fetchPost(summary.slug, isLocale(summary.locale) ? summary.locale : "vi", { revalidate: 3600 });
      if (!post) continue;
      sections.push(
        `## ${post.title}`,
        "",
        `URL: ${siteUrl}/blog/${post.slug}`,
        "",
        post.content,
        "",
        "---",
        ""
      );
    }
  } catch {}

  return new Response(sections.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
