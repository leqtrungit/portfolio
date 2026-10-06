import { ImageResponse } from "next/og";
import { fetchPost, estimateReadTime, formatPostDate } from "@/lib/blog";
import { loadOgCoverImage, loadOgFonts } from "@/lib/ogImage";
import { getProfile } from "@/lib/profile";
import { notFound } from "next/navigation";
import { tokens } from "@/lib/tokens";
import { isLocale } from "@/lib/i18n/config";

// Layout follows the "Blog OG Images" Claude Design handoff (light variant).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Blog post cover";
export const revalidate = 3600;

const IMAGE_BOX = 420;
const MAX_TAGS = 3;
const TAG_TEXT = "#3d3a30";

function titleSize(title: string): number {
  const len = title.length;
  if (len > 80) return 46;
  if (len > 58) return 52;
  if (len > 48) return 56;
  return 62;
}

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const profile = getProfile(lang);
  const post = await fetchPost(slug, { revalidate }).catch(() => null);

  const title = post?.title ?? "Blog";
  const tags = post?.tags.slice(0, MAX_TAGS).map((t) => t.name) ?? [];
  const [fonts, cover] = await Promise.all([
    loadOgFonts(),
    loadOgCoverImage(post?.featured_image_key ?? null, { size: IMAGE_BOX * 2 }),
  ]);
  const fontSize = titleSize(title);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: tokens.colors.bg,
          color: tokens.colors.text,
          fontFamily: "Bricolage Grotesque",
        }}
      >
        {/* ===== TEXT COLUMN ===== */}
        <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", padding: "56px 52px 52px 68px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: tokens.accent,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  letterSpacing: -0.4,
                }}
              >
                LT
              </div>
              <div style={{ display: "flex", fontSize: 22, letterSpacing: -0.2 }}>{profile.basics.name}</div>
            </div>
            <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 16, letterSpacing: 1.9, color: tokens.accent }}>
              → BLOG
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              fontSize,
              lineHeight: 1.03,
              letterSpacing: -0.03 * fontSize,
              textWrap: "balance",
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              borderTop: `2px solid ${tokens.colors.border}`,
              paddingTop: 22,
              fontFamily: "JetBrains Mono",
            }}
          >
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      display: "flex",
                      fontSize: 16,
                      color: TAG_TEXT,
                      border: `1.5px solid ${tokens.colors.border}`,
                      padding: "6px 13px",
                      letterSpacing: 0.3,
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
            {post && (
              <div style={{ display: "flex", fontSize: 17, color: tokens.colors.textFaint, letterSpacing: 0.7 }}>
                {formatPostDate(post.created_at)}
                <span style={{ color: tokens.colors.borderMuted, margin: "0 10px" }}>/</span>
                {estimateReadTime(post.content, lang)}
              </div>
            )}
          </div>
        </div>

        {/* ===== COVER IMAGE ===== */}
        <div
          style={{
            display: "flex",
            width: IMAGE_BOX,
            height: IMAGE_BOX,
            marginRight: 56,
            border: `2px solid ${tokens.colors.border}`,
            boxShadow: `-12px 12px 0 ${tokens.accent}`,
            background: tokens.colors.borderMuted,
            overflow: "hidden",
          }}
        >
          {cover && (
            // eslint-disable-next-line jsx-a11y/alt-text -- rendered by satori, not the DOM
            <img src={cover} width={IMAGE_BOX - 4} height={IMAGE_BOX - 4} style={{ objectFit: "cover" }} />
          )}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
