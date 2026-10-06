"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath, locales, stripLocale } from "@/lib/i18n/config";
import { tokens } from "@/lib/tokens";

export interface LanguageSwitcherProps {
  label: string;
}

// Normalizes with stripLocale so it works whether Next reports the visible or the rewritten path.
export function LanguageSwitcher({ label }: LanguageSwitcherProps) {
  const { locale, path } = stripLocale(usePathname());

  return (
    <nav
      aria-label={label}
      style={{
        display: "flex",
        gap: 8,
        fontFamily: tokens.fonts.mono,
        fontSize: 12,
        letterSpacing: "0.04em",
        color: tokens.colors.textFaint,
      }}
    >
      {locales.map((target, i) => (
        <span key={target} style={{ display: "inline-flex", gap: 8 }}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {target === locale ? (
            <span aria-current="true" style={{ color: tokens.accent }}>
              {target.toUpperCase()}
            </span>
          ) : (
            <Link
              href={localePath(target, path)}
              hrefLang={target}
              lang={target}
              className="navlink"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {target.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
