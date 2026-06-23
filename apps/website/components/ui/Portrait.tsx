import Image from "next/image";
import { tokens } from "@/lib/tokens";

export interface PortraitProps {
  name: string;
  src?: string;
}

export function Portrait({ name, src }: PortraitProps) {
  return (
    <div
      className="hero-portrait"
      style={{
        position: "relative",
        isolation: "isolate",
        border: `1.5px solid ${tokens.colors.border}`,
        boxShadow: `8px 8px 0 ${tokens.accent}`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 380,
          background: src ? undefined : tokens.colors.borderMuted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.colors.textFaint,
          fontFamily: tokens.fonts.mono,
          fontSize: 12,
        }}
      >
        {src ? (
          <Image
            src={src}
            alt={`${name} — portrait photo`}
            fill
            priority
            style={{ objectFit: "cover" }}
          />
        ) : (
          "Drop your photo"
        )}
      </div>
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
      </div>
    </div>
  );
}
