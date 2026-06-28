import Link from "next/link";
import type { Metadata } from "next";
import { fetchPosts } from "@/lib/blog";
import { PostRow } from "@/components/blog/PostRow";
import { Pagination } from "@/components/blog/Pagination";
import { tokens } from "@/lib/tokens";

interface PageProps {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag} — Blog`, description: `Posts tagged with "${tag}".` };
}

export default async function TagListPage({ params, searchParams }: PageProps) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));

  const { posts, meta } = await fetchPosts({ tag, page, limit: 10 });

  return (
    <div className="pad-x" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>

      <header className="blog-head" style={{ padding: "78px 0 36px", borderBottom: `1.5px solid ${tokens.colors.border}` }}>
        <div style={{ fontFamily: tokens.fonts.mono, fontSize: 12, letterSpacing: "0.14em", color: tokens.accent, marginBottom: 26 }}>
          → WRITING — NOTES FROM THE BUILD
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(32px, 7vw, 56px)", lineHeight: 1, letterSpacing: "-0.03em", margin: 0 }}>
            #{tag}
          </h1>
          <Link
            href="/blog"
            style={{ fontFamily: tokens.fonts.mono, fontSize: 12, color: tokens.colors.accentMuted, textDecoration: "none", letterSpacing: "0.04em" }}
          >
            ← all posts
          </Link>
        </div>
        <div style={{ fontFamily: tokens.fonts.mono, fontSize: 12, color: tokens.colors.onDarkMuted, letterSpacing: "0.04em", marginTop: 22 }}>
          {meta.total} POST{meta.total !== 1 ? "S" : ""}
        </div>
      </header>

      <section style={{ padding: "8px 0 96px" }}>
        {posts.length === 0 ? (
          <p style={{ fontFamily: tokens.fonts.mono, fontSize: 13, color: tokens.colors.textMuted, padding: "48px 0" }}>
            No posts for this tag.
          </p>
        ) : (
          <>
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
            <Pagination meta={meta} buildHref={(p) => `/blog/tags/${tag}?page=${p}`} />
          </>
        )}
      </section>

    </div>
  );
}
