import { Bricolage_Grotesque } from "next/font/google";

// Variable font with the width axis — the design leans on condensed (font-stretch 75–85%)
// labels next to full-width headings.
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "vietnamese"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
});

export const fontVariables = bricolage.variable;
