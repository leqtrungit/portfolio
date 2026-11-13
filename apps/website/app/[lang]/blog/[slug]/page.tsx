import Link from "next/link";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { resolvePost, fetchAllPosts, translationSlug, coverUrl, estimateReadTime, formatPostDate, type Tag } from "@/lib/blog";
import { buildToc } from "@/lib/toc";
import { PostContent } from "@/components/blog/PostContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { PostNav } from "@/components/blog/PostNav";
import { SubpageHeader } from "@/components/sections/SubpageHeader";
import { ShareBar } from "@/components/blog/ShareBar";
import { truncateForMeta } from "@/lib/seo";
import { isLocale, localePath, locales, ogLocale } from "@/lib/i18n/config";
import { postAlternates } from "@/lib/i18n/seo";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const resolved = await resolvePost(slug, locale);
  if (!resolved) return { title: getDictionary(locale).blog.notFound };
  const { post, redirectTo, hrefs } = resolved;
  if (redirectTo) permanentRedirect(redirectTo);
  const bothPublished = translationSlug(post, "en") != null && translationSlug(post, "vi") != null;
  const description = post.excerpt ? truncateForMeta(post.excerpt) : truncateForMeta(post.title);
  return {
    title: post.title,
    description,
    alternates: {
      ...postAlternates(locale, hrefs, bothPublished),
      types: { "application/rss+xml": "/feed.xml" },
    },

    // OG/Twitter image comes from ./opengraph-image.tsx (Twitter falls back to it).
    openGraph: {
      title: post.title,
      description,
      url: localePath(locale, `/blog/${post.slug}`),
      type: "article",
      locale: ogLocale[isLocale(post.locale) ? post.locale : "vi"],
      publishedTime: post.published_at,
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
    const posts = (await Promise.all([fetchAllPosts("vi"), fetchAllPosts("en")])).flat();
    const params = new Map<string, { lang: string; slug: string }>();
    for (const post of posts) {
      // Cross product so the wrong-locale slug still hits this page and 308s.
      for (const lang of locales) {
        params.set(`${lang}:${post.slug}`, { lang, slug: post.slug });
      }
    }
    return [...params.values()];
  } catch {
    return [];
  }
}

export const dynamicParams = true;
export const revalidate = 3600;

export default async function PostPage({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const resolved = await resolvePost(slug, lang);
  if (!resolved) notFound();
  const { post, redirectTo, hrefs } = resolved;
  if (redirectTo) permanentRedirect(redirectTo);
  const pageUrl = `https://lequoctrung.vn${localePath(lang, `/blog/${post.slug}`)}`;
  const dict = (await getDictionary(lang)).blog;

  const imageUrl = coverUrl(post);
  const readTime = estimateReadTime(post.content, isLocale(post.locale) ? post.locale : "vi");
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
        currentLang={post.locale}
        languagePaths={hrefs}
      />
      <main>
        <section className="wrap post-head">
          <div className="post-grid">
            <span className="post-spacer" />
            <div className="post-head-main">
              <div className="meta post-meta">
                <span className="red">{formatPostDate(post.published_at)}</span>
                <span style={{ color: "var(--slash)" }} aria-hidden="true">
                  /
                </span>
                <span style={{ color: "var(--text-muted)", textTransform: "uppercase" }}>{readTime}</span>
              </div>
              <h1 className="post-title" lang={post.locale}>
                {post.title}
              </h1>
              {post.tags.length > 0 && <Tags tags={post.tags} lang={post.locale} />}
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
            <p className="post-caption" lang={post.locale}>
              {post.excerpt}
            </p>
          </div>
        )}

        <section className="wrap post-main">
          <div className="post-grid">
            {showToc ? (
              <TableOfContents lang={post.locale} items={toc.items} label={dict.toc} ariaLabel={dict.tocAria} />
            ) : (
              <span className="post-spacer" />
            )}
            <article className="post-article">
              <div lang={post.locale}>
                <PostContent html={toc.html} />
              </div>

              <div className="post-foot">
                <div className="post-foot-tags">
                  <span className="post-foot-label">{dict.tagged}</span>
                  <Tags tags={post.tags} lang={post.locale} />
                </div>
                <ShareBar
                  url={pageUrl}
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
            inLanguage: lang,
            description: post.excerpt ?? post.title,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: {
              "@type": "Person",
              name: "Le Quoc Trung",
              url: "https://lequoctrung.vn",
            },
            ...(imageUrl ? { image: `https://lequoctrung.vn${imageUrl}` } : {}),
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": pageUrl,
            },
            url: pageUrl,
          }),
        }}
      />
    </>
  );
}

function Tags({ tags, lang }: { tags: Tag[]; lang: string }) {
  return (
    <div className="tags" lang={lang}>
      {tags.map((tag) => (
        <span key={tag.id} className="tag">
          {tag.name}
        </span>
      ))}
    </div>
  );
}
