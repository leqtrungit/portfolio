/**
 * Structural parity between profile.json (en) and profile.vi.json (vi):
 * same keys, same array lengths, identical values for non-translatable keys.
 * Only free-text fields may differ. `_note` keys are author notes and ignored.
 */
export const LOCKED_KEYS: ReadonlySet<string> = new Set([
  "startDate", "endDate", "date", "releaseDate", "url", "email", "phone",
  "countryCode", "username", "network", "image", "tags",
]);

function kind(v: unknown): string {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  return typeof v;
}

function join(path: string, key: string): string {
  return path ? `${path}.${key}` : key;
}

export function checkParity(en: unknown, vi: unknown, path = "", locked = false): string[] {
  const label = path || "(root)";
  if (kind(en) !== kind(vi)) return [`${label}: type differs (${kind(en)} vs ${kind(vi)})`];

  if (Array.isArray(en) && Array.isArray(vi)) {
    if (en.length !== vi.length) return [`${label}: array length differs (${en.length} vs ${vi.length})`];
    return en.flatMap((item, i) => checkParity(item, vi[i], `${path}[${i}]`, locked));
  }

  if (kind(en) === "object") {
    const a = en as Record<string, unknown>;
    const b = vi as Record<string, unknown>;
    const errors: string[] = [];
    for (const key of Object.keys(a)) {
      if (key === "_note") continue;
      if (!(key in b)) errors.push(`${join(path, key)}: missing in vi`);
      else errors.push(...checkParity(a[key], b[key], join(path, key), locked || LOCKED_KEYS.has(key)));
    }
    for (const key of Object.keys(b)) {
      if (key !== "_note" && !(key in a)) errors.push(`${join(path, key)}: extra in vi`);
    }
    return errors;
  }

  if (locked && en !== vi) return [`${label}: locked value differs (${JSON.stringify(en)} vs ${JSON.stringify(vi)})`];
  return [];
}
