import Link from "next/link";
import { buildImageUrl, fetchPosts, formatPostDate, type PostSummary } from "@/lib/blog";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Cover } from "@/components/ui/Cover";
import { fill, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

export interface LatestBlogSectionProps {
  locale: Locale;
  dict: Dictionary["sections"];
}

export async function LatestBlogSection({ locale, dict }: LatestBlogSectionProps) {
  let posts: PostSummary[] = [];
  let total = 0;
  try {
    const res = await fetchPosts({ limit: 3, revalidate: 3600 });
    posts = res.posts;
    total = res.meta.total;
  } catch {
    // Blog API unavailable — skip the section rather than failing the homepage.
    return null;
  }
  if (posts.length === 0) return null;

  const [lead, ...side] = posts;
  const href = (p: PostSummary) => localePath(locale, `/blog/${p.slug}`);

  return (
    <section id="blog" className="wrap latest">
      <SectionHeading
        number="07"
        action={
          <Link href={localePath(locale, "/blog")} className="all-posts">
            {fill(dict.allPosts, { count: total })}
          </Link>
        }
      >
        {dict.latestBlog}
      </SectionHeading>
      <div className="latest-grid">
        <Link href={href(lead)} className="latest-lead post-link" lang="vi">
          <Cover src={buildImageUrl(lead.featured_image_key)} alt={lead.featured_image_alt ?? lead.title} sizes="(max-width: 860px) 100vw, 640px" />
          <div className="meta meta-row">
            <span className="latest-label" lang={locale}>
              {dict.latest}
            </span>
            <span className="red">{formatPostDate(lead.created_at)}</span>
          </div>
          <h3 className="lead-title post-link-title">{lead.title}</h3>
          {lead.excerpt && <p className="excerpt clamp-3">{lead.excerpt}</p>}
          {lead.tags.length > 0 && <div className="tags-line">{lead.tags.map((t) => t.name).join(" · ")}</div>}
        </Link>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {side.map((post) => (
            <Link key={post.id} href={href(post)} className="side-post post-link" lang="vi">
              <Cover src={buildImageUrl(post.featured_image_key)} alt={post.featured_image_alt ?? post.title} sizes="150px" />
              <div className="side-post-body">
                <span className="meta red">{formatPostDate(post.created_at)}</span>
                <h3 className="side-title post-link-title">{post.title}</h3>
                {post.excerpt && <p className="side-excerpt clamp-2">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
