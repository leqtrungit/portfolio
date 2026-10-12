import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { PageFooter } from "@/components/sections/PageFooter";
import { isLocale } from "@/lib/i18n/config";

export default async function BlogLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <div className="page">
      {children}
      <PageFooter locale={lang} withPrivacy />
    </div>
  );
}
