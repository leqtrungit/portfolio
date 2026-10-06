import { test } from "node:test";
import assert from "node:assert/strict";
import { localizedAlternates, localizedOpenGraph } from "./seo";

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
