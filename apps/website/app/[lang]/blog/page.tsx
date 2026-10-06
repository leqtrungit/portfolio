import type { Metadata } from "next";
import { fetchPosts } from "@/lib/blog";
import { PostListWithLoadMore } from "@/components/blog/PostListWithLoadMore";
import { notFound } from "next/navigation";
import { tokens } from "@/lib/tokens";
import { fill, isLocale } from "@/lib/i18n/config";
import { localizedAlternates, localizedOpenGraph } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = (await getDictionary(locale)).blog;
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
  const dict = (await getDictionary(lang)).blog;
  const { posts, meta } = await fetchPosts({ limit: 10 });

  const date = new Date()
    .toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { month: "long", year: "numeric" })
    .toUpperCase();
  const countLine = `${fill(meta.total === 1 ? dict.countOne : dict.countMany, { count: meta.total })} · ${fill(dict.updated, { date })}`;

  return (
    <div className="pad-x" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>
      {/* ===== HEADER ===== */}
      <header
        className="blog-head"
        style={{
          padding: "78px 0 36px",
          borderBottom: `1.5px solid ${tokens.colors.border}`,
        }}
      >
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.14em",
            color: tokens.accent,
            marginBottom: 26,
          }}
        >
          {dict.kicker}
        </div>
        <h1
          style={{
            fontWeight: 700,
            fontSize: "clamp(40px, 9vw, 76px)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          {dict.titleLead}{" "}
          <span
            style={{
              fontFamily: tokens.fonts.serif,
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            {dict.titleAccent}
          </span>
        </h1>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.55,
            color: tokens.colors.textMuted,
            maxWidth: 540,
            margin: "24px 0 0",
          }}
        >
          {dict.description}
        </p>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            color: tokens.colors.onDarkMuted,
            letterSpacing: "0.04em",
            marginTop: 22,
          }}
        >
          {countLine}
        </div>
      </header>

      {/* ===== POST LIST ===== */}
      <section style={{ padding: "8px 0 96px" }}>
        {posts.length === 0 ? (
          <p
            style={{
              fontFamily: tokens.fonts.mono,
              fontSize: 13,
              color: tokens.colors.textMuted,
              padding: "48px 0",
            }}
          >
            {dict.empty}
          </p>
        ) : (
          <PostListWithLoadMore
            initialPosts={posts} total={meta.total}
            locale={lang}
            labels={{ loadMore: dict.loadMore, loading: dict.loading }}
          />
        )}
      </section>
    </div>
  );
}
