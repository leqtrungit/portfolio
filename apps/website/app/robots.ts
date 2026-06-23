import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/profile";

export default function robots(): MetadataRoute.Robots {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
