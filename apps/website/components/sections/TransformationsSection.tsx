import type { Dictionary } from "@/lib/i18n/getDictionary";
import { tokens } from "@/lib/tokens";

export interface TransformationsSectionProps {
  dict: Dictionary["transformations"];
}

export function TransformationsSection({ dict }: TransformationsSectionProps) {
  return (
    <section style={{ background: tokens.colors.dark, color: tokens.colors.onDark }}>
      <div className="tf-inner" style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 32px 70px" }}>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.14em",
            color: tokens.colors.onDarkAccent,
            marginBottom: 34,
          }}
        >
          {dict.label}
        </div>
        {dict.items.map((t) => (
          <div
            key={t.tag}
            className="trow tf-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 86px 1fr 150px",
              gap: 26,
              alignItems: "center",
              padding: "26px 12px",
              borderBottom: `1px solid ${tokens.colors.onDarkBorder}`,
              margin: "0 -12px",
            }}
          >
            <span className="tf-from" style={{ fontSize: 24, color: tokens.colors.onDarkMuted, fontWeight: 500 }}>
              {t.from}
            </span>
            <span className="tf-arrow" style={{ fontSize: 34, color: tokens.accent, textAlign: "center" }}>
              →
            </span>
            <span className="tf-to" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>
              {t.to}
            </span>
            <span
              className="tf-tag"
              style={{
                fontFamily: tokens.fonts.mono,
                fontSize: 12,
                textAlign: "right",
                color: tokens.colors.onDarkMuted,
              }}
            >
              {t.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
