"use client";

import { useState } from "react";
import { PostRow } from "@/components/blog/PostRow";
import { loadMorePosts } from "@/app/actions/blog";
import type { PostSummary } from "@/lib/blog";
import { fill, type Locale } from "@/lib/i18n/config";

interface PostListWithLoadMoreProps {
  initialPosts: PostSummary[];
  total: number;
  pageSize: number;
  /** Posts already rendered above the list (the lead post) — counted, not repeated. */
  skip?: number;
  tag?: string;
  locale: Locale;
  labels: { loadMore: string; loading: string; shownOf: string };
}

export function PostListWithLoadMore({ initialPosts, total, pageSize, skip = 0, tag, locale, labels }: PostListWithLoadMoreProps) {
  const [posts, setPosts] = useState<PostSummary[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = posts.length < total;

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { posts: newPosts } = await loadMorePosts({ page: page + 1, limit: pageSize, tag });
      setPosts((prev) => [...prev, ...newPosts]);
      setPage((p) => p + 1);
    } finally {
      setLoading(false);
    }
  };

  const shown = Math.min(posts.length, total);

  return (
    <>
      {posts.slice(skip).map((post) => (
        <PostRow key={post.id} post={post} locale={locale} />
      ))}
      {!hasMore && <div style={{ height: 72 }} />}
      {hasMore && (
        <div className="load-more-wrap">
          <button type="button" className="load-more" onClick={handleLoadMore} disabled={loading}>
            <span className="load-more-count">
              {shown} <span>{fill(labels.shownOf, { total })}</span>
            </span>
            <span className="load-more-track" aria-hidden="true">
              <span className="load-more-fill" style={{ width: `${(shown / total) * 100}%` }} />
            </span>
            <span className="load-more-label">
              {loading ? labels.loading : labels.loadMore}
              <span className="load-more-icon" aria-hidden="true">
                ↓
              </span>
            </span>
          </button>
        </div>
      )}
    </>
  );
}
