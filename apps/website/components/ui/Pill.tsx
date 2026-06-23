import type { ReactNode } from "react";
import { tokens } from "@/lib/tokens";

export interface PillProps {
  children: ReactNode;
  href?: string;
  variant?: "tag" | "stack" | "social";
}

const VARIANT_STYLES = {
  tag: { fontSize: 11, color: tokens.colors.textFaint, border: tokens.colors.borderMuted, padding: "5px 11px" },
  stack: { fontSize: 12.5, color: tokens.colors.textStrong, border: tokens.colors.borderMuted, padding: "7px 13px" },
  social: { fontSize: 13, color: tokens.colors.onDarkPill, border: tokens.colors.onDarkPillBorder, padding: "9px 16px" },
} as const;

export function Pill({ children, href, variant = "tag" }: PillProps) {
  const v = VARIANT_STYLES[variant];
  const style = {
    fontFamily: tokens.fonts.mono,
    fontSize: v.fontSize,
    color: v.color,
    border: `1px solid ${v.border}`,
    padding: v.padding,
    letterSpacing: "0.03em",
    textDecoration: "none",
    display: "inline-block",
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="pill" style={style}>
        {children}
      </a>
    );
  }

  return (
    <span className="pill" style={style}>
      {children}
    </span>
  );
}
