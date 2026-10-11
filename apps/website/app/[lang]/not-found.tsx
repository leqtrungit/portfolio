import { NotFoundView } from "@/components/ui/NotFoundView";
import { getProfile } from "@/lib/profile";
import { locales, type Locale } from "@/lib/i18n/config";

const names = Object.fromEntries(locales.map((l) => [l, getProfile(l).basics.name])) as Record<Locale, string>;

export default function NotFound() {
  return <NotFoundView names={names} />;
}
