# Blog Launch to Production + Ghost Retirement

> Status: **planned, not started.** Written 2026-07-07. See `PROGRESS.md` for the one-line tracking
> entry and current phase. Nothing below has been executed yet.

## Context

`develop` has 20 unmerged commits shipping a full self-built blog (`/blog`, `/blog/[slug]`,
tag filtering, load-more pagination, SEO/sitemap entries) backed by a separately-hosted Go+Postgres
API (`github.com/leqtrungit/blog-api`) already live at `https://blog-api.lequoctrung.id.vn/api/v1`
and media at `https://s3.lequoctrung.id.vn/blog-media` (both curl-verified 200 in the planning
session). None of this is on production yet — `main` has no PR from `develop` open. The goal now is to
(1) ship it to `lequoctrung.vn` safely, and (2) retire the old external Ghost blog
(`blog.lequoctrung.id.vn`) without losing its existing Google indexing, per the ordered strategy
already outlined in memory `project_ghost-migration-strategy.md` — this plan makes that strategy
concrete with verified specifics (exact env values, exact redirect targets, exact indexed-URL
inventory) gathered during planning.

Two facts change the shape of this from a "big migration": Ghost's own sitemap currently lists only
**4 indexed URLs** (homepage, `/about/`, `/author/le/`, and exactly one post,
`hieu-suat-phai-luon-di-kem-voi-cam-xuc-trong-doanh-nghiep`), and that one post **already exists with
the identical slug** in the new backend (confirmed via the live API). So this isn't a bulk content
migration — it's a small, precise redirect job plus a standard blog launch.

**Vercel currently has zero env vars configured** for `portfolio-website` (`vercel env ls` confirmed
empty) — `BLOG_API_BASE_URL`/`MEDIA_BASE_URL` must be added before the blog reaches real production
traffic, otherwise `/blog` and `/blog/[slug]` will 500 (both call `fetchPosts`/`fetchPost` in
`apps/website/lib/blog.ts` with no try/catch at the page level — confirmed by reading
`apps/website/app/blog/page.tsx` and `apps/website/app/blog/[slug]/page.tsx`). Both routes use
`cache: "no-store"`, which Next.js treats as dynamic-rendering opt-out, so `next build` in CI will
**not** hit the network for these two routes (matches the `ƒ /blog`, `ƒ /blog/[slug]` dynamic markers
already seen in a prior local build) — CI is safe to run before env vars exist; production traffic is
not.

---

## Phase 1 — Ship `develop` → `main`

1. `gh pr create --base main --head develop --title "Release: ship blog section to production" --body "..."`
   — this is exactly the `develop → main` release flow already documented in `CLAUDE.md`. CI
   (`.github/workflows/ci.yml`) will run profile-schema validate, typecheck, lint, `pnpm --filter
   website build` — expected to pass with no env vars set (see Context above).
