import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL ?? "http://localhost:9000/blog-media";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * Fetches a post's feature image straight from object storage and bakes in the
 * OG card treatment — square crop, grayscale + slight contrast, accent multiply
 * tint at 26% — because next/og (satori) supports neither CSS filters, blend
 * modes nor WebP. Returns a JPEG data URL, or null if the image can't be loaded.
 */
export async function loadOgCoverImage(
  key: string | null,
  opts: { size: number; tint: string; tintOpacity?: number },
): Promise<string | null> {
  if (!key) return null;
  try {
    const res = await fetch(`${MEDIA_BASE_URL}/${key}`, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const input = Buffer.from(await res.arrayBuffer());

    // Two passes: greyscale() changes the output colourspace, which would also
    // strip the colour from a tint applied in the same pipeline.
    const grey = await sharp(input)
      .rotate()
      .resize(opts.size, opts.size, { fit: "cover" })
      .greyscale()
      .linear(1.05, -(0.05 * 128))
      .toColourspace("srgb")
      .png()
      .toBuffer();

    // CSS `mix-blend-mode: multiply` at opacity o is, per channel,
    // base * (1 - o + o * tint), so it reduces to a per-channel linear scale.
    const o = opts.tintOpacity ?? 0.26;
    const tint = hexToRgb(opts.tint);
    const scale = [tint.r, tint.g, tint.b].map((c) => 1 - o + (o * c) / 255);
    const out = await sharp(grey).removeAlpha().linear(scale, [0, 0, 0]).jpeg({ quality: 82 }).toBuffer();

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
