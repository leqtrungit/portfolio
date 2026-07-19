import type { Basics, Language } from "@new-portfolio/profile-schema";
import Link from "next/link";
import { Pill } from "@/components/ui/Pill";
import { tokens } from "@/lib/tokens";

export interface ContactSectionProps {
  basics: Basics;
  languages: Language[];
}

export function ContactSection({ basics, languages }: ContactSectionProps) {
  const languagesLine = languages
    .map((lang) => `${lang.language.toUpperCase()}${lang.fluency ? ` (${lang.fluency.toUpperCase()})` : ""}`)
    .join(" · ");

  return (
    <footer id="contact" style={{ background: tokens.colors.dark, color: tokens.colors.onDark, marginTop: 64 }}>
      <div className="contact-inner" style={{ maxWidth: 1080, margin: "0 auto", padding: "80px 32px 64px" }}>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.14em",
            color: tokens.colors.onDarkAccent,
            marginBottom: 28,
          }}
        >
          → LET&apos;S BUILD SOMETHING
        </div>
        <h2
          style={{
            fontWeight: 700,
            fontSize: "clamp(29px, 7vw, 48px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            margin: 0,
            maxWidth: 760,
          }}
        >
          Got a system that needs a <span style={{ color: tokens.accent }}>root-cause fix</span>? Let&apos;s talk.
        </h2>
        {basics.email && (
          <a
            href={`mailto:${basics.email}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginTop: 34,
              fontSize: 24,
              fontWeight: 600,
              color: tokens.colors.onDark,
              textDecoration: "none",
              borderBottom: `2px solid ${tokens.accent}`,
              paddingBottom: 4,
            }}
          >
            {basics.email} <span style={{ color: tokens.accent }}>→</span>
          </a>
        )}

        {basics.profiles.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 48 }}>
            {basics.profiles.map((profile) => (
              <Pill key={profile.network} href={profile.url} variant="social">
                {profile.network} ↗
              </Pill>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 16,
            marginTop: 64,
            paddingTop: 24,
            borderTop: `1px solid ${tokens.colors.onDarkBorder}`,
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            color: tokens.colors.onDarkMuted,
            letterSpacing: "0.04em",
          }}
        >
          <span>
            © {new Date().getFullYear()} {basics.name}
            {basics.location?.city ? ` — ${basics.location.city}` : ""}
          </span>
          {languagesLine && <span>{languagesLine}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          <Link
            href="/privacy"
            style={{ color: tokens.colors.onDarkMuted, textDecoration: "none" }}
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
