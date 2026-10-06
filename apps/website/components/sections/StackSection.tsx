import type { Skill } from "@new-portfolio/profile-schema";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Pill } from "@/components/ui/Pill";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { tokens } from "@/lib/tokens";

export interface StackSectionProps {
  skills: Skill[];
  dict: Dictionary["sections"];
}

export function StackSection({ skills, dict }: StackSectionProps) {
  if (skills.length === 0) return null;

  return (
    <section id="stack" style={{ padding: "64px 0 24px" }}>
      <SectionLabel>{dict.stack}</SectionLabel>
      {skills.map((group) => (
        <div
          key={group.name}
          className="stack-row"
          style={{
            display: "grid",
            gridTemplateColumns: "230px 1fr",
            gap: 30,
            padding: "24px 0",
            borderTop: `1px solid ${tokens.colors.borderHairline}`,
            alignItems: "start",
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>{group.name}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {group.keywords.map((kw) => (
              <Pill key={kw} variant="stack">
                {kw}
              </Pill>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
