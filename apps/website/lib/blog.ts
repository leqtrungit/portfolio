import { localePath, type Locale } from "./i18n/config";
const API_BASE = process.env.BLOG_API_BASE_URL ?? "http://localhost:8080/api/v1";

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
  published_at: string;
  locale: string;
  reading_minutes: number;
  translations: { locale: string; slug: string }[];
  featured_image_url: string;
  featured_image_key: string | null;
  featured_image_alt: string | null;
  status: string;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface PostDetail extends PostSummary {
  content: string;
  html: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function coverUrl(post: { featured_image_url?: string | null }): string | null {
  const url = post.featured_image_url || null;
  if (!url) return null;
  const bust = process.env.BLOG_MEDIA_CACHE_BUST;
  if (!bust) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("v", bust);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function estimateReadTime(content: string, locale: Locale = "en"): string {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  if (locale === "vi") {
    return `${mins} phút đọc`;
  }
  return `${mins} min read`;
}

export function postsQuery(params: { locale: Locale; tag?: string; page?: number; limit?: number }): string {
  const query = new URLSearchParams({ locale: params.locale });
  if (params.tag) query.set("tag", params.tag);
  if (params.page != null) query.set("page", String(params.page));
  if (params.limit != null) query.set("limit", String(params.limit));
  return `?${query}`;
}

export function translationSlug(
  post: { translations: { locale: string; slug: string }[] },
  locale: Locale
): string | null {
  return post.translations.find(translation => translation.locale === locale)?.slug ?? null;
}

async function fetchWithLocale(url: URL, revalidate?: number): Promise<Response> {
  const options = revalidate != null
    ? { next: { revalidate } }
    : { cache: "no-store" as const };
  const response = await fetch(url.toString(), options);
  if (response.status !== 400) return response;
  url.searchParams.set("locale", "vi");
  return fetch(url.toString(), options);
}

export async function fetchPosts(
  params: { locale: Locale; tag?: string; page?: number; limit?: number; revalidate?: number }
): Promise<{ posts: PostSummary[]; meta: PaginationMeta }> {
  const res = await fetchWithLocale(new URL(`${API_BASE}/posts${postsQuery(params)}`), params.revalidate);
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  const json = (await res.json()) as { data: PostSummary[]; meta: PaginationMeta };
  return { posts: json.data, meta: json.meta };
}

export async function fetchPost(
  slug: string,
  locale: Locale,
  opts: { revalidate?: number } = {}
): Promise<PostDetail | null> {
  const res = await fetchWithLocale(
    new URL(`${API_BASE}/posts/${encodeURIComponent(slug)}${postsQuery({ locale })}`), opts.revalidate
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
  const json = (await res.json()) as { data: PostDetail };
  return json.data;
}

export interface AdjacentPosts {
  prev: PostSummary | null;
  next: PostSummary | null;
}

// Ranked by shared tags, newest first; the API pads with the newest posts when
// fewer than `limit` share a tag.
export async function fetchRelatedPosts(
  slug: string,
  locale: Locale,
  opts: { limit?: number; revalidate?: number } = {}
): Promise<PostSummary[]> {
  const res = await fetchWithLocale(
    new URL(`${API_BASE}/posts/${encodeURIComponent(slug)}/related${postsQuery({ locale, limit: opts.limit })}`), opts.revalidate
  );
  if (!res.ok) throw new Error(`Failed to fetch related posts: ${res.status}`);
  const json = (await res.json()) as { data: PostSummary[] };
  return json.data;
}

// prev = nearest older published post, next = nearest newer one.
export async function fetchAdjacentPosts(
  slug: string,
  locale: Locale,
  opts: { revalidate?: number } = {}
): Promise<AdjacentPosts> {
  const res = await fetchWithLocale(
    new URL(`${API_BASE}/posts/${encodeURIComponent(slug)}/adjacent${postsQuery({ locale })}`), opts.revalidate
  );
  if (!res.ok) throw new Error(`Failed to fetch adjacent posts: ${res.status}`);
  const json = (await res.json()) as { data: AdjacentPosts };
  return json.data;
}

export async function resolvePost(
  slug: string,
  pageLocale: Locale,
  opts: { revalidate?: number } = {}
): Promise<{ post: PostDetail; redirectTo: string | null; hrefs: Record<Locale, string> } | null> {
  const post = await fetchPost(slug, pageLocale, opts)
    ?? await fetchPost(slug, pageLocale === "en" ? "vi" : "en", opts);
  if (!post) return null;
  const translatedSlug = translationSlug(post, pageLocale);
  return {
    post,
    redirectTo: translatedSlug !== null && translatedSlug !== slug
      ? localePath(pageLocale, `/blog/${translatedSlug}`) : null,
    hrefs: {
      en: localePath("en", `/blog/${translationSlug(post, "en") ?? slug}`),
      vi: localePath("vi", `/blog/${translationSlug(post, "vi") ?? slug}`),
    },
  };
}

export function formatPostDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y} · ${m} · ${day}`;
}

// Handoff §3: paginate until a page returns fewer than `limit`.
export async function fetchAllPosts(locale: Locale, revalidate?: number): Promise<PostSummary[]> {
  const limit = 100;
  const all: PostSummary[] = [];
  let page = 1;
  for (;;) {
    const { posts } = await fetchPosts({ locale, limit, page, revalidate });
    all.push(...posts);
    if (posts.length < limit) return all;
    page += 1;
  }
}
