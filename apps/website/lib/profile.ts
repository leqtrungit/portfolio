import { profileSchema, type Profile } from "@new-portfolio/profile-schema";
import profileJson from "../../../profile.json";

export function getProfile(): Profile {
  return profileSchema.parse(profileJson);
}
