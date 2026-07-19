# Analytics Beacon v2 + SEO Handoff Integration — Implementation Plan (rev 2)

> **STATUS: ✅ COMPLETED & RELEASED 2026-07-19.** Executed by Grok Build CLI in 4 batches, verified per-batch by Claude Code as tech lead. Shipped via PR #22 (→ develop) and release PR #23 (→ main, production). All verifier checklist items passed on production, including live track endpoint (bot-classified curl correctly got empty `view_id`). Cloudflare AI-crawler block was found and turned off pre-release; backend's real-IP handling (`CF-Connecting-IP` trust gate) was audited and confirmed HANDLED.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Execution model for this plan:** every task is delegated to **Grok Build CLI** (one shared session `grok-analytics-v2`). **Claude Code acts as tech-lead verifier** — reviews each task's diff against this plan before the next task starts, and runs the final verification gate before the PR is opened.
>
> **Rev 2 (2026-07-19):** handoff §3 changed — the backend **no longer serves** `sitemap.xml` / `robots.txt` / `feed.xml` / `llms.txt` / `llms-full.txt`. The FE now **owns and builds all five** from the public Posts API. All proxy/rewrite tasks for those paths are gone; replaced by site-owned route handlers (Tasks 4–8).

**Goal:** Upgrade the pageview beacon to the blog-api "beacon v2" contract (view_id + engagement + UTM), build the full FE-owned SEO/AEO surface (sitemap, robots AI allow-list, feed, llms files, JSON-LD, RSS link), and add the required privacy disclosure — per `blog-api/docs/frontend-analytics-handoff.md` (rev of 2026-07-19).

**Architecture:** Next.js App Router site (`apps/website`) in a pnpm monorepo. Beacon = client module (`lib/analytics.ts`) driven by `usePathname()` in the existing root-layout `AnalyticsTracker`. Analytics uses **direct CORS** (handoff §2a) — needs a CSP `connect-src` addition in `proxy.ts`. SEO artifacts are ISR route handlers sourced from `GET /api/v1/posts` (server-side, via existing `lib/blog.ts`).

**Tech Stack:** Next.js (App Router, Turbopack), TypeScript. No test framework in this package — each task's verify cycle is `typecheck` + `build` + a behavioral check listed in the task.

## Key decisions (tech-lead calls, made after codebase survey)

| # | Decision | Rationale |
|---|---|---|
| D1 | **Direct CORS mode** for analytics (`API = https://blog-api.lequoctrung.id.vn`); delete the old `/api/v1/analytics/track` rewrite | Handoff §2a primary. Backend stores raw IP + rate-limits per IP — the same-origin Vercel rewrite would hide client IPs behind proxy infra. |
| D2 | **CSP must gain `connect-src 'self' https://blog-api.lequoctrung.id.vn`** | `proxy.ts` has `default-src 'self'` and no `connect-src`; without this, both `fetch` and `sendBeacon` to the API origin are blocked by the browser. Hard blocker for D1. |
| D3 | FE-owned `sitemap.ts`/`robots.ts` stay; robots gains the **AI-crawler allow-list carried over verbatim** from handoff §3.2 | Now mandated by handoff rev 2 (backend dropped these paths). Sitemap only needs freshness (ISR) + `lastmod` from the new `updated_at` field on the list endpoint. |
| D4 | **`feed.xml`, `llms.txt`, `llms-full.txt` become site-owned ISR route handlers** built from the Posts API (no proxying — backend no longer serves them) | Handoff §3.3–3.4. Feed is **summary-only** (excerpt, list endpoint only — allowed by §3.3, avoids N detail fetches); `llms-full.txt` fetches each post's detail for full `content` (§3.4 says this volume is fine, cached by ISR not per-request). |
| D5 | Keep the existing `hostname === "lequoctrung.vn"` production gate in the beacon | Prevents dev/preview traffic from polluting metrics; same behavior as v1. |
| D6 | New `/privacy` page (none exists today) + links from ContactSection and BlogFooter | Handoff §7 requires disclosure of IP + UA storage; no privacy page exists anywhere. |
| D7 | RSS `alternates.types` link must be added in **both** root layout and post page metadata | Next.js shallow-replaces the `alternates` object per segment — the post page's `alternates: { canonical }` would otherwise wipe the layout's RSS link on post pages. |
| D8 | `lib/blog.ts` fetch helpers gain an opt-in `revalidate` option; existing callers keep `cache: "no-store"` behavior | The new ISR routes must not be forced dynamic by the helpers' hardcoded `no-store`; page rendering behavior stays untouched. Also add `fetchAllPosts` pagination per §3 ("paginate until a page returns fewer than limit"). |

