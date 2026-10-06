"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { localePath, stripLocale } from "@/lib/i18n/config";
import { tokens } from "@/lib/tokens";

// not-found files cannot read route params, so the locale is derived from the URL.
export function NotFoundContent() {
  const { locale } = stripLocale(usePathname());
  const t = getDictionary(locale).notFound;

  return (
    <div className="pad-x" style={{ maxWidth: 680, margin: "0 auto", padding: "0 32px" }}>
      <header style={{ padding: "64px 0 34px" }}>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            color: tokens.colors.textFaint,
            letterSpacing: "0.04em",
            marginBottom: 18,
          }}
        >
          404
        </div>
        <h1
          style={{
            fontWeight: 700,
            fontSize: "clamp(32px, 6vw, 52px)",
            lineHeight: 1.06,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          {t.title}
        </h1>
        <p
          style={{
            fontFamily: tokens.fonts.serif,
            fontSize: 17,
            lineHeight: 1.65,
            color: tokens.colors.textStrong,
            margin: "20px 0 30px",
          }}
        >
          {t.body}
        </p>
        <Link
          href={localePath(locale, "/")}
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.06em",
            color: tokens.colors.textFaint,
            textDecoration: "none",
          }}
        >
          {t.home}
        </Link>
      </header>
    </div>
  );
}
