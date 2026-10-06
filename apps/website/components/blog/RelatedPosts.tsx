import { fetchRelatedPosts, type PostSummary } from "@/lib/blog";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Locale } from "@/lib/i18n/config";
import { PostCard } from "@/components/blog/PostCard";

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
    <section style={{ padding: "8px 0 80px" }}>
      <SectionLabel>{label}</SectionLabel>
      <div className="blog-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        {related.map((p) => (
          <PostCard key={p.id} post={p} locale={locale} />
        ))}
      </div>
    </section>
  );
}
