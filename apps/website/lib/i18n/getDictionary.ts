import { en } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";
import type { Dictionary } from "./dictionaries/en";
import type { Locale } from "./config";

const dictionaries = { en, vi } satisfies Record<Locale, Dictionary>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
