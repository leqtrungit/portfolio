import Link from "next/link";
import { fetchAdjacentPosts, type AdjacentPosts, type PostSummary } from "@/lib/blog";
import { localePath, type Locale } from "@/lib/i18n/config";
import { tokens } from "@/lib/tokens";

interface PostNavProps {
  slug: string;
  locale: Locale;
  labels: { prev: string; next: string; ariaLabel: string };
}

function PostNavLink({ post, label, align, locale }: { post: PostSummary; label: string; align: "left" | "right"; locale: Locale }) {
  return (
    <Link
      href={localePath(locale, `/blog/${post.slug}`)}
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
      <span lang="vi" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{post.title}</span>
    </Link>
  );
}

export async function PostNav({ slug, locale, labels }: PostNavProps) {
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
    <nav aria-label={labels.ariaLabel} className="post-nav" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 34 }}>
      {prev ? <PostNavLink post={prev} label={labels.prev} align="left" locale={locale} /> : <div />}
      {next ? <PostNavLink post={next} label={labels.next} align="right" locale={locale} /> : <div />}
    </nav>
  );
}
