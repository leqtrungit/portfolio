import Link from "next/link";
import Image from "next/image";
import { buildImageUrl, formatPostDate, type PostSummary } from "@/lib/blog";
import { TagPill } from "@/components/blog/TagPill";
import { localePath, type Locale } from "@/lib/i18n/config";
import { tokens } from "@/lib/tokens";

interface PostCardProps {
  post: PostSummary;
  locale: Locale;
}

export function PostCard({ post, locale }: PostCardProps) {
  const imageUrl = buildImageUrl(post.featured_image_key);

  return (
    <Link
      href={localePath(locale, `/blog/${post.slug}`)}
      className="proj"
      style={{
        border: `1.5px solid ${tokens.colors.border}`,
        background: tokens.colors.cardBg,
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 150,
          borderBottom: `1.5px solid ${tokens.colors.border}`,
          overflow: "hidden",
          background: tokens.colors.borderMuted,
        }}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={post.featured_image_alt ?? post.title}
            fill
            sizes="(max-width: 760px) calc(100vw - 40px), 340px"
            style={{ objectFit: "cover" }}
          />
        )}
      </div>
      <div style={{ padding: "22px 22px 26px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 11,
            color: tokens.colors.textFaint,
            letterSpacing: "0.04em",
            marginBottom: 12,
          }}
        >
          {formatPostDate(post.created_at)}
        </div>
        <div lang="vi" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.25 }}>
          {post.title}
        </div>
        {post.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: "auto", paddingTop: 16 }}>
            {post.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
