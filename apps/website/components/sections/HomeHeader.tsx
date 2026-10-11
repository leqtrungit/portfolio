import { SiteHeader } from "@/components/ui/SiteHeader";
import { fill, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

export interface HomeHeaderProps {
  name: string;
  locale: Locale;
  dict: Dictionary["nav"];
}

export function HomeHeader({ name, locale, dict }: HomeHeaderProps) {
  return (
    <SiteHeader
      homeHref={localePath(locale, "/")}
      homeLabel={fill(dict.homeAria, { name })}
      languageLabel={dict.language}
      links={[
        { href: "#work", label: dict.work, secondary: true },
        { href: "#projects", label: dict.projects, secondary: true },
        { href: "#stack", label: dict.stack, secondary: true },
        { href: localePath(locale, "/blog"), label: dict.blog },
        { href: "#contact", label: dict.contact },
      ]}
    />
  );
}
