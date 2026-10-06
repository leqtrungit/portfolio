import Link from "next/link";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { fetchPost, fetchPosts, buildImageUrl, estimateReadTime, formatPostDate } from "@/lib/blog";
import { buildToc } from "@/lib/toc";
import { PostContent } from "@/components/blog/PostContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { PostNav } from "@/components/blog/PostNav";
import { TagPill } from "@/components/blog/TagPill";
import { ShareBar } from "@/components/blog/ShareBar";
import { tokens } from "@/lib/tokens";
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
      {/* ===== HEADER (max 760px) ===== */}
      <div className="pad-x" style={{ maxWidth: 760, margin: "0 auto", padding: "0 32px" }}>
        <header className="post-head" style={{ padding: "64px 0 34px" }}>
          <Link
            href={localePath(lang, "/blog")}
            style={{
              fontFamily: tokens.fonts.mono,
              fontSize: 12,
              letterSpacing: "0.06em",
              color: tokens.colors.onDarkMuted,
              textDecoration: "none",
              display: "inline-block",
              marginBottom: 30,
            }}
          >
            {dict.allPostsBack}
          </Link>
          <div
            style={{
              fontFamily: tokens.fonts.mono,
              fontSize: 12,
              color: tokens.colors.onDarkMuted,
              letterSpacing: "0.04em",
              marginBottom: 18,
            }}
          >
            {formatPostDate(post.created_at)}{" "}
            <span style={{ color: tokens.colors.borderMuted }}>/</span>{" "}
            {readTime}
          </div>
          <h1
            lang="vi"
            style={{
              fontWeight: 700,
              fontSize: "clamp(32px, 6vw, 52px)",
              lineHeight: 1.06,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            {post.title}
          </h1>
          {post.tags.length > 0 && (
            <div lang="vi" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
              {post.tags.map((tag) => (
                <TagPill key={tag.id} tag={tag} />
              ))}
            </div>
          )}
        </header>
      </div>

      {/* ===== FEATURE IMAGE (max 760px, matches text column) ===== */}
      {imageUrl && (
        <div className="pad-x" style={{ maxWidth: 760, margin: "0 auto", padding: "0 32px 10px" }}>
          <figure
            className="feat"
            style={{
              position: "relative",
              margin: 0,
              height: 460,
              border: `1.5px solid ${tokens.colors.border}`,
              boxShadow: `8px 8px 0 ${tokens.accent}`,
              overflow: "hidden",
            }}
          >
            <Image
              src={imageUrl}
              alt={post.featured_image_alt ?? post.title}
              fill
              priority
              style={{ objectFit: "cover" }}
            />
          </figure>
          <p
            lang="vi"
            style={{
              fontFamily: tokens.fonts.mono,
              fontSize: 11,
              color: tokens.colors.onDarkMuted,
              letterSpacing: "0.03em",
              marginTop: 12,
            }}
          >
            {post.excerpt}
          </p>
        </div>
      )}

      {/* ===== CONTENT (max 680px) ===== */}
      <div className="pad-x" style={{ maxWidth: 680, margin: "0 auto", padding: "0 32px" }}>
        <div className="toc-anchor">
          {showToc && <TableOfContents items={toc.items} label={dict.toc} ariaLabel={dict.tocAria} />}
          <div lang="vi">
            <PostContent html={toc.html} />
          </div>
        </div>

        {/* ===== FOOTER TAGS ===== */}
        <div
          style={{
            padding: "28px 0 80px",
            borderTop: `1px solid ${tokens.colors.borderHairline}`,
          }}
        >
          <div
            style={{
              fontFamily: tokens.fonts.mono,
              fontSize: 11,
              letterSpacing: "0.1em",
              color: tokens.colors.onDarkMuted,
              marginBottom: 14,
            }}
          >
            {dict.tagged}
          </div>
          <div lang="vi" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 34 }}>
            {post.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} />
            ))}
          </div>
          <div
            style={{
              fontFamily: tokens.fonts.mono,
              fontSize: 11,
              letterSpacing: "0.1em",
              color: tokens.colors.onDarkMuted,
              marginBottom: 14,
            }}
          >
            {dict.share}
          </div>
          <ShareBar
            url={`https://lequoctrung.vn/blog/${post.slug}`}
            title={post.title}
            labels={{ share: dict.shareButton, copyLink: dict.copyLink, copied: dict.copied }}
          />
          <div style={{ marginTop: 34 }} />
          <PostNav
            slug={post.slug}
            locale={lang}
            labels={{ prev: dict.prev, next: dict.next, ariaLabel: dict.postNavAria }}
          />
          <Link
            href={localePath(lang, "/blog")}
            className="pill"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: tokens.fonts.mono,
              fontSize: 13,
              color: tokens.colors.text,
              border: `1.5px solid ${tokens.colors.border}`,
              padding: "11px 20px",
              textDecoration: "none",
              letterSpacing: "0.03em",
            }}
          >
            {dict.readMore}
          </Link>
        </div>
      </div>

      {/* ===== RELATED (max 1080px, same grid as the homepage blog section) ===== */}
      <div className="pad-x" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>
        <RelatedPosts slug={post.slug} locale={lang} label={dict.related} />
      </div>
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
