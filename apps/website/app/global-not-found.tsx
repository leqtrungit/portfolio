import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { NotFoundView } from "@/components/ui/NotFoundView";
import { getProfile } from "@/lib/profile";
import { htmlLang, locales, stripLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { fontVariables } from "@/lib/fonts";
import { tokenCss } from "@/lib/tokens";

// Rendered for every 404 (unmatched URLs and notFound()), since the root layout
// sits under [lang]. The locale comes from the x-pathname header set in proxy.ts.
async function currentLocale() {
  const pathname = (await headers()).get("x-pathname") ?? "/";
  return stripLocale(pathname).locale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  return { title: getDictionary(locale).notFound.title };
}

const names = Object.fromEntries(locales.map((l) => [l, getProfile(l).basics.name])) as Record<Locale, string>;

export default async function GlobalNotFound() {
  const locale = await currentLocale();

  return (
    <html lang={htmlLang[locale]} className={fontVariables}>
      <body>
        <style dangerouslySetInnerHTML={{ __html: tokenCss }} />
        <NotFoundView names={names} />
      </body>
    </html>
  );
}
