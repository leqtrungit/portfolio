import type { Metadata } from "next";
import { fetchPosts } from "@/lib/blog";
import { PostRow } from "@/components/blog/PostRow";
import { Pagination } from "@/components/blog/Pagination";
import { tokens } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "A personal log of root-cause hunts, systems I build, and the lessons that only show up after something ships.",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogListPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));

  const { posts, meta } = await fetchPosts({ page, limit: 10 });

  const countLine = `${meta.total} POST${meta.total !== 1 ? "S" : ""} · UPDATED ${new Date()
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase()}`;

  return (
    <div className="pad-x" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>
      {/* ===== HEADER ===== */}
      <header
        className="blog-head"
        style={{
          padding: "78px 0 36px",
          borderBottom: `1.5px solid ${tokens.colors.border}`,
        }}
      >
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.14em",
            color: tokens.accent,
            marginBottom: 26,
          }}
        >
          → WRITING — NOTES FROM THE BUILD
        </div>
        <h1
          style={{
            fontWeight: 700,
            fontSize: "clamp(40px, 9vw, 76px)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          The{" "}
          <span
            style={{
              fontFamily: tokens.fonts.serif,
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            Blog
          </span>
        </h1>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.55,
            color: tokens.colors.textMuted,
            maxWidth: 540,
            margin: "24px 0 0",
          }}
        >
          A personal log of root-cause hunts, systems I build, and the lessons
          that only show up after something ships. Written by me, irregularly,
          honestly.
        </p>
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            color: tokens.colors.onDarkMuted,
            letterSpacing: "0.04em",
            marginTop: 22,
          }}
        >
          {countLine}
        </div>
      </header>

      {/* ===== POST LIST ===== */}
      <section style={{ padding: "8px 0 96px" }}>
        {posts.length === 0 ? (
          <p
            style={{
              fontFamily: tokens.fonts.mono,
              fontSize: 13,
              color: tokens.colors.textMuted,
              padding: "48px 0",
            }}
          >
            No posts yet.
          </p>
        ) : (
          <>
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
            <Pagination meta={meta} buildHref={(p) => `/blog?page=${p}`} />
          </>
        )}
      </section>
    </div>
  );
}
