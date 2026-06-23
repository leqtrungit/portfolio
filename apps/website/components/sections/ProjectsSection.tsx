import type { Project } from "@new-portfolio/profile-schema";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Pill } from "@/components/ui/Pill";
import { tokens } from "@/lib/tokens";

export interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (projects.length === 0) return null;

  return (
    <section id="projects" style={{ padding: "64px 0 24px" }}>
      <SectionLabel>SELECTED PROJECTS</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {projects.map((project) => (
          <div
            key={project.name}
            className="proj"
            style={{
              border: `1.5px solid ${tokens.colors.border}`,
              background: tokens.colors.cardBg,
              padding: "30px 28px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: 23, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
              {project.name}
            </span>
            {project.description && (
              <p style={{ fontSize: 15.5, lineHeight: 1.55, color: tokens.colors.textMuted, margin: "14px 0 22px" }}>
                {project.description}
              </p>
            )}
            {project.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto" }}>
                {project.tags.map((tag) => (
                  <Pill key={tag}>{tag}</Pill>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
