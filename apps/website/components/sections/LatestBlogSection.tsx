import Link from "next/link";
import { fetchPosts, type PostSummary } from "@/lib/blog";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PostCard } from "@/components/blog/PostCard";
import { tokens } from "@/lib/tokens";

export async function LatestBlogSection() {
  let posts: PostSummary[] = [];
  try {
    ({ posts } = await fetchPosts({ limit: 3, revalidate: 3600 }));
  } catch {
    // Blog API unavailable — skip the section rather than failing the homepage.
    return null;
  }
  if (posts.length === 0) return null;

  return (
    <section id="blog" style={{ padding: "64px 0 24px" }}>
      <SectionLabel
        action={
          <Link
            href="/blog"
            className="navlink"
            style={{
              fontFamily: tokens.fonts.mono,
              fontSize: 12,
              color: tokens.colors.textFaint,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            all posts →
          </Link>
        }
      >
        LATEST FROM THE BLOG
      </SectionLabel>
      <div className="blog-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
