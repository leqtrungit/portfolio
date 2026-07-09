// apps/website/components/blog/PostRow.tsx
import Link from "next/link";
import { buildImageUrl, type PostSummary } from "@/lib/blog";
import { TagPill } from "@/components/blog/TagPill";
import { tokens } from "@/lib/tokens";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y} · ${m} · ${day}`;
}

export function PostRow({ post }: { post: PostSummary }) {
  const imageUrl = buildImageUrl(post.featured_image_key);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="post-row"
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 40,
        alignItems: "center",
        padding: "42px 0",
        borderBottom: `1px solid ${tokens.colors.borderHairline}`,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Thumbnail */}
      <div
        className="post-thumb"
        style={{
          position: "relative",
          height: 200,
          border: `1.5px solid ${tokens.colors.border}`,
          overflow: "hidden",
          background: tokens.colors.borderMuted,
          flexShrink: 0,
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={post.featured_image_alt ?? post.title}
            className="post-img"
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>

      {/* Text block */}
      <div>
        <div style={{ fontFamily: tokens.fonts.mono, fontSize: 12, color: tokens.colors.onDarkMuted, letterSpacing: "0.04em", marginBottom: 14 }}>
          {formatDate(post.created_at)}
        </div>
        <h2
          className="post-title"
          style={{
            fontWeight: 700,
            fontSize: "clamp(24px, 3.4vw, 33px)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p style={{ fontSize: 16, lineHeight: 1.55, color: tokens.colors.textMuted, margin: "14px 0 20px", maxWidth: 560 }}>
            {post.excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {post.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