## Global Constraints

- API origin: `https://blog-api.lequoctrung.id.vn` (exact, no trailing slash). Posts endpoints are public, CORS-open GET; only `/analytics/*` is Origin-classified.
- Track: `POST /api/v1/analytics/track` (JSON); engagement: `POST /api/v1/analytics/engagement` via `sendBeacon` with `text/plain` Blob.
- **Never retry on HTTP 429.** Soft-fail everything; analytics must never block navigation or UX.
- Engagement fires only when `view_id` is a non-empty string.
- Public post URL pattern: `https://lequoctrung.vn/blog/{slug}` (matches backend `BLOG_POST_PATH_PREFIX=/blog`).
- robots.txt must carry the §3.2 AI-crawler allow-list **verbatim** (12 agents) + `Sitemap:` line.
- Workflow: branch `feature/analytics-beacon-v2` off `develop`, PR back into `develop`. **Never commit to `develop`/`main` directly.**
- CI gate = `pnpm --filter @new-portfolio/profile-schema validate`, `pnpm --filter website typecheck`, `pnpm --filter website lint`, `pnpm --filter website build`.

## Pre-flight (verifier/backend/infra coordination — NOT a Grok task)

**Verified live on 2026-07-19:** both `lequoctrung.vn` (→ Vercel) and `blog-api.lequoctrung.id.vn` are proxied through **Cloudflare** (`server: cloudflare`, `cf-ray` present). `updated_at` IS present in `GET /api/v1/posts` items ✓. API's old SEO paths already 404 ✓ (so `/feed.xml`, `/llms*.txt` are dead site-wide until Tasks 7–8 ship).

### Cloudflare (infra — BLOCKER for the AEO goal, fix before/alongside Task 6)

- **CF is currently injecting a managed robots.txt block on `lequoctrung.vn` that `Disallow: /` for GPTBot, ClaudeBot, CCBot, Google-Extended, Amazonbot, Applebot-Extended, Bytespider, meta-externalagent** plus `Content-Signal: search=yes,ai-train=no,use=reference`. This overrides the FE robots allow-list (specific-UA groups beat `*`; most AI crawlers will honor the Disallow). Task 6 is useless until this is turned off.
- Action in the CF dashboard, zone `lequoctrung.vn`: **AI Crawl Control / "Block AI bots" → off (allow)** and **managed robots.txt / Content Signals → off** (or explicitly set signals to allow ai-input). Then **purge CF cache for `/robots.txt`** (cached 4h).
- Also verify the AI-bot setting isn't enforced at WAF level (crawlers getting 403 at the edge even with a clean robots.txt) — test-fetch with a bot UA after the change.
- Zone `lequoctrung.id.vn` (API): confirm Bot Fight Mode / challenges are NOT applied to `/api/v1/analytics/*` — a challenge page would silently kill every beacon.

### Backend orders (blog-api team)

