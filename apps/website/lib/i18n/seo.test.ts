import { test } from "node:test";
import assert from "node:assert/strict";
import { localizedAlternates } from "./seo";

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
