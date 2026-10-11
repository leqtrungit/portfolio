import type { Skill } from "@new-portfolio/profile-schema";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/i18n/getDictionary";

export interface StackSectionProps {
  skills: Skill[];
  dict: Dictionary["sections"];
}

export function StackSection({ skills, dict }: StackSectionProps) {
  if (skills.length === 0) return null;

  return (
    <section id="stack" className="wrap stack">
      <SectionHeading number="04">{dict.stack}</SectionHeading>
      {skills.map((group) => (
        <div key={group.name} className="stack-row">
          <span className="stack-name">{group.name}</span>
          <div className="stack-kw">
            {group.keywords.map((kw) => (
              <span key={kw} className="chip">
                {kw}
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