1. **Real client IP behind Cloudflare (critical for "deep analytics"):** the Go service currently sits behind CF proxy, so `c.ClientIP()` sees CF edge IPs unless configured. Must derive the visitor IP from `CF-Connecting-IP` (trusting only Cloudflare's published IP ranges — Gin `SetTrustedProxies` or equivalent). Without this: stored "raw IP" is CF's, per-IP rate limit (60 rpm) buckets many real users into a few CF colo IPs → legitimate 429s, and IP-based bot/uniqueness classification is garbage.
2. Confirm backend env (handoff §3.5 + §2a): `TRACK_ALLOWED_ORIGINS=https://lequoctrung.vn` (exact — otherwise ALL site traffic is classified "suspected spam"), `BLOG_POST_PATH_PREFIX=/blog`, `BLOG_BASE_URL=https://lequoctrung.vn`.
3. FYI/confirm intent: preflight `OPTIONS /api/v1/analytics/track` currently answers `access-control-allow-origin: *` (verified live). Functionally fine for the beacon; confirm spam classification really keys off the `Origin` header server-side, since CORS itself is wide open.

- No GSC action needed: `https://lequoctrung.vn/sitemap.xml` URL is unchanged, only its generator moves fully FE-side.

---

### Task 0: Branch setup

**Files:** none (git only)

- [x] **Step 1:** `git fetch origin && git checkout develop && git pull && git checkout -b feature/analytics-beacon-v2`

### Task 1: Beacon v2 module

**Files:**
- Create: `apps/website/lib/analytics.ts`
- Modify: `apps/website/components/ui/AnalyticsTracker.tsx` (full rewrite of body)

**Interfaces:**
- Produces: `trackPage(): void`, `initAnalyticsListeners(): void` from `@/lib/analytics` (client-only module, module-level state).

- [x] **Step 1: Write `apps/website/lib/analytics.ts`**

```ts
// Client-side pageview + engagement beacon (blog-api beacon v2).
// Contract: docs/frontend-analytics-handoff.md in the blog-api repo.
const API = "https://blog-api.lequoctrung.id.vn";

let viewId = "";
let maxScroll = 0;
let activeMs = 0;
let lastVisibleAt = 0;
let ticking = false;
let listenersReady = false;

function enabled(): boolean {
  return typeof window !== "undefined" && window.location.hostname === "lequoctrung.vn";
}

function scrollPct(): number {
  const el = document.documentElement;
  const scrollable = el.scrollHeight - el.clientHeight;
  if (scrollable <= 0) return 100;
  return Math.min(100, Math.round((el.scrollTop / scrollable) * 100));
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    maxScroll = Math.max(maxScroll, scrollPct());
    ticking = false;
  });
}

function startTimer() {
  if (!document.hidden) lastVisibleAt = performance.now();
}

function pauseTimer() {
  if (lastVisibleAt > 0) {
    activeMs += performance.now() - lastVisibleAt;
    lastVisibleAt = 0;
  }
}

function sendEngagement() {
  if (!viewId) return;
  pauseTimer();
  maxScroll = Math.max(maxScroll, scrollPct());
  const body = JSON.stringify({
    view_id: viewId,
    duration_ms: Math.round(activeMs),
    scroll_pct: maxScroll,
  });
  // text/plain avoids a CORS preflight; server still parses JSON. Idempotent
  // server-side (GREATEST on both fields), so repeat fires are safe.
  navigator.sendBeacon(
    `${API}/api/v1/analytics/engagement`,
    new Blob([body], { type: "text/plain" }),
  );
}

function onVisibility() {
  if (document.visibilityState === "hidden") {
    sendEngagement();
  } else {
    startTimer();
  }
}

export function trackPage() {
  if (!enabled()) return;
  // Flush the previous page's engagement before starting a new view (SPA nav).
  sendEngagement();
  viewId = "";
  maxScroll = 0;
  activeMs = 0;
  lastVisibleAt = 0;

  fetch(`${API}/api/v1/analytics/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: location.pathname,
      referrer: document.referrer || "",
      query: location.search || "",
    }),
    keepalive: true,
  })
    .then(async (res) => {
      if (!res.ok) return; // includes 429: never retry
      const json = (await res.json()) as { data?: { view_id?: string } };
      viewId = json?.data?.view_id || "";
      if (viewId) startTimer();
    })
    .catch(() => {});
}

