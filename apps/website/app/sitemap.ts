import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