2. **Do not merge yet.** Do Phase 2 first — Vercel env vars must exist before the merge-triggered
   production build, since Vercel bakes env vars in at build time (a deployment built before the vars
   are added won't retroactively pick them up).
3. After Phase 2, merge: `gh pr merge --squash <PR_NUMBER>`. This triggers the `main` production
   deploy (auto-deploy per existing Vercel Git integration).
4. Confirm the new deployment is live and assigned to `lequoctrung.vn` (Vercel dashboard or
   `vercel ls portfolio-website --prod`).

## Phase 2 — Vercel environment variables (before Phase 1 step 3)

Add to **Production** and **Preview** (same real backend for both — there's no staging blog-api
instance, and Preview should render real blog content for PR review rather than localhost failures).
Leave **Development** unset so local `next dev` keeps using the gitignored `.env.local`.

```bash
vercel env add BLOG_API_BASE_URL production   # value: https://blog-api.lequoctrung.id.vn/api/v1
vercel env add BLOG_API_BASE_URL preview      # same value
vercel env add MEDIA_BASE_URL production      # value: https://s3.lequoctrung.id.vn/blog-media
vercel env add MEDIA_BASE_URL preview         # same value
vercel env ls  # confirm all four
```

Both values were curl-verified against the live backend and a real image key during planning — no
guessing needed. If the merge accidentally happens before this, redeploy after: `vercel --prod` (or
dashboard "Redeploy" on the latest production deployment).

## Phase 3 — Post-deploy verification

```bash
curl -sI https://lequoctrung.vn/blog                                                 # 200
curl -sI https://lequoctrung.vn/blog/hieu-suat-phai-luon-di-kem-voi-cam-xuc-trong-doanh-nghiep  # 200
curl -s "https://blog-api.lequoctrung.id.vn/api/v1/posts?limit=1" | jq -r '.data[0].featured_image_key'
curl -sI "https://lequoctrung.vn/media/<that-key>"                                    # 200, image content-type
curl -s https://lequoctrung.vn/sitemap.xml | grep "/blog"                             # /blog + up to 10 post URLs
```
Plus a manual/browser check: open `/blog`, open a post, confirm the feature image actually paints
(this is the exact PNA-block scenario the `/media` rewrite proxy exists to avoid), confirm load-more
pagination. If anything fails, check `vercel logs` first — most likely cause is a missed/stale env var.

## Phase 4 — Ghost → new blog redirects (Cloudflare Redirect Rules) — DONE (2026-07-07)

`blog.lequoctrung.id.vn` resolves to Cloudflare's proxy IPs (confirmed via `dig`, same IPs as
`blog-api`/`s3` subdomains) — **not** Vercel — so this couldn't be a `next.config.mjs` redirect; it
had to be a Cloudflare Redirect Rule (Single Redirects) on the zone containing `lequoctrung.id.vn`
(zone ID `b5dd08409e12960edb6cba6fced8d291`).

**Correction from the original draft above**: a fuller re-check of Ghost's sitemap (the first check
in this session had truncated `curl` output via the `rtk` proxy tool, making it look like only 1 post
was indexed) showed **all 10 posts are indexed on Ghost**, with slugs identical to the new backend —
not just the one post originally assumed. The rule set below supersedes the 5-rule/1-post draft.

**Also**: the `cloudflare:cloudflare-api` MCP plugin was connected this session (real API access,
confirmed working for reads like zone/DNS lookups), but every `/rulesets` endpoint — even read-only
GET by ID — returned "request is not authorized" regardless of token permissions granted. This is a
guardrail built into the connector itself (Rulesets control WAF/firewall/redirects — sensitive
surface), not a Cloudflare-side permission issue. So rule creation had to be done manually in the
dashboard; the plugin was still useful for looking up exact Rules-language syntax and plan limits from
live docs + the OpenAPI spec.