export function initAnalyticsListeners() {
  if (!enabled() || listenersReady) return;
  listenersReady = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", sendEngagement);
  document.addEventListener("visibilitychange", onVisibility);
}
```

- [x] **Step 2: Rewrite `apps/website/components/ui/AnalyticsTracker.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalyticsListeners, trackPage } from "@/lib/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalyticsListeners();
    // Fires on first load and on every App Router client navigation;
    // trackPage() flushes the previous view's engagement first, so SPA
    // transitions are not double-counted.
    trackPage();
  }, [pathname]);

  return null;
}
```

- [x] **Step 3: Verify** — `pnpm --filter website typecheck` → PASS; `pnpm --filter website lint` → PASS.
- [x] **Step 4: Commit** — `git add apps/website/lib/analytics.ts apps/website/components/ui/AnalyticsTracker.tsx && git commit -m "feat(analytics): upgrade beacon to v2 (view_id + engagement + UTM query)"`

### Task 2: CSP `connect-src` for the API origin

**Files:**
- Modify: `apps/website/proxy.ts:30-41` (the `csp` array)

- [x] **Step 1:** In the `csp` array, after `"default-src 'self'"`, add:

```ts
    "connect-src 'self' https://blog-api.lequoctrung.id.vn",
```

Also extend the file's header comment with one line noting `connect-src` exists for the cross-origin analytics beacon (`fetch` + `sendBeacon` are both governed by connect-src).

- [x] **Step 2: Verify** — `pnpm --filter website typecheck` → PASS. `pnpm --filter website build && pnpm --filter website start` then `curl -sI http://localhost:3000 | grep -i content-security-policy` → header contains `connect-src 'self' https://blog-api.lequoctrung.id.vn`.
- [x] **Step 3: Commit** — `git add apps/website/proxy.ts && git commit -m "feat(security): allow analytics API origin in CSP connect-src"`

### Task 3: Remove the v1 track rewrite

**Files:**
- Modify: `apps/website/next.config.mjs:18-21`

- [x] **Step 1:** Delete only this rewrite entry (the `/media/:path*` rewrite and everything else stays):

```js
      {
        source: "/api/v1/analytics/track",
        destination: `${BLOG_API_BASE_URL}/analytics/track`,
      },
```

If `BLOG_API_BASE_URL` is then unused in this file, delete its `const` declaration too (the env var itself remains — `lib/blog.ts` reads it).

- [x] **Step 2: Verify** — `grep -rn "analytics/track" apps/website/next.config.mjs` → no matches; `pnpm --filter website build` → PASS.
- [x] **Step 3: Commit** — `git add apps/website/next.config.mjs && git commit -m "chore(analytics): drop v1 same-origin track rewrite (CORS-primary now)"`

### Task 4: `lib/blog.ts` — `updated_at`, ISR-friendly fetches, pagination helper

**Files:**
- Modify: `apps/website/lib/blog.ts`

**Interfaces:**
- Produces: `PostSummary.updated_at: string`; `fetchPosts(params?: { tag?: string; page?: number; limit?: number; revalidate?: number })`; `fetchPost(slug: string, opts?: { revalidate?: number })`; `fetchAllPosts(revalidate?: number): Promise<PostSummary[]>`. Tasks 5, 7, 8 consume these.

- [x] **Step 1:** Move `updated_at: string` from `PostDetail` up into `PostSummary` (the list endpoint now returns it — handoff §3; `PostDetail extends PostSummary` keeps the detail type unchanged).
- [x] **Step 2:** Make cache behavior opt-in per call (default stays `no-store` so page rendering is untouched — decision D8):

