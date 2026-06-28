const API_BASE = process.env.BLOG_API_BASE_URL ?? "http://localhost:8080/api/v1";
const MEDIA_BASE = process.env.MEDIA_BASE_URL ?? "http://localhost:9000/blog-media";

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_key: string | null;
  featured_image_alt: string | null;
  status: string;
  tags: Tag[];
  created_at: string;
}

export interface PostDetail extends PostSummary {
  content: string;
  html: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function buildImageUrl(key: string | null): string | null {
  if (!key) return null;
  return `${MEDIA_BASE}/${key}`;
}

export function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export async function fetchPosts(
  params: { tag?: string; page?: number; limit?: number } = {}
): Promise<{ posts: PostSummary[]; meta: PaginationMeta }> {
  const url = new URL(`${API_BASE}/posts`);
  if (params.tag) url.searchParams.set("tag", params.tag);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.limit) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);

  const json = (await res.json()) as { data: PostSummary[]; meta: PaginationMeta };
  return { posts: json.data, meta: json.meta };
}

export async function fetchPost(slug: string): Promise<PostDetail | null> {
  const res = await fetch(`${API_BASE}/posts/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);

  const json = (await res.json()) as { data: PostDetail };
  return json.data;
}
