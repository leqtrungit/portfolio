import Link from "next/link";
import { fetchAdjacentPosts, type AdjacentPosts, type PostSummary } from "@/lib/blog";
import { localePath, type Locale } from "@/lib/i18n/config";

interface PostNavProps {
  slug: string;
  locale: Locale;
  labels: { prev: string; next: string; ariaLabel: string };
}

function PostNavLink({ post, label, dir, locale }: { post: PostSummary; label: string; dir: "prev" | "next"; locale: Locale }) {
  return (
    <Link href={localePath(locale, `/blog/${post.slug}`)} className={`post-nav-link ${dir}`}>
      <span className="post-nav-label">{label}</span>
      <span className="post-nav-title" lang="vi">
        {post.title}
      </span>
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
    <nav aria-label={labels.ariaLabel} className="post-nav">
      {prev ? <PostNavLink post={prev} label={labels.prev} dir="prev" locale={locale} /> : <div />}
      {next ? <PostNavLink post={next} label={labels.next} dir="next" locale={locale} /> : <div />}
    </nav>
  );
}
