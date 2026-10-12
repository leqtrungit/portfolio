import Link from "next/link";

export interface SiteFooterProps {
  copyright: string;
  links?: { href: string; label: string }[];
}

/** Slim dark footer used on every page except the homepage (which ends with the contact block). */
export function SiteFooter({ copyright, links = [] }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer-inner">
        <span>{copyright}</span>
        {links.length > 0 && (
          <div style={{ display: "flex", gap: 28 }}>
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
