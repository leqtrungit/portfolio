import type { ReactNode } from "react";
import { tokens } from "@/lib/tokens";

export interface SectionLabelProps {
  children: ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 44 }}>
      <span
        style={{
          fontFamily: tokens.fonts.mono,
          fontSize: 13,
          letterSpacing: "0.1em",
          color: tokens.accent,
          whiteSpace: "nowrap",
        }}
      >
        → {children}
      </span>
      <span style={{ flex: 1, height: 1.5, background: tokens.colors.border }} />
    </div>
  );
}
