import Link from "next/link";
import { fetchAdjacentPosts, type AdjacentPosts, type PostSummary } from "@/lib/blog";
import { tokens } from "@/lib/tokens";

interface PostNavProps {
  slug: string;
}

function PostNavLink({ post, label, align }: { post: PostSummary; label: string; align: "left" | "right" }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      lang="vi"
      className="proj"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "18px 20px",
        border: `1.5px solid ${tokens.colors.border}`,
        background: tokens.colors.cardBg,
        color: "inherit",
        textDecoration: "none",
        textAlign: align,
      }}
    >
      <span style={{ fontFamily: tokens.fonts.mono, fontSize: 11, letterSpacing: "0.1em", color: tokens.colors.textFaint }}>
        {label}
      </span>
      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{post.title}</span>
    </Link>
  );
}

export async function PostNav({ slug }: PostNavProps) {
  let adjacent: AdjacentPosts;
  try {
    adjacent = await fetchAdjacentPosts(slug, { revalidate: 3600 });
  } catch {
    // Prev/next is optional — never fail the article over it.
    return null;
  }
  const { prev, next } = adjacent;
  if (!prev && !next) return null;

  return (
    <nav aria-label="Bài trước và bài sau" className="post-nav" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 34 }}>
      {prev ? <PostNavLink post={prev} label="← BÀI TRƯỚC" align="left" /> : <div />}
      {next ? <PostNavLink post={next} label="BÀI SAU →" align="right" /> : <div />}
    </nav>
  );
}
