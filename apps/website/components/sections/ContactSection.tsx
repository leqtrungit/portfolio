import type { Basics, Language } from "@new-portfolio/profile-schema";
import Link from "next/link";
import { BrandIcon } from "@/components/ui/Icons";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

export interface ContactSectionProps {
  basics: Basics;
  languages: Language[];
  locale: Locale;
  dict: Dictionary["contact"];
}

export function ContactSection({ basics, languages, locale, dict }: ContactSectionProps) {
  const languagesLine = languages
    .map((lang) => `${lang.language.toUpperCase()}${lang.fluency ? ` (${lang.fluency.toUpperCase()})` : ""}`)
    .join(" · ");

  return (
    <footer id="contact" className="contact">
      <div className="wrap contact-inner">
        <div className="kicker contact-kicker">{dict.kicker}</div>
        <h2 className="contact-title">
          {dict.headingLead} <span className="hl-red">{dict.headingAccent}</span>
          {dict.headingTail}
        </h2>
        <div className="contact-row">
          {basics.email && (
            <a href={`mailto:${basics.email}`} className="contact-email">
              {basics.email} →
            </a>
          )}
          {basics.profiles.length > 0 && (
            <div className="socials">
              {basics.profiles.map((profile) => (
                <a
                  key={profile.network}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social"
                  aria-label={profile.network}
                >
                  <BrandIcon network={profile.network} />
                  {/* X is recognisable from its mark alone; the others carry a label. */}
                  {profile.network !== "X" && <span>{profile.network.toUpperCase()}</span>}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="contact-bottom">
          <span>
            © {new Date().getFullYear()} {basics.name}
            {basics.location?.city ? ` — ${basics.location.city}` : ""}
          </span>
          {languagesLine && <span>{languagesLine}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          <Link href={localePath(locale, "/privacy")}>{dict.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
