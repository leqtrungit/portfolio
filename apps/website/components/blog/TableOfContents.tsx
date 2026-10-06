import type { TocItem } from "@/lib/toc";
import { tokens } from "@/lib/tokens";

interface TableOfContentsProps {
  items: TocItem[];
  label: string;
  ariaLabel: string;
}

const labelStyle = {
  fontFamily: tokens.fonts.mono,
  fontSize: 11,
  letterSpacing: "0.1em",
  color: tokens.colors.textFaint,
} as const;

function TocList({ items }: { items: TocItem[] }) {
  return (
    <ol lang="vi" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item) => (
        <li key={item.id} style={{ paddingLeft: item.level === 3 ? 14 : 0 }}>
          <a
            href={`#${item.id}`}
            className="toc-link"
            style={{
              fontSize: item.level === 3 ? 13 : 14,
              lineHeight: 1.4,
              color: tokens.colors.textMuted,
              textDecoration: "none",
            }}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Rendered twice: a collapsible block above the article on narrow screens and a
 * sticky rail beside it on wide ones — CSS (`.toc-inline` / `.toc-rail`) picks one.
 */
export function TableOfContents({ items, label, ariaLabel }: TableOfContentsProps) {
  return (
    <>
      <details
        className="toc-inline"
        style={{
          marginTop: 36,
          border: `1.5px solid ${tokens.colors.border}`,
          background: tokens.colors.cardBg,
          padding: "14px 18px",
        }}
      >
        <summary style={{ ...labelStyle, cursor: "pointer" }}>{label}</summary>
        <nav aria-label={ariaLabel} style={{ marginTop: 14 }}>
          <TocList items={items} />
        </nav>
      </details>
      <aside className="toc-rail" aria-label={ariaLabel}>
        <div style={{ position: "sticky", top: 110 }}>
          <div style={{ ...labelStyle, marginBottom: 14 }}>{label}</div>
          <TocList items={items} />
        </div>
      </aside>
    </>
  );
}
