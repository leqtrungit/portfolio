import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tokens } from "@/lib/tokens";
import { isLocale, localePath } from "@/lib/i18n/config";
import { localizedAlternates } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = (await getDictionary(locale)).privacy;
  return {
    title: dict.title,
    alternates: localizedAlternates(locale, "/privacy"),
  };
}

const sectionLabel: CSSProperties = {
  fontFamily: tokens.fonts.mono,
  fontSize: 11,
  letterSpacing: "0.1em",
  color: tokens.colors.textFaint,
  marginBottom: 10,
  marginTop: 0,
};

const bodyText: CSSProperties = {
  fontFamily: tokens.fonts.serif,
  fontSize: 17,
  lineHeight: 1.65,
  color: tokens.colors.textStrong,
  margin: "0 0 28px",
};

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = (await getDictionary(lang)).privacy;
  return (
    <div className="pad-x" style={{ maxWidth: 680, margin: "0 auto", padding: "0 32px" }}>
      <header style={{ padding: "64px 0 34px" }}>
        <Link
          href={localePath(lang, "/")}
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.06em",
            color: tokens.colors.textFaint,
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 30,
          }}
        >
          {dict.home}
        </Link>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            color: tokens.colors.textFaint,
            letterSpacing: "0.04em",
            marginBottom: 18,
          }}
        >
          {dict.kicker}
        </div>
        <h1
          style={{
            fontWeight: 700,
            fontSize: "clamp(32px, 6vw, 52px)",
            lineHeight: 1.06,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          {dict.title}
        </h1>
        <p
          style={{
            fontFamily: tokens.fonts.serif,
            fontSize: 18,
            lineHeight: 1.55,
            color: tokens.colors.textMuted,
            margin: "20px 0 0",
          }}
        >
          {dict.intro}
        </p>
      </header>

      <section style={{ paddingBottom: 80 }}>
        {dict.sections.map((section) => (
          <div key={section.heading}>
            <h2 style={sectionLabel}>{section.heading}</h2>
            <p style={bodyText}>{section.body}</p>
          </div>
        ))}

        <Link
          href={localePath(lang, "/")}
          className="pill"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: tokens.fonts.mono,
            fontSize: 13,
            color: tokens.colors.text,
            border: `1.5px solid ${tokens.colors.border}`,
            padding: "11px 20px",
            textDecoration: "none",
            letterSpacing: "0.03em",
          }}
        >
          {dict.backHome}
        </Link>
      </section>
    </div>
  );
}
