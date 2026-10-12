import { tokens } from "@/lib/tokens";

export interface ChipLogoProps {
  title?: string;
}

const PINS = [30, 50, 70];

// Body outline baked from the design's rough.js render (emblem-gen.js, chip/square variant,
// seeded by the name) so the hand-drawn wobble is identical on every load without shipping rough.js.
const BODY_FILL =
  "M9.02 9.12 L89.33 8.73 L89.18 88.77 L11.37 88.69";
const BODY_STROKE =
  "M9.32 10.75 C37.57 9.57, 64.42 9.63, 91 11.02 M9.8 10.34 C28.83 9.84, 47.41 9.74, 89.57 10.02 M89.38 10.19 C88.43 40.82, 90.04 71.79, 91.22 89.9 M90.08 10.45 C90.66 40.13, 90.41 70.33, 90.17 90.31 M90.83 89.05 C64.16 89.75, 39.55 89.58, 9.33 90.79 M89.95 90.33 C68.85 89.92, 47.02 90.62, 9.73 90.11 M9.7 88.69 C8.59 64.96, 9.74 37.9, 10.45 9.99 M9.79 90.62 C10.49 70.43, 10.2 51.75, 9.42 10.02";

/** "QUỐC TRUNG" circuit-chip emblem from the lacquer design (square variant). */
export function ChipLogo({ title }: ChipLogoProps) {
  const { ink, paper, red, gold } = tokens.colors;
  const text = { fontFamily: tokens.fonts.display, fontWeight: 800, fontStretch: "75%" } as const;

  return (
    <svg viewBox="0 0 100 100" role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {PINS.map((p) => (
        <g key={p} fill={gold}>
          <rect x={p - 4} y={0} width={8} height={10} />
          <rect x={p - 4} y={90} width={8} height={10} />
          <rect x={0} y={p - 4} width={10} height={8} />
          <rect x={90} y={p - 4} width={10} height={8} />
        </g>
      ))}
      <path d={BODY_FILL} fill={ink} />
      <path d={BODY_STROKE} stroke={ink} strokeWidth={2} fill="none" />
      <path d="M44 10 A6 6 0 0 0 56 10 Z" fill={paper} />
      <circle cx={19} cy={19} r={3.4} fill={red} />
      <text x={50} y={46} fontSize={15} letterSpacing={2} textAnchor="middle" fill={paper} style={text}>
        QUỐC
      </text>
      <text x={50} y={75} fontSize={28.26} letterSpacing={0.2} textAnchor="middle" fill={paper} style={text}>
        TRUNG
      </text>
    </svg>
  );
}
