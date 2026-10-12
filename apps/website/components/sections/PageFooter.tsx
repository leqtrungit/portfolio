import { SiteFooter } from "@/components/ui/SiteFooter";
import { getProfile } from "@/lib/profile";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export interface PageFooterProps {
  locale: Locale;
  /** Off on the privacy page itself. */
  withPrivacy?: boolean;
}

export function PageFooter({ locale, withPrivacy }: PageFooterProps) {
  const { basics } = getProfile(locale);
  const city = basics.location?.city;
  return (
    <SiteFooter
      copyright={`© ${new Date().getFullYear()} ${basics.name}${city ? ` — ${city}` : ""}`}
      links={withPrivacy ? [{ href: localePath(locale, "/privacy"), label: getDictionary(locale).contact.privacy }] : []}
    />
  );
}