```ts
export async function fetchPosts(
  params: { tag?: string; page?: number; limit?: number; revalidate?: number } = {}
): Promise<{ posts: PostSummary[]; meta: PaginationMeta }> {
  const url = new URL(`${API_BASE}/posts`);
  if (params.tag) url.searchParams.set("tag", params.tag);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.limit) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(
    url.toString(),
    params.revalidate != null
      ? { next: { revalidate: params.revalidate } }
      : { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);

  const json = (await res.json()) as { data: PostSummary[]; meta: PaginationMeta };
  return { posts: json.data, meta: json.meta };
}

export async function fetchPost(
  slug: string,
  opts: { revalidate?: number } = {}
): Promise<PostDetail | null> {
  const res = await fetch(
    `${API_BASE}/posts/${slug}`,
    opts.revalidate != null
      ? { next: { revalidate: opts.revalidate } }
      : { cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);

  const json = (await res.json()) as { data: PostDetail };
  return json.data;
}

// Handoff §3: paginate until a page returns fewer than `limit`.
export async function fetchAllPosts(revalidate?: number): Promise<PostSummary[]> {
  const limit = 100;
  const all: PostSummary[] = [];
  let page = 1;
  for (;;) {
    const { posts } = await fetchPosts({ limit, page, revalidate });
    all.push(...posts);
    if (posts.length < limit) return all;
    page += 1;
  }
}
```

- [x] **Step 3: Verify** — `pnpm --filter website typecheck` → PASS (existing callers pass no new options and are unaffected).
- [x] **Step 4: Commit** — `git add apps/website/lib/blog.ts && git commit -m "feat(blog): updated_at on summaries, ISR-friendly fetch opts, fetchAllPosts"`

### Task 5: Sitemap — all posts, `lastmod` from `updated_at`, hourly ISR

**Files:**
- Modify: `apps/website/app/sitemap.ts`

- [x] **Step 1:** Full replacement:

```ts
import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/profile";
import { fetchAllPosts } from "@/lib/blog";

// Re-generate hourly so posts published after the last deploy still appear
// (the backend no longer serves a sitemap — this file is the only one).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await fetchAllPosts(3600);
    postEntries = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at ?? post.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Blog API unavailable at build time — skip post entries
  }

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...postEntries,
  ];
}
```

- [x] **Step 2: Verify** — `pnpm --filter website build && pnpm --filter website start`; `curl -s http://localhost:3000/sitemap.xml | head -5` → valid urlset XML containing `https://lequoctrung.vn`.
- [x] **Step 3: Commit** — `git add apps/website/app/sitemap.ts && git commit -m "feat(seo): sitemap with hourly ISR + updated_at lastmod + full pagination"`

### Task 6: robots.txt — AI-crawler allow-list (§3.2, verbatim)

**Files:**
- Modify: `apps/website/app/robots.ts`

- [x] **Step 1:** Full replacement:

```ts
import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/profile";

// AI-crawler allow-list carried over verbatim from the blog API's old
// robots.txt (handoff §3.2) so nothing regresses for AEO.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
  "Amazonbot",
  "meta-externalagent",
  "Applebot-Extended",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

- [x] **Step 2: Verify** — `pnpm --filter website build && pnpm --filter website start`; `curl -s http://localhost:3000/robots.txt` → contains all 12 agent blocks and the `Sitemap:` line.
- [x] **Step 3: Commit** — `git add apps/website/app/robots.ts && git commit -m "feat(seo): carry over AI-crawler allow-list into site-owned robots.txt"`

### Task 7: `feed.xml` — site-owned RSS 2.0 route (summary-only)

**Files:**
- Create: `apps/website/app/feed.xml/route.ts`

- [x] **Step 1:**

