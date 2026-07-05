"use server";

import { fetchPosts, type PostSummary, type PaginationMeta } from "@/lib/blog";

export async function loadMorePosts(params: { page: number; limit?: number; tag?: string }): Promise<{ posts: PostSummary[]; meta: PaginationMeta }> {
  return fetchPosts(params);
}
