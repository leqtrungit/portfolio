import type { Certificate, Education } from "@new-portfolio/profile-schema";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
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
    <section className="wrap edu">
      {primaryEducation && (
        <div>
          <h2 className="mini-head" style={{ margin: 0 }}>
            <span className="red">05</span> · {dict.education}
          </h2>
          <div className="edu-school">{primaryEducation.institution}</div>
          <div className="edu-degree">
            {[primaryEducation.studyType, primaryEducation.area].filter(Boolean).join(" — ")}
          </div>
          {primaryEducation.startDate && (
            <div className="edu-period">
              {formatPeriod(primaryEducation.startDate, primaryEducation.endDate, locale)}
            </div>
          )}
        </div>
      )}
      {certificates.length > 0 && (
        <div>
          <h2 className="mini-head" style={{ margin: 0 }}>
            <span className="red">06</span> · {dict.certificates}
          </h2>
          {certificates.map((cert) => (
            <div key={cert.name} className="cert">
              <div>
                <div className="cert-name">{cert.name}</div>
                {cert.issuer && <div className="cert-issuer">{cert.issuer}</div>}
              </div>
              {cert.date && <span className="cert-date">{formatDate(cert.date, locale)}</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
