import { type Locale } from "./i18n/config";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(date: string, locale: Locale): string {
  const [year, month] = date.split("-");
  if (!month) return year;

  if (locale === "vi") {
    return `${month.padStart(2, "0")}/${year}`;
  }

  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatPeriod(
  startDate: string,
  endDate: string | undefined,
  locale: Locale
): string {
  const endText = endDate ? formatDate(endDate, locale) : locale === "vi" ? "Hiện tại" : "Present";
  return `${formatDate(startDate, locale)} — ${endText}`;
}
