import { NavLink } from "@/components/ui/NavLink";
import { tokens } from "@/lib/tokens";

export interface NavProps {
  name: string;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Nav({ name }: NavProps) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(246,243,236,.88)",
        backdropFilter: "blur(10px)",
        borderBottom: `1.5px solid ${tokens.colors.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a
          href="#top"
          style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", color: "inherit" }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              background: tokens.accent,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "-0.02em",
            }}
          >
            {initials(name)}
          </span>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>{name}</span>
        </a>
        <div
          style={{
            display: "flex",
            gap: 26,
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.04em",
            color: tokens.colors.textFaint,
          }}
        >
          <NavLink href="#work">work</NavLink>
          <NavLink href="#projects">projects</NavLink>
          <NavLink href="#stack">stack</NavLink>
          <NavLink href="#contact">contact</NavLink>
        </div>
      </div>
    </div>
  );
}
