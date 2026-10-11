import type { ReactNode } from "react";

export interface SectionHeadingProps {
  /** Badge text, e.g. "01" or "→". */
  number: string;
  children: ReactNode;
  /** Gold badge for dark sections. */
  tone?: "light" | "dark";
  action?: ReactNode;
}

export function SectionHeading({ number, children, tone = "light", action }: SectionHeadingProps) {
  return (
    <div className="sec-head">
      <span className={tone === "dark" ? "badge badge-gold" : "badge"} aria-hidden="true">
        {number}
      </span>
      <h2 className="sec-title">{children}</h2>
      {action}
    </div>
  );
}
