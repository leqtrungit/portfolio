import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchPost, buildImageUrl, estimateReadTime } from "@/lib/blog";
import { PostContent } from "@/components/blog/PostContent";
import { TagPill } from "@/components/blog/TagPill";
import { tokens } from "@/lib/tokens";
import { truncateForMeta } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) return { title: "Post not found" };
  const description = post.excerpt ? truncateForMeta(post.excerpt) : truncateForMeta(post.title);
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y} · ${m} · ${day}`;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) notFound();

  const imageUrl = buildImageUrl(post.featured_image_key);
  const readTime = estimateReadTime(post.content);

  return (
    <>
      {/* ===== HEADER (max 760px) ===== */}
      <div className="pad-x" style={{ maxWidth: 760, margin: "0 auto", padding: "0 32px" }}>
        <header className="post-head" style={{ padding: "64px 0 34px" }}>
          <Link
            href="/blog"
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
            ← all posts
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
            {formatDate(post.created_at)}{" "}
            <span style={{ color: tokens.colors.borderMuted }}>/</span>{" "}
            {readTime}
          </div>
          <h1
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
              {post.tags.map((tag) => (
                <TagPill key={tag.id} tag={tag} />
              ))}
            </div>
          )}
        </header>
      </div>

      {/* ===== FEATURE IMAGE (max 980px) ===== */}
      {imageUrl && (
        <div className="pad-x" style={{ maxWidth: 980, margin: "0 auto", padding: "0 32px 10px" }}>
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
            <img
              src={imageUrl}
              alt={post.featured_image_alt ?? post.title}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(1) contrast(1.05)",
              }}
            />
            {/* Accent overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: tokens.accent,
                mixBlendMode: "multiply",
                opacity: 0.24,
                pointerEvents: "none",
              }}
            />
            {/* Dark lighten overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: tokens.colors.dark,
                mixBlendMode: "lighten",
                opacity: 0.12,
                pointerEvents: "none",
              }}
            />
          </figure>
          <p
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
        <PostContent html={post.html} />

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
            TAGGED
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 34 }}>
            {post.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} />
            ))}
          </div>
          <Link
            href="/blog"
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
            ← read more posts
          </Link>
        </div>
      </div>
    </>
  );
}
