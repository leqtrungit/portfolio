import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/profile";

// AI-crawler allow-list carried over verbatim from the blog API's old
// robots.txt (handoff §3.2) so nothing regresses for AEO.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
  "Amazonbot",
  "meta-externalagent",
  "Applebot-Extended",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
