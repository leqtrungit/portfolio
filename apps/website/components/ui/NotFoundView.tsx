"use client";

import { usePathname } from "next/navigation";
import { SubpageNav } from "@/components/ui/SubpageNav";
import { NotFoundContent } from "@/components/ui/NotFoundContent";
import { localePath, stripLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export interface NotFoundViewProps {
  names: Record<Locale, string>;
}

// A client component on purpose: not-found files cannot read route params, and reading the
// locale from request headers would opt every [lang] page out of static rendering.
export function NotFoundView({ names }: NotFoundViewProps) {
  const { locale } = stripLocale(usePathname() ?? "/");
  const dict = getDictionary(locale);
  const t = dict.notFound;

  return (
    <div className="page">
      <SubpageNav locale={locale} name={names[locale]} dict={dict.nav} crumbs={[{ label: "404" }]} />
      <main>
        <NotFoundContent homeHref={localePath(locale, "/")} title={t.title} body={t.body} homeLabel={t.home} />
      </main>
    </div>
  );
}
