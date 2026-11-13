"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath, locales, stripLocale, type Locale } from "@/lib/i18n/config";

export interface LanguageSwitcherProps {
  label: string;
  paths?: Partial<Record<Locale, string>>;
}

// Normalizes with stripLocale so it works whether Next reports the visible or the rewritten path.
export function LanguageSwitcher({ label, paths }: LanguageSwitcherProps) {
  const { locale, path } = stripLocale(usePathname());

  return (
    <span role="group" aria-label={label} className="lang">
      {locales.map((target, i) => (
        <span key={target} style={{ display: "inline-flex", gap: 4 }}>
          {i > 0 && <span aria-hidden="true">/</span>}
          {target === locale ? (
            <span aria-current="true" className="lang-active">
              {target.toUpperCase()}
            </span>
          ) : (
            // No prefetch: switching language is rare, and prefetching the other locale of a
            // 404 URL leaves a request hanging on the global not-found page.
            <Link href={paths?.[target] ?? localePath(target, path)} hrefLang={target} lang={target} prefetch={false}>
              {target.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </span>
  );
}
