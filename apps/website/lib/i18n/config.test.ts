import { test } from "node:test";
import assert from "node:assert/strict";
import { localePath, stripLocale, fill, isLocale } from "./config";

test("localePath", () => {
  assert.equal(localePath("en", "/blog"), "/blog");
  assert.equal(localePath("en", "/"), "/");
  assert.equal(localePath("vi", "/"), "/vi");
  assert.equal(localePath("vi", "/blog/abc"), "/vi/blog/abc");
  assert.equal(localePath("vi", "/#contact"), "/vi#contact");
  assert.equal(localePath("en", "/#contact"), "/#contact");
});

test("stripLocale", () => {
  assert.deepEqual(stripLocale("/vi"), { locale: "vi", path: "/" });
  assert.deepEqual(stripLocale("/vi/blog/x"), { locale: "vi", path: "/blog/x" });
  assert.deepEqual(stripLocale("/en"), { locale: "en", path: "/" });
  assert.deepEqual(stripLocale("/en/privacy"), { locale: "en", path: "/privacy" });
  assert.deepEqual(stripLocale("/blog"), { locale: "en", path: "/blog" });
  assert.deepEqual(stripLocale("/video"), { locale: "en", path: "/video" });
  assert.deepEqual(stripLocale("/"), { locale: "en", path: "/" });
});

test("fill + isLocale", () => {
  assert.equal(fill("{n} min read", { n: 3 }), "3 min read");
  assert.equal(fill("{missing}", {}), "{missing}");
  assert.equal(isLocale("vi"), true);
  assert.equal(isLocale("fr"), false);
});