First attempt used a single dynamic rule with `regex_replace()` to cover all 10 posts in one rule —
Cloudflare rejected it at deploy time: **the zone is on the Free plan**, which does not support regex
in Single Redirects (confirmed via Cloudflare's docs: Free plan = 10 rule limit, Wildcard support
only, regex requires Business plan or higher). Rebuilt using **Wildcard match** instead, which Free
supports. Final 4 rules deployed, in this order (Wildcard `/*` must be last — it matches virtually
everything not caught by rules 1-3, so a separate catch-all rule isn't needed):

| # | Match | Destination | Status |
|---|---|---|---|
| 1 | Custom filter expression: `http.request.host eq "blog.lequoctrung.id.vn" and http.request.uri.path eq "/"` | Static: `https://lequoctrung.vn/blog` | 301 |
| 2 | Custom filter expression: `http.request.host eq "blog.lequoctrung.id.vn" and http.request.uri.path eq "/about/"` | Static: `https://lequoctrung.vn` | 301 |
| 3 | Custom filter expression: `http.request.host eq "blog.lequoctrung.id.vn" and http.request.uri.path eq "/author/le/"` | Static: `https://lequoctrung.vn` | 301 |
| 4 | **Wildcard match** — Hostname `blog.lequoctrung.id.vn`, Path `/*` | Dynamic: `https://lequoctrung.vn/blog/${1}` | 301 |

Verified via `curl -sIL` against all 10 post slugs, the homepage, `/about/`, `/author/le/`, and a
random nonexistent path (wildcard fallback) — all show `301` → correct `Location` → final `200` on
`lequoctrung.vn`. One accepted minor edge case: `/rss/` also matches rule 4's wildcard and redirects to
`/blog/rss` (404 on the new site, since there's no RSS route) — not worth a 5th rule since RSS isn't an
indexed/SEO-relevant URL.

## Phase 5 — Google Search Console

**Manual step (GSC dashboard).**
1. Resubmit `https://lequoctrung.vn/sitemap.xml` on the existing `lequoctrung.vn` property (picks up
   the new `/blog` + post URLs).
2. Add `blog.lequoctrung.id.vn` as its own URL-prefix property (separate from the root-domain
   property already migrated in a prior session — that one does not cover this subdomain).
3. Run **Change of Address** on the `blog.lequoctrung.id.vn` property → target `lequoctrung.vn`. Only
   do this after Phase 4's checklist passes — Change of Address works best once the redirect
   infrastructure is already live and stable.
4. Monitor: on `blog.lequoctrung.id.vn` property's Indexing/Pages report, watch the 4 old URLs move
   from "Indexed" to "Page with redirect" (expected healthy end state, not an error). On
   `lequoctrung.vn` property, watch `/blog` and the migrated post move toward "Indexed".

## Phase 6 — Wait before shutdown

Wait **4–6 weeks** after Phase 4 verification + Phase 5 Change of Address (Google's own stated
processing window). Proceed only when: the old post URL shows "Page with redirect" (not standalone
"Indexed"), `site:blog.lequoctrung.id.vn` returns few/no results, and the new post URL is indexed on
`lequoctrung.vn`. Curl confirming the redirect works is necessary but not sufficient — don't shorten
the wait just because the mechanics look fine.

## Phase 7 — Ghost shutdown

**Manual step.** Decommission the Ghost server itself. Critically: **keep the Cloudflare Redirect
Rules and the `blog.lequoctrung.id.vn` DNS record in place** — Redirect Rules execute at Cloudflare's
edge before reaching origin, so they keep working indefinitely even with Ghost fully torn down (verify
this by briefly stopping Ghost and re-running the Phase 4 curl checklist before fully deprovisioning,
as a safety confirmation). Only remove the Ghost origin server/hosting cost, never the DNS record or
redirect rules. Update `PROGRESS.md` to close out the migration tracking entry once done.

## Phase 8 — Rollback notes

- **Deploy issue:** Vercel dashboard → Deployments → promote the prior production deployment back
  (`vercel promote <deployment-url>`) — instant, no git action needed.
- **Code-level revert needed:** branch protection blocks direct push to `main`, so open a new PR:
  `git checkout -b fix/revert-blog-launch main && git revert --no-edit <merge-sha>` → PR → merge, then
  a follow-up PR/merge to resync `develop` (per the existing "urgent prod-only fix" rule in
  `CLAUDE.md`).
- **Env-var-only issue:** `vercel env rm` + `vercel env add` with corrected value, then redeploy.
- **Known pre-existing gap (not introduced by this plan, flagged as a follow-up):** `/blog` and
  `/blog/[slug]` have no try/catch around their `fetchPosts`/`fetchPost` calls, unlike `sitemap.ts` and
  `generateStaticParams` which already degrade gracefully. If `blog-api` goes down post-launch, these
  two routes will 500 instead of showing a friendly fallback. Worth a small follow-up PR later
  (mirror the existing try/catch pattern) — out of scope for this launch plan itself.

## Verification summary

End-to-end: PR CI green → env vars confirmed via `vercel env ls` → merge → curl checks in Phase 3 all
200 → manual browser check of `/blog` and a post (image renders, pagination works) → Cloudflare
redirect checklist in Phase 4 all 301→200 → GSC Change of Address submitted → after the wait period,
GSC coverage shows the expected redirect/indexed states before Ghost is shut down.
