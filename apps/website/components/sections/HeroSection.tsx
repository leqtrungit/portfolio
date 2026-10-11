import type { Basics } from "@new-portfolio/profile-schema";
import { Portrait } from "@/components/ui/Portrait";
import { LinkedInIcon, MailIcon, PhoneIcon } from "@/components/ui/Icons";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { fill } from "@/lib/i18n/config";

export interface HeroSectionProps {
  basics: Basics;
  dict: Dictionary["hero"];
  /** Use the design's hand-set line breaks. Off for copy they don't fit (Vietnamese is longer). */
  lineBreaks?: boolean;
}

export function HeroSection({ basics, dict, lineBreaks = true }: HeroSectionProps) {
  const linkedIn = basics.profiles.find((p) => p.network === "LinkedIn");
  // "Solution Engineer" → highlight the first word only.
  const [roleFirst, ...roleRest] = (basics.label ?? "").split(" ");

  return (
    <section id="top" className="hero-band">
      <div className="wrap hero">
        <div className="hero-main">
          <h1 className={lineBreaks ? "hero-title" : "hero-title balance"}>
            {dict.line1}
            {lineBreaks && <br />} {dict.line2Lead} <span className="hl">{dict.accent}</span> {dict.line2Tail}
            {lineBreaks && <br />} {dict.line3} <span className="ul-red">{dict.underline1}</span>
            {lineBreaks && <br />} <span className="ul-red">{dict.underline2}</span>
          </h1>
          <div className="hero-sub">
            {basics.summary && <p className="hero-summary">{basics.summary}</p>}
            <div className="hero-status">
              <span className="diamond" aria-hidden="true" />
              {dict.available}
              {basics.location?.city && (
                <>
                  <span style={{ color: "var(--slash)" }} aria-hidden="true">
                    /
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>{basics.location.city}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hero-side">
          <Portrait src="/portrait.png" alt={fill(dict.portraitAlt, { name: basics.name })} />
          {basics.label && (
            <div className="role">
              <span className="hl">{roleFirst}</span>
              {roleRest.length > 0 && ` ${roleRest.join(" ")}`}
            </div>
          )}
          <div className="hero-links">
            {linkedIn && (
              <a href={linkedIn.url} target="_blank" rel="noopener noreferrer" className="hero-link">
                <LinkedInIcon />
                LinkedIn
              </a>
            )}
            {basics.phone && (
              <a href={`tel:${basics.phone.replace(/\s/g, "")}`} className="hero-link">
                <PhoneIcon />
                {dict.call}
              </a>
            )}
            {basics.email && (
              <a href={`mailto:${basics.email}`} className="hero-link">
                <MailIcon />
                {dict.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
