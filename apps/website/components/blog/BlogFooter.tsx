import { tokens } from "@/lib/tokens";

export function BlogFooter({ name }: { name: string }) {
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
        <span>© 2026 {name} — Saigon</span>
        <a href="/" style={{ color: tokens.colors.onDarkPill, textDecoration: "none" }}>
          ← back to portfolio
        </a>
      </div>
    </footer>
  );
}
