import type { ReactNode } from "react";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { getProfile } from "@/lib/profile";
import { notFound } from "next/navigation";
import { tokens } from "@/lib/tokens";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function BlogLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const profile = getProfile(lang);
  const dict = await getDictionary(lang);
  return (
    <div style={{ background: tokens.colors.bg, color: tokens.colors.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <BlogHeader locale={lang} dict={dict.nav} />
      <main style={{ flex: 1 }}>{children}</main>
      <BlogFooter
        name={profile.basics.name}
        city={profile.basics.location?.city}
        locale={lang}
        labels={{ privacy: dict.blog.privacy, backToPortfolio: dict.blog.backToPortfolio }}
      />
    </div>
  );
}
