import type { Certificate, Education } from "@new-portfolio/profile-schema";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { tokens } from "@/lib/tokens";
import { formatDate, formatPeriod } from "@/lib/formatDate";

export interface EducationCertificatesSectionProps {
  education: Education[];
  certificates: Certificate[];
}

export function EducationCertificatesSection({ education, certificates }: EducationCertificatesSectionProps) {
  const primaryEducation = education[0];
  if (!primaryEducation && certificates.length === 0) return null;

  return (
    <section style={{ padding: "64px 0 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
        {primaryEducation && (
          <div>
            <SectionLabel>EDUCATION</SectionLabel>
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
                  color: tokens.colors.textFainter,
                  marginTop: 10,
                  letterSpacing: "0.04em",
                }}
              >
                {formatPeriod(primaryEducation.startDate, primaryEducation.endDate)}
              </div>
            )}
          </div>
        )}
        {certificates.length > 0 && (
          <div>
            <SectionLabel>CERTIFICATES</SectionLabel>
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
                  {cert.issuer && <div style={{ fontSize: 13, color: tokens.colors.textFainter }}>{cert.issuer}</div>}
                </div>
                {cert.date && (
                  <div
                    style={{
                      fontFamily: tokens.fonts.mono,
                      fontSize: 12,
                      color: tokens.colors.textFainter,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(cert.date)}
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
