# PROGRESS.md

Tracks longer-running, cross-session tasks for this repo. Check this file at the start of a new
session before asking the user what's going on — it has the current state and next steps.

---

## Self-built blog (planned 2026-06-25, backend + frontend built, not yet deployed to production)

**Goal:** replace the external Ghost blog (`blog.lequoctrung.id.vn`) with a self-built blog: a Go +
Postgres backend (separate repo `github.com/leqtrungit/blog-api`) and public UI inside `apps/website`
at `lequoctrung.vn/blog`.

**Status (updated 2026-07-07):** both halves are built. The Go backend is live at
`https://blog-api.lequoctrung.id.vn/api/v1` with media at `https://s3.lequoctrung.id.vn/blog-media`
(10 posts already published there). The frontend (`/blog`, `/blog/[slug]`, tag filtering, load-more
pagination, SEO/sitemap) is complete on `develop` (20 commits, not yet merged to `main`). See
`docs/blog-plan.md` for the original backend design doc (now superseded in parts — the admin UI
described there was never built inside this monorepo; posts are managed via the separate `blog-api`
repo/DB directly) and **`docs/superpowers/plans/2026-07-07-blog-launch-ghost-retirement.md`** for the
concrete step-by-step plan to ship to production and retire Ghost.

**Next step:** work through the phases in that plan doc, in order:
- [x] Phase 1 (pre-main) — PR `develop` → `main` opened: #6
- [x] Phase 2 (Preview) — `BLOG_API_BASE_URL`/`MEDIA_BASE_URL` set on Vercel **Preview** env; manually
      triggered a preview deployment (`vercel deploy`, GitHub auto-deploy still broken — see below) at
      `https://portfolio-website-9u3thso53-lequoctrung-its-projects.vercel.app`
- [x] Phase 3 (Preview) — verified in browser: `/blog` list, post detail, and feature image via
      `/media` proxy all render correctly on the preview deployment
- [ ] Phase 2 (Production) — set the same two env vars for **Production**, then merge PR #6
- [ ] Phase 3 (Production) — re-run the curl/browser verification against `lequoctrung.vn`
- [ ] Phase 4 — Cloudflare Redirect Rules on `blog.lequoctrung.id.vn` (5 rules, manual dashboard step)
- [ ] Phase 5 — GSC: resubmit sitemap, add `blog.lequoctrung.id.vn` property, Change of Address
- [ ] Phase 6 — wait 4–6 weeks, monitor GSC coverage
- [ ] Phase 7 — shut down Ghost (keep DNS + redirect rules in place)

Note: Vercel's GitHub integration still doesn't auto-deploy on push/PR (same issue tracked in the
domain-migration section below) — every deployment so far has been triggered manually via
`vercel deploy`/`vercel deploy --prod`. Factor this into Phase 1/3 above: merging PR #6 will **not**
automatically produce a new production deployment; a manual `vercel deploy --prod` (or dashboard
redeploy) is needed right after merge.

Ghost's currently-indexed surface is small and fully enumerated in the plan doc: just 4 URLs
(homepage, `/about/`, `/author/le/`, and one post — which already exists under the identical slug in
the new backend, confirmed via the live API).

---

## Git branching + PR workflow (introduced 2026-06-25)

**Goal:** stop direct-to-`main` pushes ahead of a batch of large upcoming features — every change now
flows through a PR with CI gating, on a `develop` (integration) + `main` (production) model.

**Status: done.** `develop` branch created, CI added, branch protection applied to both `main` and
`develop`, verified end-to-end (a direct push attempt to `main` was rejected by GitHub: `GH006:
Protected branch update failed... Changes must be made through a pull request`).

### What's in place
- Branches: `main` (production, auto-deploys to `lequoctrung.vn`) and `develop` (integration branch).
  Feature work branches off `develop` as `feature/<name>`/`fix/<name>`, PRs back into `develop`;
  periodic PR `develop` → `main` to ship. Documented in `CLAUDE.md` under `## Workflow`.
