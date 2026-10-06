import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { NotFoundContent } from "@/components/ui/NotFoundContent";
import { htmlLang, stripLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { fontVariables } from "@/lib/fonts";
import { tokens } from "@/lib/tokens";

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

export default async function GlobalNotFound() {
  const locale = await currentLocale();

  return (
    <html lang={htmlLang[locale]} className={fontVariables}>
      <body style={{ fontFamily: tokens.fonts.display, margin: 0, background: tokens.colors.bg, color: tokens.colors.text }}>
        <NotFoundContent />
      </body>
    </html>
  );
}
