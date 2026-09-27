import { readFile } from "node:fs/promises";
import { join } from "node:path";

const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL ?? "http://localhost:9000/blog-media";

// Formats satori can decode on its own when sharp isn't available.
const NATIVE_TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" };

/**
 * Fetches a post's feature image straight from object storage and returns it as
 * a data URL for next/og. sharp square-crops and re-encodes it as JPEG (satori
 * can't decode WebP, and a pre-sized image renders faster). sharp is imported
 * lazily: this module is also loaded while resolving page metadata, and a
 * native-binary failure must never take the page's <head> down with it — if
 * sharp can't load, PNG/JPEG covers are passed through as-is.
 */
export async function loadOgCoverImage(key: string | null, opts: { size: number }): Promise<string | null> {
  if (!key) return null;
  let input: Buffer;
  try {
    const res = await fetch(`${MEDIA_BASE_URL}/${key}`, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    input = Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }

  try {
    const { default: sharp } = await import("sharp");
    const out = await sharp(input)
      .rotate()
      .resize(opts.size, opts.size, { fit: "cover" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch (err) {
    console.error("[og] sharp unavailable, falling back to original cover:", err);
    const type = NATIVE_TYPES[key.split(".").pop()?.toLowerCase() ?? ""];
    return type ? `data:${type};base64,${input.toString("base64")}` : null;
  }
}

/** Returns undefined (satori's built-in font) if the bundled TTFs can't be read. */
export async function loadOgFonts() {
  try {
    const dir = join(process.cwd(), "assets/fonts");
    const [bold, mono] = await Promise.all([
      readFile(join(dir, "BricolageGrotesque-Bold.ttf")),
      readFile(join(dir, "JetBrainsMono-Regular.ttf")),
    ]);
    return [
      { name: "Bricolage Grotesque", data: bold, weight: 700 as const, style: "normal" as const },
      { name: "JetBrains Mono", data: mono, weight: 400 as const, style: "normal" as const },
    ];
  } catch (err) {
    console.error("[og] bundled fonts missing:", err);
    return undefined;
  }
}
