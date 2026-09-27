export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const HEADING_RE = /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
const ID_ATTR_RE = /\sid\s*=\s*["']([^"']+)["']/i;

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isNaN(code) ? m : String.fromCodePoint(code);
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

// Vietnamese-aware slug: strip diacritics (NFD), map đ → d, collapse the rest to dashes.
export function slugifyHeading(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Collects h2/h3 headings from post HTML and makes sure each one has an `id`
 * so the table of contents can link to it. Existing ids are kept as-is.
 */
export function buildToc(html: string): { html: string; items: TocItem[] } {
  const items: TocItem[] = [];
  const used = new Set<string>();

  const out = html.replace(HEADING_RE, (match, level: string, attrs: string | undefined, inner: string) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
    if (!text) return match;

    const existing = attrs?.match(ID_ATTR_RE)?.[1];
    let id = existing ?? (slugifyHeading(text) || "section");
    if (!existing) {
      const base = id;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    }
    used.add(id);
    items.push({ id, text, level: Number(level) as 2 | 3 });

    return existing ? match : `<h${level} id="${id}"${attrs ?? ""}>${inner}</h${level}>`;
  });

  return { html: out, items };
}