```ts
import { fetchAllPosts, type PostSummary } from "@/lib/blog";
import { getProfile } from "@/lib/profile";
import { truncateForMeta } from "@/lib/seo";

export const revalidate = 3600;

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET() {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";
  const title = `${profile.basics.name}'s Blog`;
  const description = truncateForMeta(profile.basics.summary ?? "");

  let posts: PostSummary[] = [];
  try {
    posts = await fetchAllPosts(3600);
  } catch {
    // API unavailable — serve a valid, empty channel rather than a 500
  }

  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${siteUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <description>${esc(p.excerpt ?? "")}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(title)}</title>
    <link>${siteUrl}</link>
    <description>${esc(description)}</description>
    <language>en</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
```

- [x] **Step 2: Verify** — `pnpm --filter website build && pnpm --filter website start`; `curl -s http://localhost:3000/feed.xml | head -8` → RSS XML with channel title/link; `<item>` entries present when the API is reachable.
- [x] **Step 3: Commit** — `git add apps/website/app/feed.xml && git commit -m "feat(seo): site-owned RSS feed.xml built from Posts API"`

### Task 8: `llms.txt` + `llms-full.txt` routes

**Files:**
- Create: `apps/website/app/llms.txt/route.ts`
- Create: `apps/website/app/llms-full.txt/route.ts`

- [x] **Step 1: `apps/website/app/llms.txt/route.ts`** (§3.4 — list endpoint only):

```ts
import { fetchAllPosts, type PostSummary } from "@/lib/blog";
import { getProfile } from "@/lib/profile";

export const revalidate = 3600;

export async function GET() {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  let posts: PostSummary[] = [];
  try {
    posts = await fetchAllPosts(3600);
  } catch {}

  const lines = [
    `# ${profile.basics.name}'s Blog`,
    "",
    `> ${profile.basics.summary ?? ""}`,
    "",
    "## Posts",
    "",
    ...posts.map(
      (p) =>
        `- [${p.title}](${siteUrl}/blog/${p.slug})${p.excerpt ? `: ${p.excerpt}` : ""}`
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

- [x] **Step 2: `apps/website/app/llms-full.txt/route.ts`** (§3.4 — one detail fetch per post, cached by ISR):

```ts
import { fetchAllPosts, fetchPost } from "@/lib/blog";
import { getProfile } from "@/lib/profile";

export const revalidate = 3600;

export async function GET() {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  const sections: string[] = [
    `# ${profile.basics.name}'s Blog`,
    "",
    `> ${profile.basics.summary ?? ""}`,
    "",
  ];

  try {
    const posts = await fetchAllPosts(3600);
    for (const summary of posts) {
      const post = await fetchPost(summary.slug, { revalidate: 3600 });
      if (!post) continue;
      sections.push(
        `## ${post.title}`,
        "",
        `URL: ${siteUrl}/blog/${post.slug}`,
        "",
        post.content,
        "",
        "---",
        ""
      );
    }
  } catch {}

  return new Response(sections.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

- [x] **Step 3: Verify** — `pnpm --filter website build && pnpm --filter website start`; `curl -s http://localhost:3000/llms.txt | head -8` → markdown header + post links; `curl -s http://localhost:3000/llms-full.txt | grep -c "^## "` ≥ 1 when the API is reachable.
- [x] **Step 4: Commit** — `git add apps/website/app/llms.txt apps/website/app/llms-full.txt && git commit -m "feat(aeo): site-owned llms.txt and llms-full.txt built from Posts API"`

### Task 9: RSS alternate link + homepage WebSite/Blog JSON-LD

**Files:**
- Modify: `apps/website/app/layout.tsx`
- Modify: `apps/website/app/blog/[slug]/page.tsx` (`generateMetadata` alternates only)

- [x] **Step 1:** In `app/layout.tsx` `metadata`, add:

```ts
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
```

- [x] **Step 2:** In `app/blog/[slug]/page.tsx` `generateMetadata`, change `alternates` to (decision D7 — child `alternates` replaces the parent's wholesale):

```ts
    alternates: {
      canonical: `/blog/${slug}`,
      types: { "application/rss+xml": "/feed.xml" },
    },
```

- [x] **Step 3:** In `app/layout.tsx`, replace the single `personJsonLd` script payload with an `@graph` (keep the existing `personJsonLd` fields verbatim as the first node, minus its own `"@context"` key — the graph supplies it):

```ts
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    personJsonLd,
    {
      "@type": "WebSite",
      name: `${profile.basics.name}'s Blog`,
      url: siteUrl,
      description: metaDescription,
      publisher: { "@type": "Person", name: profile.basics.name, url: siteUrl },
    },
    {
      "@type": "Blog",
      name: `${profile.basics.name}'s Blog`,
      url: `${siteUrl}/blog`,
      description: metaDescription,
      publisher: { "@type": "Person", name: profile.basics.name, url: siteUrl },
    },
  ],
};
```

Render `JSON.stringify(siteJsonLd)` in the existing `<script type="application/ld+json">`.

- [x] **Step 4: Verify** — `pnpm --filter website build && pnpm --filter website start`; `curl -s http://localhost:3000 | grep -o 'application/rss+xml'` → match; `curl -s http://localhost:3000 | python3 -c "import sys,re,json; m=re.search(r'<script type=\"application/ld\+json\">(.*?)</script>', sys.stdin.read(), re.S); json.loads(m.group(1)); print('JSON-LD OK')"` → `JSON-LD OK`.
- [x] **Step 5: Commit** — `git add apps/website/app/layout.tsx "apps/website/app/blog/[slug]/page.tsx" && git commit -m "feat(seo): RSS alternate link + WebSite/Blog JSON-LD graph"`

