import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath } from "@/lib/i18n/config";
import { localizedAlternates, localizedOpenGraph } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { SubpageHeader } from "@/components/sections/SubpageHeader";
import { PageFooter } from "@/components/sections/PageFooter";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale).privacy;
  return {
    title: dict.title,
    openGraph: localizedOpenGraph(locale, "/privacy", { title: dict.title }),
    alternates: localizedAlternates(locale, "/privacy"),
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang).privacy;

  return (
    <div className="page">
      <SubpageHeader locale={lang} crumbs={[{ label: dict.title }]} />
      <main>
        <section className="wrap privacy">
          <div className="privacy-side">
            <div className="kicker red">{dict.kicker}</div>
            <h1 className="page-title">
              <span className="hl">{dict.title}</span>
            </h1>
            <p className="privacy-intro">{dict.intro}</p>
          </div>
          <div className="privacy-list">
            {dict.sections.map((section, i) => (
              <div key={section.heading} className="privacy-item">
                <span className="badge" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="privacy-h">{section.heading}</h2>
                  <p className="privacy-body">{section.body}</p>
                </div>
              </div>
            ))}
            <Link href={localePath(lang, "/")} className="cta-link">
              {dict.backHome}
            </Link>
          </div>
        </section>
      </main>
      <PageFooter locale={lang} />
    </div>
  );
}
