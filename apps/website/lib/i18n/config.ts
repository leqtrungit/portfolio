export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localePath(locale: Locale, path: string): string {
  // Split off hash suffix first
  const hashIndex = path.indexOf("#");
  const base = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : path.slice(hashIndex);

  // For English, return path as-is with hash
  if (locale === "en") {
    return base + hash;
  }

  // For other locales, prepend locale to base path
  if (base === "/") {
    return "/vi" + hash;
  }

  return "/vi" + base + hash;
}

export function stripLocale(pathname: string): { locale: Locale; path: string } {
  // Check for /vi or /vi/...
  if (pathname === "/vi") {
    return { locale: "vi", path: "/" };
  }
  if (pathname.startsWith("/vi/")) {
    return { locale: "vi", path: pathname.slice(3) };
  }

  // Check for /en or /en/...
  if (pathname === "/en") {
    return { locale: "en", path: "/" };
  }
  if (pathname.startsWith("/en/")) {
    return { locale: "en", path: pathname.slice(3) };
  }

  // Default to English
  return { locale: "en", path: pathname };
}

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (key in vars) {
      return String(vars[key]);
    }
    return match;
  });
}

export const ogLocale: Record<Locale, string> = {
  en: "en_US",
  vi: "vi_VN",
};

export const htmlLang: Record<Locale, string> = {
  en: "en",
  vi: "vi",
};
