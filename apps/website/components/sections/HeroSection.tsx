import type { Basics } from "@new-portfolio/profile-schema";
import { Portrait } from "@/components/ui/Portrait";
import { tokens } from "@/lib/tokens";

export interface HeroSectionProps {
  basics: Basics;
}

export function HeroSection({ basics }: HeroSectionProps) {
  return (
    <section
      className="hero"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 300px",
        gap: 56,
        alignItems: "center",
        padding: "88px 0 72px",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.14em",
            color: tokens.accent,
            marginBottom: 34,
          }}
        >
          {basics.label?.toUpperCase()} — EST. SAIGON
        </div>
        <h1
          style={{
            fontWeight: 700,
            fontSize: "clamp(33px, 8vw, 62px)",
            lineHeight: 1.03,
            letterSpacing: "-0.03em",
            margin: 0,
            fontFamily: tokens.fonts.display,
          }}
        >
          I turn root-cause analysis into <span style={{ color: tokens.accent }}>scalable solutions</span>{" "}
          <span style={{ fontFamily: tokens.fonts.serif, fontStyle: "italic", fontWeight: 400 }}>—</span> and teams
          into{" "}
          <span
            style={{
              textDecoration: "underline",
              textDecorationColor: tokens.accent,
              textDecorationThickness: 3,
              textUnderlineOffset: 6,
            }}
          >
            independent problem-solvers.
          </span>
        </h1>
        {basics.summary && (
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.55,
              color: tokens.colors.textMuted,
              maxWidth: 560,
              margin: "34px 0 0",
              fontWeight: 400,
            }}
          >
            {basics.summary}
          </p>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 22,
            alignItems: "center",
            marginTop: 40,
            fontFamily: tokens.fonts.mono,
            fontSize: 13,
            color: tokens.colors.textFaint,
            letterSpacing: "0.03em",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: tokens.colors.available }} />
            available for select work
          </span>
          {basics.location?.city && (
            <>
              <span style={{ color: tokens.colors.borderMuted }}>/</span>
              <span>
                {basics.location.city}
                {basics.location.region ? `, ${basics.location.region}` : ""}
              </span>
            </>
          )}
        </div>
      </div>

      <Portrait name={basics.name} />
    </section>
  );
}
