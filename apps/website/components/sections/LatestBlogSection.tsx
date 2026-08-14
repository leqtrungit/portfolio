import Link from "next/link";
import Image from "next/image";
import { fetchPosts, buildImageUrl, type PostSummary } from "@/lib/blog";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TagPill } from "@/components/blog/TagPill";
import { tokens } from "@/lib/tokens";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y} · ${m} · ${day}`;
}

function BlogPostCard({ post }: { post: PostSummary }) {
  const imageUrl = buildImageUrl(post.featured_image_key);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="proj"
      style={{
        border: `1.5px solid ${tokens.colors.border}`,
        background: tokens.colors.cardBg,
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 150,
          borderBottom: `1.5px solid ${tokens.colors.border}`,
          overflow: "hidden",
          background: tokens.colors.borderMuted,
        }}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={post.featured_image_alt ?? post.title}
            fill
            sizes="(max-width: 760px) calc(100vw - 40px), 340px"
            style={{ objectFit: "cover" }}
          />
        )}
      </div>
      <div style={{ padding: "22px 22px 26px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 11,
            color: tokens.colors.textFaint,
            letterSpacing: "0.04em",
            marginBottom: 12,
          }}
        >
          {formatDate(post.created_at)}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.25 }}>
          {post.title}
        </div>
        {post.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: "auto", paddingTop: 16 }}>
            {post.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

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
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
