import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/profile";
import { truncateForMeta } from "@/lib/seo";
import { tokens } from "@/lib/tokens";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const profile = getProfile();
  const { name, label, summary, url } = profile.basics;
  const domain = url ? url.replace(/^https?:\/\//, "") : "lequoctrung.vn";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "90px",
          background: tokens.colors.bg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 110,
              height: 110,
              background: tokens.accent,
              boxShadow: `8px 8px 0 ${tokens.colors.dark}`,
              color: tokens.colors.onDark,
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            LT
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: tokens.colors.text }}>{name}</div>
            {label && (
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  color: tokens.colors.accentMuted,
                  letterSpacing: 6,
                  marginTop: 14,
                }}
              >
                {label.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            borderTop: `2px solid ${tokens.colors.borderMuted}`,
            paddingTop: 28,
          }}
        >
          {summary && (
            <div style={{ display: "flex", fontSize: 26, color: tokens.colors.textMuted, maxWidth: 980 }}>
              {truncateForMeta(summary, 110)}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 22, color: tokens.colors.textFaint, letterSpacing: 2 }}>
            {domain}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