- `.github/workflows/ci.yml` — runs on every PR into `main`/`develop` and on push to `develop`:
  `pnpm --filter @new-portfolio/profile-schema validate`, `pnpm typecheck`, `pnpm lint`,
  `pnpm --filter website build`.
- `.github/pull_request_template.md` — checklist mirroring the CI steps.
- Branch protection on `main` and `develop` (via `gh api .../branches/<branch>/protection`):
  PR required, `ci` status check required, **`enforce_admins: true`** (no bypass for anyone, including
  the repo owner), `required_approving_review_count: 0` (solo repo — GitHub blocks self-approval
  anyway, so the PR + CI is the real gate), no force-push, no branch deletion.
- Merge strategy: squash merge for feature PRs into `develop`/`main`.

### Bugs the new CI caught immediately (first time `pnpm lint`/`pnpm typecheck` had ever run across
the whole monorepo, since no CI existed before)
- [x] `packages/profile-schema` and `apps/cv-renderer` used `node:fs`/`process` without Node types
      wired up — added `@types/node` devDependency + `"types": ["node"]` in both `tsconfig.json`s.
- [x] `apps/website`'s `lint` script was `next lint`, which **no longer exists in Next.js 16**
      (confirmed via `next --help` — the `lint` subcommand was dropped from the CLI entirely). Replaced
      with `eslint .` backed by a new `eslint.config.mjs` (flat config) importing
      `eslint-config-next@16.2.9`'s `core-web-vitals`/`typescript` exports directly (this version
      ships native flat configs — no `FlatCompat` needed). 2 pre-existing warnings surfaced (not
      errors, left as-is): an `<img>` in `Logo.tsx` and an unused `_request` param in `proxy.ts`.

### Manual step — needs you to check (no CLI/API access to this Vercel setting in this session)
- [ ] **Vercel dashboard → `portfolio-website` project → Settings → Git → confirm "Production
      Branch" = `main`.** This determines whether `develop`/`feature/*` pushes only ever get preview
      deployments (correct) vs. accidentally also deploying to production. Couldn't verify via
      `vercel project inspect`/`vercel project ls` — that setting isn't exposed by the CLI subset
      available here.
- [ ] Related to the still-broken Vercel auto-deploy item above: once that's fixed, re-verify that a
      push to `develop` produces a **preview** deployment (not production) — can check via
      `gh api repos/leqtrungit/portfolio/deployments` or the Vercel dashboard's deployments list.

---

## Domain migration: lequoctrung.id.vn → lequoctrung.vn

**Goal:** Replace the old bilingual (`/en`, `/vi`) portfolio currently live at
`lequoctrung.id.vn` with the redesigned single-page, English-only site in this repo, served from
`lequoctrung.vn`. Old domain becomes a 301 redirect to the new one. `blog.lequoctrung.id.vn`
(separate subdomain) is untouched throughout.

**Decisions made (2026-06-23):**
- Canonical domain going forward: `lequoctrung.vn` (already set as `profile.basics.url`).
- Drop the Vietnamese `/vi` locale — new site is English-only by design. Old `/en`, `/vi` URLs
  must 301 (not 404) to the new homepage to preserve indexing signals.
- `blog.lequoctrung.id.vn` stays exactly as is — not part of the apex redirect.

**Status:** Infra cutover done (2026-06-24) — `lequoctrung.vn` is live on Vercel, `lequoctrung.id.vn`
redirects to it, GSC property + sitemap submitted for the new domain. Repo also renamed
`new-portfolio` → `portfolio` on GitHub as part of this session; old unrelated fork repo (same
`portfolio` name, "Print-friendly CV page") was archived and deleted to free the name. Remaining
work is the GSC Change of Address handoff + monitoring, plus the SEO follow-ups below.

### Steps

