import Link from "next/link";
import { ChipLogo } from "@/components/ui/ChipLogo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export interface SiteHeaderLink {
  href: string;
  label: string;
  current?: boolean;
  /** Hidden on narrow screens, where only the primary links fit. */
  secondary?: boolean;
}

export interface SiteHeaderProps {
  homeHref: string;
  homeLabel: string;
  links: SiteHeaderLink[];
  languageLabel: string;
}

/** Dark bar with the chip emblem hanging off its left edge. */
export function SiteHeader({ homeHref, homeLabel, links, languageLabel }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <Link href={homeHref} aria-label={homeLabel} className="chip-link">
          <ChipLogo />
        </Link>
        <nav className="site-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.current ? "page" : undefined}
              className={link.secondary ? "nav-secondary" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher label={languageLabel} />
        </nav>
      </div>
    </header>
  );
}
