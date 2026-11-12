import assert from "node:assert/strict";
import test from "node:test";
import { coverUrl } from "./blog";

test("coverUrl returns an absolute URL as-is", () => {
  const url = "https://blog-api.lequoctrung.id.vn/media/uuid/cover.jpg";
  assert.equal(coverUrl({ featured_image_url: url }), url);
});

test("coverUrl returns null for an empty URL", () => {
  assert.equal(coverUrl({ featured_image_url: "" }), null);
});

test("coverUrl returns null for an undefined URL", () => {
  assert.equal(coverUrl({}), null);
});

import * as blog from "./blog";
import type { Locale } from "./i18n/config";

const post: blog.PostDetail = {
  id: "1", title: "Bài viết", slug: "bai-viet", excerpt: "Summary",
  published_at: "2026-11-12T00:00:00Z", locale: "vi", reading_minutes: 2,
  translations: [{ locale: "vi", slug: "bai-viet" }],
  featured_image_url: "", featured_image_key: null, featured_image_alt: null,
  status: "published", tags: [], created_at: "2026-11-12T00:00:00Z",
  updated_at: "2026-11-12T00:00:00Z", content: "Body", html: "<p>Body</p>",
};
const meta = { page: 1, limit: 8, total: 1, total_pages: 1 };

function mockFetch(t: test.TestContext, replies: { status: number; body?: unknown }[]) {
  const calls: { url: URL; init: RequestInit | undefined }[] = [];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: new URL(String(input)), init });
    const reply = replies[calls.length - 1];
    assert.ok(reply, "unexpected extra fetch");
    return new Response(JSON.stringify(reply.body ?? {}), { status: reply.status });
  });
  return calls;
}

test("postsQuery sets locale", () => {
  assert.equal(blog.postsQuery({ locale: "en", limit: 8 }), "?locale=en&limit=8");
  assert.equal(blog.postsQuery({ locale: "vi", tag: "a & b", page: 2, limit: 8 }), "?locale=vi&tag=a+%26+b&page=2&limit=8");
});
test("translationSlug reads the matching locale", () => {
  assert.equal(blog.translationSlug(post, "vi"), "bai-viet");
});
test("translationSlug returns null when missing", () => {
  assert.equal(blog.translationSlug(post, "en"), null);
});

test("fetchPosts retries locale=vi on 400", async t => {
  const calls = mockFetch(t, [{ status: 400 }, { status: 200, body: { data: [post], meta } }]);
  assert.deepEqual(await blog.fetchPosts({ locale: "en", tag: "tech", page: 2, limit: 8, revalidate: 60 }), { posts: [post], meta });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url.search, "?locale=en&tag=tech&page=2&limit=8");
  assert.equal(calls[1].url.search, "?locale=vi&tag=tech&page=2&limit=8");
  assert.deepEqual(calls[1].init, { next: { revalidate: 60 } });
});

test("fetchPost returns null on 404 then does not retry 400 path", async t => {
  const calls = mockFetch(t, [{ status: 404 }]);
  assert.equal(await blog.fetchPost("missing", "en"), null);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.search, "?locale=en");
});

for (const kind of ["detail", "related", "adjacent"] as const) {
  test(`${kind} fetch sends locale and retries once on 400`, async t => {
    const data = kind === "detail" ? post : kind === "related" ? [post] : { prev: post, next: null };
    const calls = mockFetch(t, [{ status: 400 }, { status: 200, body: { data } }]);
    const result = kind === "detail" ? await blog.fetchPost("a/b", "en", { revalidate: 0 })
      : kind === "related" ? await blog.fetchRelatedPosts("a/b", "en", { limit: 3, revalidate: 0 })
      : await blog.fetchAdjacentPosts("a/b", "en", { revalidate: 0 });
    assert.deepEqual(result, data);
    assert.equal(calls.length, 2);
    assert.ok(calls[0].url.pathname.includes("/posts/a%2Fb"));
    assert.equal(calls[0].url.searchParams.get("locale"), "en");
    assert.equal(calls[1].url.searchParams.get("locale"), "vi");
    if (kind === "related") assert.equal(calls[1].url.searchParams.get("limit"), "3");
    assert.deepEqual(calls[1].init, { next: { revalidate: 0 } });
  });
}

for (const locale of ["en", "vi"] as Locale[]) {
  test(`400 retry is bounded for ${locale}`, async t => {
    const calls = mockFetch(t, [{ status: 400 }, { status: 400 }]);
    await assert.rejects(blog.fetchPosts({ locale }), /400/);
    assert.equal(calls.length, 2);
    assert.equal(calls[1].url.searchParams.get("locale"), "vi");
  });
}

test("fetchPosts does not retry a non-400 error", async t => {
  const calls = mockFetch(t, [{ status: 500 }]);
  await assert.rejects(blog.fetchPosts({ locale: "en" }), /500/);
  assert.equal(calls.length, 1);
});

test("fetchAllPosts carries locale through pagination", async t => {
  const calls = mockFetch(t, [
    { status: 200, body: { data: Array.from({ length: 100 }, () => post), meta } },
    { status: 200, body: { data: [post], meta } },
  ]);
  assert.equal((await blog.fetchAllPosts("vi", 60)).length, 101);
  assert.deepEqual(calls.map(c => c.url.search), ["?locale=vi&page=1&limit=100", "?locale=vi&page=2&limit=100"]);
});

test("resolvePost redirects when page locale has another slug", async t => {
  const translated = { ...post, translations: [...post.translations, { locale: "en", slug: "my-post" }] };
  const calls = mockFetch(t, [{ status: 404 }, { status: 200, body: { data: translated } }]);
  assert.deepEqual(await blog.resolvePost("bai-viet", "en"), {
    post: translated, redirectTo: "/blog/my-post", hrefs: { en: "/blog/my-post", vi: "/vi/blog/bai-viet" },
  });
  assert.deepEqual(calls.map(c => c.url.search), ["?locale=en", "?locale=vi"]);
});

test("resolvePost keeps a VI-only post on the English page", async t => {
  mockFetch(t, [{ status: 404 }, { status: 200, body: { data: post } }]);
  assert.deepEqual(await blog.resolvePost("bai-viet", "en"), {
    post, redirectTo: null, hrefs: { en: "/blog/bai-viet", vi: "/vi/blog/bai-viet" },
  });
});

test("resolvePost keeps a matching slug and forwards caching without fallback", async t => {
  const calls = mockFetch(t, [{ status: 200, body: { data: post } }]);
  assert.deepEqual(await blog.resolvePost("bai-viet", "vi", { revalidate: 60 }), {
    post, redirectTo: null, hrefs: { en: "/blog/bai-viet", vi: "/vi/blog/bai-viet" },
  });
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].init, { next: { revalidate: 60 } });
});

test("resolvePost returns null when neither locale has the post", async t => {
  const calls = mockFetch(t, [{ status: 404 }, { status: 404 }]);
  assert.equal(await blog.resolvePost("missing", "vi"), null);
  assert.deepEqual(calls.map(c => c.url.search), ["?locale=vi", "?locale=en"]);
});
