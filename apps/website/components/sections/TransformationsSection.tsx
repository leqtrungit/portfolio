import { tokens } from "@/lib/tokens";

interface Transformation {
  from: string;
  to: string;
  tag: string;
}

// Hardcoded placeholder copy from the design handoff — user will supply final content.
const transformations: Transformation[] = [
  { from: "5-minute API call", to: "1–2 second response", tag: "BOSCH" },
  { from: "manual video edits", to: "1,500 auto-shipped / day", tag: "MEDIA AI" },
  { from: "a 60-step order cycle", to: "60% faster, 0 errors", tag: "HGM BPM" },
  { from: "siloed engineers", to: "independent problem-solvers", tag: "EVERY TEAM" },
];

export function TransformationsSection() {
  return (
    <section style={{ background: tokens.colors.dark, color: tokens.colors.onDark }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 32px 70px" }}>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.14em",
            color: tokens.colors.onDarkAccent,
            marginBottom: 34,
          }}
        >
          SELECTED TRANSFORMATIONS
        </div>
        {transformations.map((t) => (
          <div
            key={t.tag}
            className="trow"
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
            <span style={{ fontSize: 24, color: tokens.colors.onDarkMuted, fontWeight: 500 }}>{t.from}</span>
            <span style={{ fontSize: 34, color: tokens.accent, textAlign: "center" }}>→</span>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>{t.to}</span>
            <span
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