### Task 10: Enrich per-post BlogPosting JSON-LD

**Files:**
- Modify: `apps/website/app/blog/[slug]/page.tsx:221-234` (the JSON-LD script at the bottom of `PostPage`)

- [x] **Step 1:** Replace the JSON-LD object with the full handoff §4.1 shape (absolute image URL; `imageUrl` from `buildImageUrl` is site-relative like `/media/...`):

```tsx
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt ?? post.title,
            datePublished: post.created_at,
            dateModified: post.updated_at,
            author: {
              "@type": "Person",
              name: "Le Quoc Trung",
              url: "https://lequoctrung.vn",
            },
            ...(imageUrl ? { image: `https://lequoctrung.vn${imageUrl}` } : {}),
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://lequoctrung.vn/blog/${post.slug}`,
            },
            url: `https://lequoctrung.vn/blog/${post.slug}`,
          }),
        }}
      />
```

- [x] **Step 2: Verify** — `pnpm --filter website typecheck && pnpm --filter website build` → PASS.
- [x] **Step 3: Commit** — `git add "apps/website/app/blog/[slug]/page.tsx" && git commit -m "feat(seo): complete BlogPosting JSON-LD (author, image, mainEntityOfPage)"`

### Task 11: Privacy page + links

**Files:**
- Create: `apps/website/app/privacy/page.tsx`
- Modify: `apps/website/components/sections/ContactSection.tsx` (add one footer-style link)
- Modify: `apps/website/components/blog/BlogFooter.tsx` (add one link)

- [x] **Step 1:** Create `app/privacy/page.tsx` — a server component styled with the existing `tokens` from `@/lib/tokens` (match the site's inline-style convention; see `app/blog/[slug]/page.tsx` for typography patterns). Metadata: `title: "Privacy"`, `alternates: { canonical: "/privacy" }`. Content must state, in plain English (handoff §7):
  1. **What is collected** — first-party analytics only: page path, referrer, query/UTM parameters, approximate engagement (time on page, scroll depth), IP address, and browser User-Agent.
  2. **Why** — traffic measurement, bot/spam detection, content improvement; not advertising.
  3. **Sharing** — no third-party analytics vendors; data stays on infrastructure controlled by the site operator.
  4. **No cross-site tracking** — no ad pixels, no shared advertising identifiers.
  5. **Retention** — raw analytics events are retained only as long as operationally needed (verifier: confirm concrete number with backend before merge and update this line if one is provided).
  Must NOT claim "fully anonymous" or "no IP stored".
- [x] **Step 2:** Add a small `Privacy` link (Next `<Link href="/privacy">`) in `ContactSection.tsx` (bottom of the section, muted mono style consistent with neighbors) and in `BlogFooter.tsx`.
- [x] **Step 3: Verify** — `pnpm --filter website build && pnpm --filter website start`; `curl -s http://localhost:3000/privacy | grep -io "IP address"` → match. Lint passes.
- [x] **Step 4: Commit** — `git add apps/website/app/privacy apps/website/components/sections/ContactSection.tsx apps/website/components/blog/BlogFooter.tsx && git commit -m "feat(privacy): add privacy page disclosing first-party analytics (IP + UA)"`

