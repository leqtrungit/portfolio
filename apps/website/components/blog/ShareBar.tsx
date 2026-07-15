"use client";

import { useEffect, useRef, useState } from "react";
import { tokens } from "@/lib/tokens";

interface ShareBarProps {
  url: string;
  title: string;
}

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontFamily: tokens.fonts.mono,
  fontSize: 12,
  color: tokens.colors.text,
  border: `1.5px solid ${tokens.colors.border}`,
  padding: "9px 16px",
  textDecoration: "none",
  letterSpacing: "0.03em",
  background: "transparent",
  cursor: "pointer",
};

export function ShareBar({ url, title }: ShareBarProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleShareClick() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        // user cancelled the native sheet — nothing to do
        if (err instanceof Error && err.name === "AbortError") return;
        // any other failure (e.g. permission denied) — fall through to the popover
      }
    }
    setOpen((v) => !v);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing to fall back to, ignore
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: "X", href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={handleShareClick}
        aria-haspopup="true"
        aria-expanded={open}
        style={pillStyle}
      >
        Share
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 160,
            padding: 6,
            background: tokens.colors.cardBg,
            border: `1.5px solid ${tokens.colors.border}`,
            boxShadow: `6px 6px 0 ${tokens.accent}`,
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleCopyLink}
            style={{ ...pillStyle, border: "none", padding: "8px 10px", justifyContent: "flex-start" }}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              style={{ ...pillStyle, border: "none", padding: "8px 10px", justifyContent: "flex-start" }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
