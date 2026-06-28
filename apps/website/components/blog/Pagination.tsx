import { tokens } from "@/lib/tokens";
import type { PaginationMeta } from "@/lib/blog";

export function Pagination({ meta, buildHref }: { meta: PaginationMeta; buildHref: (page: number) => string }) {
  if (meta.total_pages <= 1) return null;

  const hasPrev = meta.page > 1;
  const hasNext = meta.page < meta.total_pages;

  const base = {
    fontFamily: tokens.fonts.mono,
    fontSize: 12,
    letterSpacing: "0.04em",
    border: `1.5px solid ${tokens.colors.border}`,
    padding: "9px 18px",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48 }}>
      {hasPrev ? (
        <a href={buildHref(meta.page - 1)} className="navlink" style={{ ...base, color: tokens.colors.textMuted }}>
          ← prev
        </a>
      ) : (
        <span style={{ ...base, color: tokens.colors.borderMuted, borderColor: tokens.colors.borderMuted, pointerEvents: "none" }}>
          ← prev
        </span>
      )}
      <span style={{ fontFamily: tokens.fonts.mono, fontSize: 12, color: tokens.colors.textFaint }}>
        {meta.page} / {meta.total_pages}
      </span>
      {hasNext ? (
        <a href={buildHref(meta.page + 1)} className="navlink" style={{ ...base, color: tokens.colors.textMuted }}>
          next →
        </a>
      ) : (
        <span style={{ ...base, color: tokens.colors.borderMuted, borderColor: tokens.colors.borderMuted, pointerEvents: "none" }}>
          next →
        </span>
      )}
    </div>
  );
}
