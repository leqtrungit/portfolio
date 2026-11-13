"use server";

import { fetchPosts, type PostSummary, type PaginationMeta } from "@/lib/blog";

import type { Locale } from "@/lib/i18n/config";

export async function loadMorePosts(params: { locale: Locale; page: number; limit?: number; tag?: string }): Promise<{ posts: PostSummary[]; meta: PaginationMeta }> {
  return fetchPosts(params);
}
