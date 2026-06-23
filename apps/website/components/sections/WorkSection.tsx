import type { Work } from "@new-portfolio/profile-schema";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Pill } from "@/components/ui/Pill";
import { tokens } from "@/lib/tokens";
import { formatPeriod } from "@/lib/formatDate";

export interface WorkSectionProps {
  work: Work[];
}

export function WorkSection({ work }: WorkSectionProps) {
  if (work.length === 0) return null;

  return (
    <section id="work" style={{ padding: "88px 0 24px" }}>
      <SectionLabel>EXPERIENCE</SectionLabel>
      {work.map((job) => {
        const [narrative, ...highlights] = job.highlights;
        return (
          <div
            key={`${job.name}-${job.startDate}`}
            style={{
              display: "grid",
              gridTemplateColumns: "230px 1fr",
              gap: 30,
              padding: "34px 0",
              borderTop: `1px solid ${tokens.colors.borderHairline}`,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: tokens.fonts.mono,
                  fontSize: 12,
                  color: tokens.colors.textFainter,
                  letterSpacing: "0.04em",
                }}
              >
                {formatPeriod(job.startDate, job.endDate)}
              </div>
              {job.summary && (
                <div
                  style={{
                    fontFamily: tokens.fonts.mono,
                    fontSize: 12,
                    color: tokens.accent,
                    marginTop: 8,
                    letterSpacing: "0.04em",
                  }}
                >
                  {job.summary.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-0.01em" }}>{job.position}</div>
              <div style={{ fontSize: 16, color: tokens.colors.textMuted, marginTop: 3, fontWeight: 500 }}>
                {job.name}
              </div>
              {narrative && (
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: tokens.colors.textMuted,
                    margin: "16px 0 0",
                    maxWidth: 620,
                  }}
                >
                  {narrative}
                </p>
              )}
              {highlights.length > 0 && (
                <ul
                  style={{
                    margin: "18px 0 0",
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 11,
                  }}
                >
                  {highlights.map((highlight, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "18px 1fr",
                        gap: 10,
                        fontSize: 15.5,
                        lineHeight: 1.5,
                        color: tokens.colors.textStrong,
                      }}
                    >
                      <span style={{ color: tokens.accent }}>→</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
              {job.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                  {job.tags.map((tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
