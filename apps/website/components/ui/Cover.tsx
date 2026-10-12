import Image from "next/image";

export interface CoverProps {
  src?: string | null;
  alt: string;
  /** Rendered width hint for the image optimizer, e.g. "(max-width: 860px) 100vw, 230px". */
  sizes: string;
  /** Load eagerly — for above-the-fold covers. */
  priority?: boolean;
}

/** Dark framed cover image; falls back to the hatched ink pattern when a post has no image. */
export function Cover({ src, alt, sizes, priority }: CoverProps) {
  return (
    <div className="cover">
      <div className="cover-inner">{src && <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />}</div>
    </div>
  );
}
