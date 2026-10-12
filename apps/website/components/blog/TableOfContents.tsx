"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

interface TableOfContentsProps {
  items: TocItem[];
  label: string;
  ariaLabel: string;
}

function TocList({ items, active }: { items: TocItem[]; active?: string }) {
  let n = 0;
  return (
    <ol className="toc-list" lang="vi">
      {items.map((item) => {
        // h2s are numbered to match the badges the article CSS puts on each h2.
        const num = item.level === 2 ? String(++n).padStart(2, "0") : "";
        return (
          <li key={item.id} className={item.level === 3 ? "toc-item sub" : "toc-item"}>
            <a href={`#${item.id}`} aria-current={item.id === active ? "true" : undefined}>
              <span className="toc-n">{num}</span>
              <span>{item.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Sticky left rail on wide screens, a collapsible block above the article on narrow ones
 * (CSS picks one). The rail highlights the section currently being read.
 */
export function TableOfContents({ items, label, ariaLabel }: TableOfContentsProps) {
  const [active, setActive] = useState<string | undefined>(items[0]?.id);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      // The last heading that has scrolled past the top third of the viewport.
      const line = window.innerHeight / 3;
      let current = headings[0].id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) current = h.id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <>
      <aside className="toc" aria-label={ariaLabel}>
        <div className="toc-head">{label}</div>
        <TocList items={items} active={active} />
      </aside>
      <details className="toc-inline">
        <summary>{label}</summary>
        <nav aria-label={ariaLabel}>
          <TocList items={items} />
        </nav>
      </details>
    </>
  );
}
