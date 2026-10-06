import type { Certificate, Education } from "@new-portfolio/profile-schema";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { tokens } from "@/lib/tokens";
import { formatDate, formatPeriod } from "@/lib/formatDate";

export interface EducationCertificatesSectionProps {
  education: Education[];
  certificates: Certificate[];
  locale: Locale;
  dict: Dictionary["sections"];
}

export function EducationCertificatesSection({ education, certificates, locale, dict }: EducationCertificatesSectionProps) {
  const primaryEducation = education[0];
  if (!primaryEducation && certificates.length === 0) return null;

  return (
    <section style={{ padding: "64px 0 24px" }}>
      <div className="edu-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
        {primaryEducation && (
          <div>
            <SectionLabel>{dict.education}</SectionLabel>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>
              {primaryEducation.institution}
            </div>
            <div style={{ fontSize: 15.5, color: tokens.colors.textMuted, marginTop: 6 }}>
              {[primaryEducation.studyType, primaryEducation.area].filter(Boolean).join(" — ")}
            </div>
            {primaryEducation.startDate && (
              <div
                style={{
                  fontFamily: tokens.fonts.mono,
                  fontSize: 12,
                  color: tokens.colors.textFaint,
                  marginTop: 10,
                  letterSpacing: "0.04em",
                }}
              >
                {formatPeriod(primaryEducation.startDate, primaryEducation.endDate, locale)}
              </div>
            )}
          </div>
        )}
        {certificates.length > 0 && (
          <div>
            <SectionLabel>{dict.certificates}</SectionLabel>
            {certificates.map((cert) => (
              <div
                key={cert.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "13px 0",
                  borderBottom: `1px solid ${tokens.colors.borderHairline}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.3 }}>{cert.name}</div>
                  {cert.issuer && <div style={{ fontSize: 13, color: tokens.colors.textFaint }}>{cert.issuer}</div>}
                </div>
                {cert.date && (
                  <div
                    style={{
                      fontFamily: tokens.fonts.mono,
                      fontSize: 12,
                      color: tokens.colors.textFaint,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(cert.date, locale)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
