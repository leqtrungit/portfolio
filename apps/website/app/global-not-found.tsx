import "./globals.css";
import { headers } from "next/headers";
import { NotFoundContent } from "@/components/ui/NotFoundContent";
import { htmlLang, stripLocale } from "@/lib/i18n/config";
import { tokens } from "@/lib/tokens";

// Rendered for every 404 (unmatched URLs and notFound()), since the root layout
// sits under [lang]. The locale comes from the x-pathname header set in proxy.ts.
export default async function GlobalNotFound() {
  const pathname = (await headers()).get("x-pathname") ?? "/";
  const { locale } = stripLocale(pathname);

  return (
    <html lang={htmlLang[locale]}>
      <body style={{ fontFamily: tokens.fonts.display, margin: 0, background: tokens.colors.bg, color: tokens.colors.text }}>
        <NotFoundContent />
      </body>
    </html>
  );
}
