import { getProfile } from "@/lib/profile";
import { HomeHeader } from "@/components/sections/HomeHeader";
import { HeroSection } from "@/components/sections/HeroSection";
import { TransformationsSection } from "@/components/sections/TransformationsSection";
import { WorkSection } from "@/components/sections/WorkSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { StackSection } from "@/components/sections/StackSection";
import { LatestBlogSection } from "@/components/sections/LatestBlogSection";
import { EducationCertificatesSection } from "@/components/sections/EducationCertificatesSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n/config";
import { localizedAlternates } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    alternates: {
      ...localizedAlternates(isLocale(lang) ? lang : "en", "/"),
      types: { "application/rss+xml": "/feed.xml" },
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const profile = getProfile(lang);
  const dict = getDictionary(lang);

  return (
    <div className="page">
      <HomeHeader name={profile.basics.name} locale={lang} dict={dict.nav} />
      <main>
        <HeroSection basics={profile.basics} dict={dict.hero} lineBreaks={lang === "en"} />
        <WorkSection work={profile.work} locale={lang} dict={dict.sections} />
        <TransformationsSection dict={dict.transformations} />
        <ProjectsSection projects={profile.projects} dict={dict.sections} />
        <StackSection skills={profile.skills} dict={dict.sections} />
        <EducationCertificatesSection education={profile.education} certificates={profile.certificates} locale={lang} dict={dict.sections} />
        <LatestBlogSection locale={lang} dict={dict.sections} />
      </main>
      <ContactSection basics={profile.basics} languages={profile.languages} locale={lang} dict={dict.contact} />
    </div>
  );
}
