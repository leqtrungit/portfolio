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
