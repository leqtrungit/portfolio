import type { Metadata } from "next";
import Link from "next/link";
import { buildImageUrl, fetchPosts, formatPostDate } from "@/lib/blog";
import { PostListWithLoadMore } from "@/components/blog/PostListWithLoadMore";
import { SubpageHeader } from "@/components/sections/SubpageHeader";
import { Cover } from "@/components/ui/Cover";
import { notFound } from "next/navigation";
import { fill, isLocale, localePath } from "@/lib/i18n/config";
import { localizedAlternates, localizedOpenGraph } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/getDictionary";

// Lead post + 7 rows per page, as in the design.
const PAGE_SIZE = 8;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale).blog;
  return {
    title: "Blog",
    description: dict.metaDescription,
    openGraph: localizedOpenGraph(locale, "/blog", { title: "Blog", description: dict.metaDescription }),
    alternates: {
      ...localizedAlternates(locale, "/blog"),
      types: { "application/rss+xml": "/feed.xml" },
    },
  };
}

export default async function BlogListPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang).blog;
  const { posts, meta } = await fetchPosts({ limit: PAGE_SIZE });
  const lead = posts[0];

  const updated = new Date()
    .toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { month: "long", year: "numeric" })
    .toUpperCase();

  return (
    <>
      <SubpageHeader locale={lang} crumbs={[{ label: "Blog" }]} inBlog />
      <main>
        <section className="blog-hero-band">
          <div className="wrap blog-hero">
            <div>
              <div className="kicker blog-kicker">{dict.kicker}</div>
              <h1 className="blog-title">
                {dict.titleLead} <span className="hl">{dict.titleAccent}</span>
              </h1>
            </div>
            <div className="blog-intro">
              <p className="blog-desc">{dict.description}</p>
              <div className="meta blog-count">
                <span className="blog-count-n">
                  {fill(meta.total === 1 ? dict.countOne : dict.countMany, { count: meta.total })}
                </span>
                <span style={{ color: "var(--text-muted)" }}>{fill(dict.updated, { date: updated })}</span>
              </div>
            </div>
          </div>
        </section>

        {lead ? (
          <>
            <section className="wrap blog-lead-wrap">
              <Link href={localePath(lang, `/blog/${lead.slug}`)} className="blog-lead post-link" lang="vi">
                <Cover src={buildImageUrl(lead.featured_image_key)} alt={lead.featured_image_alt ?? lead.title} sizes="(max-width: 860px) 100vw, 660px" priority />
                <div className="blog-lead-body">
                  <div className="meta meta-row">
                    <span className="latest-label" lang={lang}>
                      {dict.latest}
                    </span>
                    <span className="red">{formatPostDate(lead.created_at)}</span>
                  </div>
                  <h2 className="blog-lead-title post-link-title">{lead.title}</h2>
                  {lead.excerpt && <p className="blog-lead-excerpt">{lead.excerpt}</p>}
                  {lead.tags.length > 0 && (
                    <div className="tags">
                      {lead.tags.map((tag) => (
                        <span key={tag.id} className="tag">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </section>
            <section className="wrap" style={{ paddingBottom: 24 }}>
              <PostListWithLoadMore
                initialPosts={posts}
                skip={1}
                total={meta.total}
                pageSize={PAGE_SIZE}
                locale={lang}
                labels={{ loadMore: dict.loadMore, loading: dict.loading, shownOf: dict.shownOf }}
              />
            </section>
          </>
        ) : (
          <p className="wrap blog-empty">{dict.empty}</p>
        )}
      </main>
    </>
  );
}
