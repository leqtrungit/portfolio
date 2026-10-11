import Link from "next/link";
import { buildImageUrl, formatPostDate, type PostSummary } from "@/lib/blog";
import { Cover } from "@/components/ui/Cover";
import { localePath, type Locale } from "@/lib/i18n/config";

interface PostRowProps {
  post: PostSummary;
  locale: Locale;
}

/** Blog list row: big day number + year·month, title/excerpt/tags, framed thumbnail. */
export function PostRow({ post, locale }: PostRowProps) {
  const [y, m, d] = formatPostDate(post.created_at).split(" · ");

  return (
    <Link href={localePath(locale, `/blog/${post.slug}`)} className="post-row post-link" lang="vi">
      <div className="post-row-date">
        <span className="post-row-day">{d}</span>
        <span className="post-row-ym">
          {y} · {m}
        </span>
      </div>
      <div className="post-row-body">
        <h2 className="post-row-title post-link-title">{post.title}</h2>
        {post.excerpt && <p className="post-row-excerpt">{post.excerpt}</p>}
        {post.tags.length > 0 && <div className="tags-line">{post.tags.map((t) => t.name).join(" · ")}</div>}
      </div>
      <Cover src={buildImageUrl(post.featured_image_key)} alt={post.featured_image_alt ?? post.title} sizes="(max-width: 860px) 100vw, 230px" />
    </Link>
  );
}
