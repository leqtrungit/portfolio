import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { tokens } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy" },
};

const sectionLabel: CSSProperties = {
  fontFamily: tokens.fonts.mono,
  fontSize: 11,
  letterSpacing: "0.1em",
  color: tokens.colors.textFaint,
  marginBottom: 10,
  marginTop: 0,
};

const bodyText: CSSProperties = {
  fontFamily: tokens.fonts.serif,
  fontSize: 17,
  lineHeight: 1.65,
  color: tokens.colors.textStrong,
  margin: "0 0 28px",
};

export default function PrivacyPage() {
  return (
    <div className="pad-x" style={{ maxWidth: 680, margin: "0 auto", padding: "0 32px" }}>
      <header style={{ padding: "64px 0 34px" }}>
        <Link
          href="/"
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.06em",
            color: tokens.colors.textFaint,
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 30,
          }}
        >
          ← home
        </Link>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            color: tokens.colors.textFaint,
            letterSpacing: "0.04em",
            marginBottom: 18,
          }}
        >
          PRIVACY
        </div>
        <h1
          style={{
            fontWeight: 700,
            fontSize: "clamp(32px, 6vw, 52px)",
            lineHeight: 1.06,
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          Privacy
        </h1>
        <p
          style={{
            fontFamily: tokens.fonts.serif,
            fontSize: 18,
            lineHeight: 1.55,
            color: tokens.colors.textMuted,
            margin: "20px 0 0",
          }}
        >
          How this site handles first-party analytics and visitor data.
        </p>
      </header>

      <section style={{ paddingBottom: 80 }}>
        <h2 style={sectionLabel}>WHAT IS COLLECTED</h2>
        <p style={bodyText}>
          This site uses first-party analytics only. When you load a page, we record the
          page path, referring URL, query string (including UTM parameters when present),
          approximate engagement (time on page and scroll depth), your IP address, and
          your browser User-Agent string.
        </p>

        <h2 style={sectionLabel}>WHY</h2>
        <p style={bodyText}>
          These measurements support traffic analysis, bot and spam detection, and content
          improvement. They are not used for advertising or ad targeting.
        </p>

        <h2 style={sectionLabel}>SHARING</h2>
        <p style={bodyText}>
          There are no third-party analytics vendors. Analytics data stays on infrastructure
          controlled by the site operator and is not sold or shared for marketing purposes.
        </p>

        <h2 style={sectionLabel}>NO CROSS-SITE TRACKING</h2>
        <p style={bodyText}>
          This site does not use ad pixels, third-party tracking cookies, or shared
          advertising identifiers. Analytics does not follow you across other websites.
        </p>

        <h2 style={sectionLabel}>RETENTION</h2>
        <p style={bodyText}>
          Raw analytics events are retained only as long as operationally needed. A more
          specific retention period will be published here if the backend defines one.
        </p>

        <Link
          href="/"
          className="pill"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: tokens.fonts.mono,
            fontSize: 13,
            color: tokens.colors.text,
            border: `1.5px solid ${tokens.colors.border}`,
            padding: "11px 20px",
            textDecoration: "none",
            letterSpacing: "0.03em",
          }}
        >
          ← back home
        </Link>
      </section>
    </div>
  );
}
