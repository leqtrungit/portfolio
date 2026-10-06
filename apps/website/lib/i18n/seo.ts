import { localePath, type Locale } from "./config";

export function localizedAlternates(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: {
      en: localePath("en", path),
      vi: localePath("vi", path),
      "x-default": localePath("en", path),
    },
  };
}
