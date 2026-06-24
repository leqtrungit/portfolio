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
    // Darkened accent for small text on the light bg — `accent` itself is ~4.2:1 against
    // `bg`, which fails WCAG AA at caption sizes (needs 4.5:1); large accent text elsewhere
    // (headings, CTAs) keeps using `accent` since it clears the AA large-text 3:1 threshold.
    accentMuted: "#c23d22",
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
