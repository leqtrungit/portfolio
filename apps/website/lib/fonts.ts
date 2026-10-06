import { Bricolage_Grotesque, JetBrains_Mono, Newsreader } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const newsreader = Newsreader({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  weight: ["400"],
  variable: "--font-newsreader",
});

export const fontVariables = `${bricolage.variable} ${jetbrainsMono.variable} ${newsreader.variable}`;
