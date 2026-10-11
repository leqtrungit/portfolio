import type { Project } from "@new-portfolio/profile-schema";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/i18n/getDictionary";

export interface ProjectsSectionProps {
  projects: Project[];
  dict: Dictionary["sections"];
}

export function ProjectsSection({ projects, dict }: ProjectsSectionProps) {
  if (projects.length === 0) return null;

  return (
    <section id="projects" className="wrap projects">
      <SectionHeading number="03">{dict.projects}</SectionHeading>
      <div className="proj-grid">
        {projects.map((project, i) => (
          <div key={project.name} className="proj">
            <span className="proj-no">03.{i + 1}</span>
            <h3 className="proj-name">{project.name}</h3>
            {project.description && <p className="proj-desc">{project.description}</p>}
            {project.tags.length > 0 && <div className="proj-tags">{project.tags.join(" · ")}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
