import { test } from "node:test";
import assert from "node:assert/strict";
import { localizedAlternates, localizedOpenGraph, postAlternates } from "./seo";

test("localizedAlternates", () => {
  assert.deepEqual(localizedAlternates("vi", "/blog"), {
    canonical: "/vi/blog",
    languages: { en: "/blog", vi: "/vi/blog", "x-default": "/blog" },
  });
  assert.deepEqual(localizedAlternates("en", "/"), {
    canonical: "/",
    languages: { en: "/", vi: "/vi", "x-default": "/" },
  });
});

test("localizedOpenGraph carries the locale-aware og image", () => {
  const en = localizedOpenGraph("en", "/blog", { title: "Blog" });
  assert.deepEqual(en.images, [{ url: "/opengraph-image", width: 1200, height: 630 }]);
  const vi = localizedOpenGraph("vi", "/privacy", { title: "Riêng tư" });
  assert.deepEqual(vi.images, [{ url: "/vi/opengraph-image", width: 1200, height: 630 }]);
});


test("postAlternates is self-canonical with hreflang when both exist", () => {
  const hrefs = { en: "/blog/my-post", vi: "/vi/blog/bai-viet" };
  assert.deepEqual(postAlternates("vi", hrefs, true), {
    canonical: "/vi/blog/bai-viet",
    languages: { en: "/blog/my-post", vi: "/vi/blog/bai-viet", "x-default": "/blog/my-post" },
  });
  assert.deepEqual(postAlternates("en", hrefs, true), {
    canonical: "/blog/my-post",
    languages: { en: "/blog/my-post", vi: "/vi/blog/bai-viet", "x-default": "/blog/my-post" },
  });
});

test("postAlternates is English canonical and has no languages when VI-only", () => {
  const hrefs = { en: "/blog/bai-viet", vi: "/vi/blog/bai-viet" };
  assert.deepEqual(postAlternates("vi", hrefs, false), { canonical: "/blog/bai-viet" });
  assert.deepEqual(postAlternates("en", hrefs, false), { canonical: "/blog/bai-viet" });
});
