import Link from "next/link";
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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", color: "inherit" }}>
          <Logo />
        </Link>
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
          <Link href="/" className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
            portfolio
          </Link>
          <Link href="/blog" className="navlink" style={{ textDecoration: "none", color: tokens.accent }}>
            blog
          </Link>
          <Link href="/#contact" className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
            contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
