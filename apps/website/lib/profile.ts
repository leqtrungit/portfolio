import { profileSchema, type Profile } from "@new-portfolio/profile-schema";
import { type Locale, defaultLocale } from "./i18n/config";
import profileJson from "../../../profile.json";
import profileViJson from "../../../profile.vi.json";

export function getProfile(locale: Locale = defaultLocale): Profile {
  const data = locale === "vi" ? profileViJson : profileJson;
  return profileSchema.parse(data);
}
