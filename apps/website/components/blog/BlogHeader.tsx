import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { tokens } from "@/lib/tokens";

interface BlogHeaderProps {
  locale: Locale;
  dict: Dictionary["nav"];
}

export function BlogHeader({ locale, dict }: BlogHeaderProps) {
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
        <Link href={localePath(locale, "/")} style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", color: "inherit" }}>
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
          <Link href={localePath(locale, "/")} className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
            {dict.portfolio}
          </Link>
          <Link href={localePath(locale, "/blog")} className="navlink" style={{ textDecoration: "none", color: tokens.accent }}>
            {dict.blog}
          </Link>
          <Link href={localePath(locale, "/#contact")} className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
            {dict.contact}
          </Link>
          <LanguageSwitcher label={dict.language} />
        </nav>
      </div>
    </header>
  );
}
