import { tokens } from "@/lib/tokens";

export interface PortraitProps {
  name: string;
  src?: string;
}

export function Portrait({ name, src }: PortraitProps) {
  return (
    <div
      style={{
        position: "relative",
        isolation: "isolate",
        border: `1.5px solid ${tokens.colors.border}`,
        boxShadow: `8px 8px 0 ${tokens.accent}`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: 380,
          background: src ? `url(${src}) center/cover` : tokens.colors.borderMuted,
          filter: "grayscale(1) contrast(1.06) brightness(1.02)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.colors.textFaint,
          fontFamily: tokens.fonts.mono,
          fontSize: 12,
        }}
      >
        {!src && "Drop your photo"}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: tokens.accent,
          mixBlendMode: "multiply",
          opacity: 0.34,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: tokens.colors.dark,
          mixBlendMode: "lighten",
          opacity: 0.16,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "9px 12px",
          background: tokens.colors.dark,
          color: tokens.colors.onDark,
          fontFamily: tokens.fonts.mono,
          fontSize: 10.5,
          letterSpacing: "0.08em",
          pointerEvents: "none",
        }}
      >
        <span>{name}</span>
        <span style={{ color: tokens.colors.onDarkAccent }}>SAIGON</span>
      </div>
    </div>
  );
}
