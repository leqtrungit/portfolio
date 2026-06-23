import { getProfile } from "@/lib/profile";
import { Nav } from "@/components/sections/Nav";
import { HeroSection } from "@/components/sections/HeroSection";
import { TransformationsSection } from "@/components/sections/TransformationsSection";
import { WorkSection } from "@/components/sections/WorkSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { StackSection } from "@/components/sections/StackSection";
import { EducationCertificatesSection } from "@/components/sections/EducationCertificatesSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { tokens } from "@/lib/tokens";

export default function HomePage() {
  const profile = getProfile();

  return (
    <div style={{ background: tokens.colors.bg, color: tokens.colors.text, minHeight: "100vh", overflowX: "hidden" }}>
      <Nav name={profile.basics.name} />
      <main id="top" className="pad-x" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>
        <HeroSection basics={profile.basics} />
      </main>
      <TransformationsSection />
      <div className="pad-x" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>
        <WorkSection work={profile.work} />
        <ProjectsSection projects={profile.projects} />
        <StackSection skills={profile.skills} />
        <EducationCertificatesSection education={profile.education} certificates={profile.certificates} />
      </div>
      <ContactSection basics={profile.basics} languages={profile.languages} />
    </div>
  );
}
