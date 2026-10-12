import Link from "next/link";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { fetchPost, fetchPosts, buildImageUrl, estimateReadTime, formatPostDate, type Tag } from "@/lib/blog";
import { buildToc } from "@/lib/toc";
import { PostContent } from "@/components/blog/PostContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { PostNav } from "@/components/blog/PostNav";
import { SubpageHeader } from "@/components/sections/SubpageHeader";
import { ShareBar } from "@/components/blog/ShareBar";
import { truncateForMeta } from "@/lib/seo";
import { isLocale, localePath, locales } from "@/lib/i18n/config";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const post = await fetchPost(slug);
  if (!post) return { title: (await getDictionary(locale)).blog.notFound };
  const description = post.excerpt ? truncateForMeta(post.excerpt) : truncateForMeta(post.title);
  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
      types: { "application/rss+xml": "/feed.xml" },
    },

    // OG/Twitter image comes from ./opengraph-image.tsx (Twitter falls back to it).
    openGraph: {
      title: post.title,
      description,
      url: `/blog/${slug}`,
      type: "article",
      locale: "vi_VN",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export async function generateStaticParams() {
  try {
    const { posts } = await fetchPosts({ limit: 100 });
    return locales.flatMap((lang) => posts.map((p) => ({ lang, slug: p.slug })));
  } catch {
    return [];
  }
}

export const revalidate = 3600;

export default async function PostPage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const post = await fetchPost(slug);
  if (!post) notFound();
  const dict = (await getDictionary(lang)).blog;

  const imageUrl = buildImageUrl(post.featured_image_key);
  const readTime = estimateReadTime(post.content, lang);
  const toc = buildToc(post.html);
  // A contents list only pays off once there are a few sections to jump between.
  const showToc = toc.items.length >= 3;

  return (
    <>
      <ReadingProgress target=".post-body" />
      <SubpageHeader
        locale={lang}
        crumbs={[{ label: "Blog", href: localePath(lang, "/blog") }, { label: post.title }]}
        inBlog
        currentLang="vi"
      />
      <main>
        <section className="wrap post-head">
          <div className="post-grid">
            <span className="post-spacer" />
            <div className="post-head-main">
              <div className="meta post-meta">
                <span className="red">{formatPostDate(post.created_at)}</span>
                <span style={{ color: "var(--slash)" }} aria-hidden="true">
                  /
                </span>
                <span style={{ color: "var(--text-muted)", textTransform: "uppercase" }}>{readTime}</span>
              </div>
              <h1 className="post-title" lang="vi">
                {post.title}
              </h1>
              {post.tags.length > 0 && <Tags tags={post.tags} />}
            </div>
          </div>
        </section>

        {imageUrl && (
          <div className="wrap">
            <figure className="post-figure">
              <div className="post-figure-inner">
                <div className="post-figure-img">
                  <Image
                    src={imageUrl}
                    alt={post.featured_image_alt ?? post.title}
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 1168px"
                  />
                </div>
              </div>
            </figure>
          </div>
        )}
        {post.excerpt && (
          <div className="wrap post-grid post-caption-row">
            <span className="post-spacer" />
            <p className="post-caption" lang="vi">
              {post.excerpt}
            </p>
          </div>
        )}

        <section className="wrap post-main">
          <div className="post-grid">
            {showToc ? (
              <TableOfContents items={toc.items} label={dict.toc} ariaLabel={dict.tocAria} />
            ) : (
              <span className="post-spacer" />
            )}
            <article className="post-article">
              <div lang="vi">
                <PostContent html={toc.html} />
              </div>

              <div className="post-foot">
                <div className="post-foot-tags">
                  <span className="post-foot-label">{dict.tagged}</span>
                  <Tags tags={post.tags} />
                </div>
                <ShareBar
                  url={`https://lequoctrung.vn/blog/${post.slug}`}
                  title={post.title}
                  labels={{ share: dict.shareButton, copyLink: dict.copyLink, copied: dict.copied }}
                />
              </div>
              <PostNav
                slug={post.slug}
                locale={lang}
                labels={{ prev: dict.prev, next: dict.next, ariaLabel: dict.postNavAria }}
              />
              <Link href={localePath(lang, "/blog")} className="cta-link">
                {dict.readMore}
              </Link>
            </article>
          </div>
        </section>

        <RelatedPosts slug={post.slug} locale={lang} label={dict.related} />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            inLanguage: "vi",
            description: post.excerpt ?? post.title,
            datePublished: post.created_at,
            dateModified: post.updated_at,
            author: {
              "@type": "Person",
              name: "Le Quoc Trung",
              url: "https://lequoctrung.vn",
            },
            ...(imageUrl ? { image: `https://lequoctrung.vn${imageUrl}` } : {}),
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://lequoctrung.vn/blog/${post.slug}`,
            },
            url: `https://lequoctrung.vn/blog/${post.slug}`,
          }),
        }}
      />
    </>
  );
}

function Tags({ tags }: { tags: Tag[] }) {
  return (
    <div className="tags" lang="vi">
      {tags.map((tag) => (
        <span key={tag.id} className="tag">
          {tag.name}
        </span>
      ))}
    </div>
  );
}
