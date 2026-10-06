import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/config";
import { tokens } from "@/lib/tokens";

interface BlogFooterProps {
  name: string;
  city?: string;
  locale: Locale;
  labels: { privacy: string; backToPortfolio: string };
}

export function BlogFooter({ name, city, locale, labels }: BlogFooterProps) {
  return (
    <footer style={{ background: tokens.colors.dark, color: tokens.colors.onDark }}>
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "44px 32px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 16,
          fontFamily: tokens.fonts.mono,
          fontSize: 12,
          color: tokens.colors.onDarkMuted,
          letterSpacing: "0.04em",
        }}
      >
        <span>© {new Date().getFullYear()} {name}{city ? ` — ${city}` : ""}</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          <Link href={localePath(locale, "/privacy")} style={{ color: tokens.colors.onDarkPill, textDecoration: "none" }}>
            {labels.privacy}
          </Link>
          <Link href={localePath(locale, "/")} style={{ color: tokens.colors.onDarkPill, textDecoration: "none" }}>
            {labels.backToPortfolio}
          </Link>
        </div>
      </div>
    </footer>
  );
}
