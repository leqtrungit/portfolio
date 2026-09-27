import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL ?? "http://localhost:9000/blog-media";

/**
 * Fetches a post's feature image straight from object storage, square-crops it
 * and re-encodes it as JPEG — next/og (satori) can't decode WebP, and a
 * pre-sized image keeps the render fast. Returns a data URL, or null if the
 * image can't be loaded.
 */
export async function loadOgCoverImage(key: string | null, opts: { size: number }): Promise<string | null> {
  if (!key) return null;
  try {
    const res = await fetch(`${MEDIA_BASE_URL}/${key}`, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const input = Buffer.from(await res.arrayBuffer());

    const out = await sharp(input)
      .rotate()
      .resize(opts.size, opts.size, { fit: "cover" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82 })
      .toBuffer();

    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function loadOgFonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [bold, mono] = await Promise.all([
    readFile(join(dir, "BricolageGrotesque-Bold.ttf")),
    readFile(join(dir, "JetBrainsMono-Regular.ttf")),
  ]);
  return [
    { name: "Bricolage Grotesque", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}
