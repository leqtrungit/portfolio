import { Logo } from "@/components/ui/Logo";
import { tokens } from "@/lib/tokens";

export function BlogHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(246,243,236,.88)",
        backdropFilter: "blur(10px)",
        borderBottom: `1.5px solid ${tokens.colors.border}`,
      }}
    >
      <div
        className="nav-inner"
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", color: "inherit" }}>
          <Logo />
        </a>
        <nav
          className="nav-links"
          style={{
            display: "flex",
            gap: 26,
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.04em",
            color: tokens.colors.textFaint,
          }}
        >
          <a href="/" className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
            portfolio
          </a>
          <a href="/blog" className="navlink" style={{ textDecoration: "none", color: tokens.accent }}>
            blog
          </a>
          <a href="/#contact" className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
            contact
          </a>
        </nav>
      </div>
    </header>
  );
}