- [x] Add host-based redirect in `apps/website/next.config.mjs`: any request with
      `Host: lequoctrung.id.vn` → `https://lequoctrung.vn/` (collapse all paths to root, since
      the new site has no `/en`/`/vi` equivalents — path-preserving would 404).
- [x] Attach `lequoctrung.vn` to the Vercel project (`portfolio-website`); removed the
      Cloudflare-level redirect that used to send `.vn` → `.id.vn`. DNS: A record `76.76.21.21`,
      proxy off (DNS only) — required since Vercel issues/manages its own cert.
- [x] Attach `lequoctrung.id.vn` to the same Vercel project (CNAME → Vercel, DNS only) so the
      redirect above takes effect for it.
- [x] Set Vercel project **Root Directory** to `apps/website` (was `.`, left over from the old
      fork's flat repo layout — monorepo builds failed until this was corrected).
- [x] Verify `blog.lequoctrung.id.vn` is unaffected (it's a separate subdomain/host, not the apex) —
      confirmed 200, untouched.
- [x] Verify with curl:
  - `curl -I https://lequoctrung.vn/` → 200, new site ✓
  - `curl -I https://lequoctrung.id.vn/` → 308 → `lequoctrung.vn/` ✓
  - `curl -I https://blog.lequoctrung.id.vn/` → 200, unchanged ✓
  - (Note: local/home-network DNS resolvers can lag a few minutes on cache after DNS edits —
    if a domain looks unreachable right after a Cloudflare change, retest with
    `curl --resolve <host>:443:<ip> https://<host>` or from a different network before assuming
    it's broken.)
- [x] Add `lequoctrung.vn` as a **Domain property** in Google Search Console (DNS TXT verification
      via Cloudflare) and submit `https://lequoctrung.vn/sitemap.xml`.
- [ ] Once redirects have been live and crawled for a few days, run GSC **Change of Address**
      tool from the `lequoctrung.id.vn` property → `lequoctrung.vn` property.
- [ ] Monitor old property's Coverage/Pages report — `/en`, `/vi` URLs should show as "Page with
      redirect", not errors. Keep both GSC properties active for 3–6 months; don't unverify the
      old one.
- [ ] Fix Vercel auto-deploy on push (broke as a side effect of the GitHub repo rename/recreate in
      this session) — **still broken as of 2026-06-25, re-verified**: granted the Vercel GitHub App
      access to `leqtrungit/portfolio` at `github.com/settings/installations` (`vercel git connect`
      reports "already connected"), but multiple real pushes to both `main` and `develop` since then
      still show **zero auto-triggered deployments** — every deployment in `list_deployments` is still
      `actor: claude-code_*_agent` (manually triggered via CLI/MCP), none from a GitHub webhook. The
      permission grant did not fix it. Next step: likely need `vercel git disconnect` +
      `vercel git connect` to force a clean re-link (disconnect is a destructive-ish action — confirm
      with user before running), or check the Vercel dashboard's Git integration status directly for
      an error state the CLI doesn't surface.

### Open SEO follow-ups from the audit (not blocking the migration, but related)

- [x] OG/Twitter image is portrait (750×1000) — fixed 2026-06-24: replaced the hardcoded
      `portrait.png` reference with `app/opengraph-image.tsx` (Next.js file-convention, rendered via
      `next/og`/`ImageResponse` at build time, 1200×630). It's a custom branded card (the "LT" mark,
      name, label, a truncated tagline, domain) — not a crop of the portrait photo, per request.
      Twitter falls back to the same image automatically (no `twitter.images` needed).
- [x] Meta description (`profile.basics.summary`, 175 chars) is over the ~160 char SERP-safe limit —
      fixed 2026-06-24: added `lib/seo.ts#truncateForMeta` (word-boundary clip + `…`) and used it for
      `description`/`openGraph.description`/`twitter.description` in `layout.tsx`. Deliberately did
      *not* edit `profile.basics.summary` itself — that field is also the literal hero paragraph
      copy on the page, and trimming it would have changed visible content, not just metadata.
- [x] Person JSON-LD (`apps/website/app/layout.tsx`) missing `worksFor`; `image` field silently
      drops if `basics.url` is unset — fixed 2026-06-24: `url`/`image` now build from `siteUrl`
      (which already has the `https://lequoctrung.vn` fallback) instead of raw `basics.url`, and
      `worksFor` is derived from the work entry with no `endDate` (falls back to `work[0]`).
- [x] `SectionLabel.tsx` bakes the decorative "→ " glyph into the `<h2>` text content
      (`→ EXPERIENCE`) — fixed 2026-06-24: moved to an `aria-hidden` sibling span.
- [x] Favicon link tag won't appear on live HTML until `app/icon.svg` (added 2026-06-24, see Logo
      work below) is deployed — confirmed 2026-06-25: `curl -I https://lequoctrung.vn/icon.svg` →
      200, `image/svg+xml`. Live.

### PageSpeed Insights audit (2026-06-24, Lighthouse 13.4.0 — mobile + desktop)

Scores at audit time: Performance 96 mobile / 100 desktop, Accessibility 96/96, Best Practices
100/100, SEO 100/100. P1 fixed same day (below); P2/P3 deferred, not re-run against live yet.

**P1 — performance & contrast (done 2026-06-24):**
- [x] Desktop LCP (2.7s) is the portrait image (1,290ms resource load) — `Portrait.tsx` already had
      `priority`, but the rendered `<img>`/preload `<link>` had no `fetchpriority="high"` attribute
      (Next.js wasn't emitting it for this `fill` + `priority` combo) — added explicit
      `fetchPriority="high"` prop; confirmed present on both tags in a prod build.
- [x] Mobile serves `portrait.png` at `w=1920` for a 298×397px slot (79 KiB wasted) — the `fill`
      image had no `sizes`, so Next defaulted to `100vw`. Added
      `sizes="(max-width: 760px) calc(100vw - 40px), 300px"` matching the actual hero-portrait slot
      (300px fixed column on desktop, full-width-minus-padding on mobile) — confirmed prod build now
      emits a much smaller initial `w` in the srcset for that slot.
- [x] Render-blocking CSS chunk (2.4 KiB, ~100ms) — was the `globals.css` import. Switched
      `app/layout.tsx` from `import "./globals.css"` to reading the file at build time
      (`readFileSync`) and rendering it as an inline `<style>` in the body (React 19 hoists it to
      `<head>`), so it ships with the initial HTML instead of a separate request. The one remaining
      render-blocking stylesheet in a prod build is Next's own `next/font` `@font-face` chunk
      (~600B, already has `font-display:swap` baked in) — not worth fighting, it's how
      `next/font` self-hosts fonts.
- [x] Contrast failures (WCAG AA) on muted/secondary text — root causes were two different bugs,
      fixed by retargeting tokens rather than inventing new colors:
  - `tokens.colors.textFainter` (#8a8474 on #f6f3ec, ratio ~3.4:1) was used for WorkSection
    dates/locations and EducationCertificatesSection issuer/dates — switched both to
    `tokens.colors.textFaint` (#6b6657, ratio ~5.2:1, already AA-compliant) and removed the
    now-unused `textFainter` token from `lib/tokens.ts`.
  - `tokens.accent` (#cf4326 on #f6f3ec, ratio ~4.2:1 — fails AA's 4.5:1 for text this small) was
    used for the "SOLUTION ENGINEER" eyebrow (`HeroSection.tsx`) and the `→ SECTION` headers
    (`SectionLabel.tsx`). Added `tokens.colors.accentMuted` (#c23d22, ratio ~4.8:1) for small accent
    text on the light bg; `tokens.accent` is unchanged everywhere else (CTAs, underlines, shadows,
    large headings already clear the 3:1 large-text threshold) so the brand color itself wasn't
    touched.
  - `ContactSection.tsx` footer row (copyright/languages/phone) used `tokens.colors.textFaint`
    (a *light-bg* token) on the *dark* footer background (ratio ~3.2:1) — should have used
    `tokens.colors.onDarkMuted` (#8a8474 on #17150f, ratio ~4.9:1), the token actually designed for
    muted text on dark backgrounds. Swapped it.
  - Verified all four via manual WCAG contrast-ratio math (not yet re-run through Lighthouse).

**P2 — bundle/font cleanup (investigated 2026-06-24, mostly not actionable):**
- [x] Legacy polyfills in a vendor chunk (~14 KiB: `Array.prototype.at/.flat/.flatMap`,
      `Object.fromEntries/.hasOwn`, `String.prototype.trimEnd/.trimStart`) — added a `browserslist`
      field (`apps/website/package.json`: `"defaults and supports es6-module"`) since that's the
      standard fix. **Confirmed it has zero effect**: rebuilt before/after, the chunk
      (`2xlxus0j1mvbl.js`) was byte-identical, still contains the same polyfill code verbatim. This
      is Next.js's own bundled `@next/polyfill-module` compat shim, which this Turbopack-based build
      doesn't appear to gate on project browserslist. Left the config in (harmless, may help other
      tooling) but this specific finding isn't fixable through supported Next.js config right now —
      would need to wait on a Next/Turbopack fix, not worth an unsupported hack.
- [x] ~58 KiB unused JS across two chunks — there are zero `"use client"` components anywhere in
      `apps/website` (`grep -rl '"use client"'` is empty), so there's nothing to code-split; these
      chunks are Next.js/React's own hydration + router runtime, shipped unconditionally by the App
      Router regardless of page interactivity. Not actionable without dropping App Router features
      this site still needs (client-side nav). No change.
- [x] No explicit `font-display: swap` on custom fonts — checked the prod font CSS chunk directly,
      `next/font` already emits `font-display:swap` on every `@font-face` rule. Audit finding was a
      false positive; no action needed.

**P3 — security headers (done 2026-06-24):**
- [x] Added `apps/website/proxy.ts` (Next.js 16 renamed the `middleware.ts` convention to
      `proxy.ts` — `export function proxy()`, not `middleware()`) setting `Content-Security-Policy`,
      `Cross-Origin-Opener-Policy: same-origin`, `X-Frame-Options: DENY`,
      `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and
      `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
  - **First attempt used a nonce + `'strict-dynamic'` CSP** (Next's documented pattern, where the
    framework is supposed to auto-nonce its own inline/RSC bootstrap scripts) — verified against a
    real prod build in an actual browser (not just curl) and it **broke the entire page**: every JS
    chunk and inline script blocked, confirmed via Playwright console capture. This Next.js/Turbopack
    version doesn't propagate the nonce to its own injected scripts the way the docs describe.
    Reverted before this ever got near a deploy.
  - **Shipped instead:** `script-src 'self' 'unsafe-inline'` (`'unsafe-eval'` added only when
    `NODE_ENV !== "production"`, for Fast Refresh) and `style-src 'self' 'unsafe-inline'` (the site
    renders all styling via inline `style={{...}}` props — no per-element nonce mechanism exists for
    the `style` attribute, only for `<style>`/`<script>` elements). `upgrade-insecure-requests` is
    prod-only (would break `next dev` on http://localhost otherwise).
  - **Skipped `Trusted-Types`:** the page uses `dangerouslySetInnerHTML` twice (inlined
    `globals.css`, the Person JSON-LD script) — enabling `require-trusted-types-for 'script'` without
    a custom Trusted Types policy would block both. Given this site has no forms, no user input, and
    no dynamic/untrusted content (so the realistic stored/reflected-XSS surface is ~none), the
    cost/risk of building a custom TT policy didn't seem worth it for the security gain. Revisit if
    that changes.
  - Verified clean (zero console errors, zero failed requests) via Playwright against both a
    production build (`pnpm start`) and `pnpm dev`, including a client-side nav click.
