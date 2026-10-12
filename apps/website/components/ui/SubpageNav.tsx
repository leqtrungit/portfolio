import { SiteHeader } from "@/components/ui/SiteHeader";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { fill, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

export interface SubpageNavProps {
  locale: Locale;
  name: string;
  dict: Dictionary["nav"];
  /** Crumbs after "Home"; the last one is the current page. */
  crumbs: Crumb[];
  /** Highlights the BLOG nav link on blog pages. */
  inBlog?: boolean;
  currentLang?: string;
}

/** Header + breadcrumb bar shared by the blog, post, privacy and 404 pages. */
export function SubpageNav({ locale, name, dict, crumbs, inBlog, currentLang }: SubpageNavProps) {
  const home = localePath(locale, "/");
  return (
    <>
      <SiteHeader
        homeHref={home}
        homeLabel={fill(dict.homeAria, { name })}
        languageLabel={dict.language}
        links={[
          { href: home, label: dict.portfolio },
          { href: localePath(locale, "/blog"), label: dict.blog, current: inBlog },
          { href: localePath(locale, "/#contact"), label: dict.contact },
        ]}
      />
      <Breadcrumbs items={[{ label: dict.home, href: home }, ...crumbs]} currentLang={currentLang} />
    </>
  );
}
