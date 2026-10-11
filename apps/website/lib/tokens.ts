/**
 * Single source for design tokens — taken from the "Portfolio - All Pages" Claude Design
 * handoff (lacquer palette: ink, paper, lacquer red, gold). Update here when the design
 * changes. Components read these either directly (`tokens.colors.x`) or as CSS custom
 * properties (`var(--ink)`) emitted by `tokenCss` into every root layout.
 */
export const tokens = {
  accent: "#a3241a",
  colors: {
    ink: "#16100c",
    paper: "#f1e9d8",
    card: "#f7f1e4",
    cardHover: "#efe3c9",
    red: "#a3241a",
    gold: "#c49a45",
    goldLight: "#e3c47c",
    goldSoft: "#d2ae5c",
    highlight: "#e0c27a",
    goldDark: "#8a6d33",
    text: "#16100c",
    textBody: "#3a3026",
    textArticle: "#2e261e",
    textMuted: "#6b5e4b",
    textFaint: "#776a56",
    slash: "#b4a68d",
    rule: "#d8ccb3",
    ruleSoft: "#e3d8c3",
    track: "#e3d7bf",
    hatch: "#221a14",
    onDark: "#efe6d2",
    onDarkSoft: "#dccfb6",
    onDarkMuted: "#cfc4ad",
    onDarkRule: "#3a2c22",
  },
  fonts: {
    display: "var(--font-bricolage), 'Bricolage Grotesque', sans-serif",
    mono: "ui-monospace, Menlo, monospace",
  },
} as const;

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** `:root { --ink: …; --paper: …; --font: … }` — inlined by the root layouts. */
export const tokenCss = `:root{${Object.entries(tokens.colors)
  .map(([k, v]) => `--${kebab(k)}:${v}`)
  .join(";")};--font:${tokens.fonts.display};--mono:${tokens.fonts.mono}}`;
