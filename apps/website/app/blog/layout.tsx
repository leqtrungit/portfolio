import type { ReactNode } from "react";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { getProfile } from "@/lib/profile";
import { tokens } from "@/lib/tokens";

export default function BlogLayout({ children }: { children: ReactNode }) {
  const profile = getProfile();
  return (
    <div style={{ background: tokens.colors.bg, color: tokens.colors.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <BlogHeader />
      <main style={{ flex: 1 }}>{children}</main>
      <BlogFooter name={profile.basics.name} city={profile.basics.location?.city} />
    </div>
  );
}
