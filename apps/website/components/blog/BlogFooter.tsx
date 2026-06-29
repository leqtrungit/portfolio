import Link from "next/link";
import { tokens } from "@/lib/tokens";

export function BlogFooter({ name, city }: { name: string; city?: string }) {
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
        <Link href="/" style={{ color: tokens.colors.onDarkPill, textDecoration: "none" }}>
          ← back to portfolio
        </Link>
      </div>
    </footer>
  );
}
