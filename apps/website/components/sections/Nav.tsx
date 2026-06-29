import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NavLink } from "@/components/ui/NavLink";
import { tokens } from "@/lib/tokens";

export interface NavProps {
  name: string;
}

export function Nav({ name }: NavProps) {
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
        <a
          href="#top"
          style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", color: "inherit" }}
        >
          <Logo />
          <span className="nav-name" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>
            {name}
          </span>
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
          <NavLink href="#work">work</NavLink>
          <NavLink href="#projects">projects</NavLink>
          <NavLink href="#stack">stack</NavLink>
          <Link href="/blog" className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
            blog
          </Link>
          <NavLink href="#contact">contact</NavLink>
        </nav>
      </div>
    </header>
  );
}