### Task 12: Full CI gate + PR into develop

- [x] **Step 1:** From repo root: `pnpm --filter @new-portfolio/profile-schema validate && pnpm --filter website typecheck && pnpm --filter website lint && pnpm --filter website build` → all PASS.
- [x] **Step 2:** `git push -u origin feature/analytics-beacon-v2` and open a PR into `develop` with `gh pr create --base develop` summarizing: beacon v2, CSP connect-src, FE-owned sitemap/robots/feed/llms, JSON-LD, RSS link, privacy page. **Do not merge** — merging happens only after the verifier sign-off below.

---

## Verifier checklist (Claude, tech lead — after Grok's PR exists)

1. **Diff review vs this plan** — especially: no retry-on-429 anywhere; engagement gated on non-empty `view_id`; `query` field sent; `text/plain` Blob for sendBeacon; old track rewrite removed; existing `no-store` behavior of page-rendering fetches unchanged (D8); robots allow-list matches §3.2 verbatim (12 agents).
2. **CI green** on the PR (schema validate, typecheck, lint, build).
3. **On production after CF fix:** `curl -s https://lequoctrung.vn/robots.txt` → NO `# BEGIN Cloudflare Managed content` block, no `Disallow` for AI agents; the FE's 12-agent allow-list + `Sitemap:` line only.
4. **On the Vercel preview deployment:** `curl -sI /` CSP header contains `connect-src`; `curl` `/sitemap.xml` (site pages + posts, `lastmod` present), `/robots.txt` (AI list + Sitemap line), `/feed.xml` (valid RSS with items), `/llms.txt` and `/llms-full.txt` (markdown index / full bodies); view-source JSON-LD on `/` and one post parses and matches handoff §4; RSS `<link rel="alternate">` present on `/` **and** on a post page (D7).
5. **Beacon behavior:** hostname gate means the preview sends nothing — verify by code review + after prod deploy, confirm in the browser: track POST returns 200 with `view_id`, engagement beacon fires on tab hide (Network tab), no console CSP violations.
6. **Pre-flight confirmed** (CF AI-block off + cache purged; backend `TRACK_ALLOWED_ORIGINS` exact; `CF-Connecting-IP` handling shipped) — otherwise prod traffic is "suspected spam" / rate-limited / robots stays hostile to AI crawlers.
7. After merge to `develop`, the release PR `develop` → `main` follows the repo's normal release flow; prod verification (step 4's live part) happens after that.

## Out of scope (explicitly deferred)

- UTM auto-append in `ShareBar` (handoff §6 is a sharing convention; tiny follow-up PR: append `?utm_source={network}&utm_medium=social` in `ShareBar.tsx`).
- Same-origin `/api/*` proxy (handoff §2b) — not needed in CORS-primary mode.
- Full-content RSS (`content:encoded` from post detail) — summary-only feed chosen (D4); upgrade later if a reader audience materializes.
- Publish-webhook-driven revalidation (handoff §3.1 mentions cron/webhook) — hourly ISR is sufficient at current publish cadence; revisit if instant freshness is ever needed.
