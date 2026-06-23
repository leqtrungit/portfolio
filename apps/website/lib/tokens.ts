/**
 * Single source for design tokens (colors, fonts) — taken from the
 * "Portfolio V1" Claude Design handoff. Update here when the design changes;
 * components/ui/* and sections/* should read from here, not hardcode values.
 */
export const tokens = {
  accent: "#cf4326",
  colors: {
    bg: "#f6f3ec",
    text: "#17150f",
    textStrong: "#2c2920",
    textMuted: "#565244",
    textFaint: "#6b6657",
    textFainter: "#8a8474",
    border: "#17150f",
    borderMuted: "#cabfa9",
    borderHairline: "#ddd6c8",
    dark: "#17150f",
    onDark: "#f6f3ec",
    onDarkMuted: "#8a8474",
    onDarkBorder: "#322e23",
    onDarkAccent: "#e98b6f",
    onDarkPill: "#cabfa9",
    onDarkPillBorder: "#3a352a",
    available: "#3f9c5b",
    cardBg: "#fbf9f3",
  },
  fonts: {
    display: "var(--font-bricolage), sans-serif",
    mono: "var(--font-jetbrains-mono), monospace",
    serif: "var(--font-newsreader), serif",
  },
} as const;
