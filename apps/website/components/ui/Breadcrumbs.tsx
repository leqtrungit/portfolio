import { Fragment } from "react";
import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  /** Marks the last crumb as Vietnamese (post titles) for correct hyphenation/screen readers. */
  currentLang?: string;
}

export function Breadcrumbs({ items, currentLang }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <div className="wrap crumbs-inner">
        {items.map((item, i) => (
          <Fragment key={`${i}-${item.label}`}>
            {i > 0 && <span className="crumb-sep" aria-hidden="true" />}
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span className="crumb-current" aria-current="page" lang={currentLang}>
                {item.label}
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </nav>
  );
}
