import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLocaleRoute } from "./routing";

test("unprefixed pages rewrite to /en", () => {
  assert.deepEqual(resolveLocaleRoute("/"), { type: "rewrite", pathname: "/en" });
  assert.deepEqual(resolveLocaleRoute("/blog/abc"), { type: "rewrite", pathname: "/en/blog/abc" });
  assert.deepEqual(resolveLocaleRoute("/opengraph-image"), { type: "rewrite", pathname: "/en/opengraph-image" });
});

test("/vi passes through", () => {
  assert.deepEqual(resolveLocaleRoute("/vi"), { type: "next" });
  assert.deepEqual(resolveLocaleRoute("/vi/blog/abc"), { type: "next" });
});

test("/en prefix 301s to unprefixed, except generated OG images", () => {
  assert.deepEqual(resolveLocaleRoute("/en"), { type: "redirect", pathname: "/" });
  assert.deepEqual(resolveLocaleRoute("/en/blog"), { type: "redirect", pathname: "/blog" });
  assert.deepEqual(resolveLocaleRoute("/en/opengraph-image"), { type: "next" });
  assert.deepEqual(resolveLocaleRoute("/en/blog/abc/opengraph-image"), { type: "next" });
});

test("root files, media and static assets are untouched", () => {
  for (const p of ["/sitemap.xml", "/robots.txt", "/feed.xml", "/llms.txt", "/llms-full.txt", "/icon.svg", "/portrait.png", "/media/a/b.webp", "/media/abc", "/_next/static/x.js"]) {
    assert.deepEqual(resolveLocaleRoute(p), { type: "next" }, p);
  }
});

test("look-alike prefixes are not locales", () => {
  assert.deepEqual(resolveLocaleRoute("/english"), { type: "rewrite", pathname: "/en/english" });
  assert.deepEqual(resolveLocaleRoute("/video"), { type: "rewrite", pathname: "/en/video" });
});

test("dotted slugs are pages, not static files", () => {
  assert.deepEqual(resolveLocaleRoute("/blog/nextjs-16.2"), { type: "rewrite", pathname: "/en/blog/nextjs-16.2" });
  assert.deepEqual(resolveLocaleRoute("/blog/v1.0.json-notes"), { type: "rewrite", pathname: "/en/blog/v1.0.json-notes" });
});
