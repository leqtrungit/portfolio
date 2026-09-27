"use client";

import { useEffect, useRef } from "react";
import { tokens } from "@/lib/tokens";

interface ReadingProgressProps {
  /** CSS selector of the element whose read-through is tracked. */
  target: string;
}

export function ReadingProgress({ target }: ReadingProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(target);
    const bar = barRef.current;
    if (!el || !bar) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total <= 0 ? (rect.top <= 0 ? 1 : 0) : Math.min(1, Math.max(0, -rect.top / total));
      bar.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 60,
        background: tokens.accent,
        transform: "scaleX(0)",
        transformOrigin: "0 50%",
        pointerEvents: "none",
      }}
    />
  );
}
