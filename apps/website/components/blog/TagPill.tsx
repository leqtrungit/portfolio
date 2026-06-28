import Link from "next/link";
import { tokens } from "@/lib/tokens";
import type { Tag } from "@/lib/blog";

export function TagPill({ tag }: { tag: Tag }) {
  return (
    <Link
      href={`/blog/tags/${tag.slug}`}
      className="pill"
      style={{
        fontFamily: tokens.fonts.mono,
        fontSize: 11,
        color: tokens.colors.textFaint,
        border: `1px solid ${tokens.colors.borderMuted}`,
        padding: "5px 11px",
        letterSpacing: "0.03em",
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      {tag.name}
    </Link>
  );
}
