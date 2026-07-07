"use client";

import { useState } from "react";
import { PostRow } from "@/components/blog/PostRow";
import { loadMorePosts } from "@/app/actions/blog";
import { tokens } from "@/lib/tokens";
import type { PostSummary } from "@/lib/blog";

interface PostListWithLoadMoreProps {
  initialPosts: PostSummary[];
  total: number;
  tag?: string;
}

export function PostListWithLoadMore({ initialPosts, total, tag }: PostListWithLoadMoreProps) {
  const [posts, setPosts] = useState<PostSummary[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = posts.length < total;

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { posts: newPosts } = await loadMorePosts({ page: page + 1, limit: 10, tag });
      setPosts((prev) => [...prev, ...newPosts]);
      setPage((p) => p + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {posts.map((post) => (
        <PostRow key={post.id} post={post} />
      ))}
      {hasMore && (
        <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            style={{
              fontFamily: tokens.fonts.mono,
              fontSize: 13,
              border: `1.5px solid ${tokens.colors.border}`,
              padding: "11px 20px",
              letterSpacing: "0.04em",
              textDecoration: "none",
              display: "inline-block",
              color: loading ? tokens.colors.textMuted : tokens.colors.text,
              background: "transparent",
              cursor: loading ? "default" : "pointer",
              touchAction: "manipulation",
            }}
          >
            {loading ? "loading…" : "load more →"}
          </button>
        </div>
      )}
    </>
  );
}
