/** Truncates at a word boundary so SERP/OG metadata never gets cut mid-word. */
export function truncateForMeta(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
