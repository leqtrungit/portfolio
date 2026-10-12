import Link from "next/link";
import { buildImageUrl, fetchRelatedPosts, formatPostDate, type PostSummary } from "@/lib/blog";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Cover } from "@/components/ui/Cover";
import { localePath, type Locale } from "@/lib/i18n/config";

interface RelatedPostsProps {
  slug: string;
  locale: Locale;
  label: string;
}

export async function RelatedPosts({ slug, locale, label }: RelatedPostsProps) {
  let related: PostSummary[] = [];
  try {
    related = await fetchRelatedPosts(slug, { limit: 3, revalidate: 3600 });
  } catch {
    // Related posts are optional — never fail the article over them.
    return null;
  }
  if (related.length === 0) return null;

  return (
    <section className="wrap related">
      <SectionHeading number="→">{label}</SectionHeading>
      <div className="related-grid">
        {related.map((p) => (
          <Link key={p.id} href={localePath(locale, `/blog/${p.slug}`)} className="related-card post-link" lang="vi">
            <Cover src={buildImageUrl(p.featured_image_key)} alt={p.featured_image_alt ?? p.title} sizes="(max-width: 860px) 100vw, 380px" />
            <span className="meta red">{formatPostDate(p.created_at)}</span>
            <h3 className="related-title post-link-title">{p.title}</h3>
            {p.excerpt && <p className="side-excerpt clamp-2">{p.excerpt}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
