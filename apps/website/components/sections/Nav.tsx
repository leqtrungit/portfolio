import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NavLink } from "@/components/ui/NavLink";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { tokens } from "@/lib/tokens";

export interface NavProps {
  name: string;
  locale: Locale;
  dict: Dictionary["nav"];
}

export function Nav({ name, locale, dict }: NavProps) {
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
          <NavLink href="#work">{dict.work}</NavLink>
          <NavLink href="#projects">{dict.projects}</NavLink>
          <NavLink href="#stack">{dict.stack}</NavLink>
          <Link href={localePath(locale, "/blog")} className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
            {dict.blog}
          </Link>
          <NavLink href="#contact">{dict.contact}</NavLink>
          <LanguageSwitcher label={dict.language} />
        </nav>
      </div>
    </header>
  );
}
