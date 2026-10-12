import type { Work } from "@new-portfolio/profile-schema";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { formatPeriod } from "@/lib/formatDate";

export interface WorkSectionProps {
  work: Work[];
  locale: Locale;
  dict: Dictionary["sections"];
}

export function WorkSection({ work, locale, dict }: WorkSectionProps) {
  if (work.length === 0) return null;

  return (
    <section id="work" className="wrap work">
      <SectionHeading number="01">{dict.experience}</SectionHeading>
      {work.map((job) => {
        // highlights[0] is a one-line role narrative, the rest are bullets (see profile.json _note).
        const [narrative, ...highlights] = job.highlights;
        return (
          <article key={`${job.name}-${job.startDate}`} className="job">
            <div className="job-when">
              <span className="job-period">{formatPeriod(job.startDate, job.endDate, locale)}</span>
              {job.summary && <span className="job-mode">{job.summary}</span>}
            </div>
            <div className="job-rail" aria-hidden="true" />
            <div className="job-body">
              <div className="job-head">
                <h3 className="job-title">{job.position}</h3>
              </div>
              <div>
                <div className="job-company">{job.name}</div>
                {narrative && <p className="job-narrative">{narrative}</p>}
                {job.tags.length > 0 && (
                  <div className="tags">
                    {job.tags.map((tag) => (
                      <span key={tag} className="tag tag-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {highlights.length > 0 && (
                <ul className="job-bullets">
                  {highlights.map((highlight, idx) => (
                    <li key={idx}>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
