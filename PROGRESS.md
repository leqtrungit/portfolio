# PROGRESS.md

Tracks longer-running, cross-session tasks for this repo. Check this file at the start of a new
session before asking the user what's going on — it has the current state and next steps.

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
- [ ] Favicon link tag won't appear on live HTML until `app/icon.svg` (added 2026-06-24, see Logo
      work below) is deployed — not a bug, just unpushed at audit time.

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

**P2 — bundle/font cleanup (deferred):**
- [ ] Legacy polyfills in a vendor chunk (~14 KiB: `Array.prototype.at/.flat/.flatMap`,
      `Object.fromEntries/.hasOwn`, `String.prototype.trimEnd/.trimStart`) — check
      browserslist/SWC target, these are Baseline-supported and shouldn't be transpiled.
- [ ] ~58 KiB unused JS across two chunks — candidate for code-splitting/lazy-loading
      below-the-fold sections.
- [x] No explicit `font-display: swap` on custom fonts — checked the prod font CSS chunk directly,
      `next/font` already emits `font-display:swap` on every `@font-face` rule. Audit finding was a
      false positive; no action needed.

**P3 — security headers (deferred, needs careful rollout since CSP misconfig can break the
site's own fonts/scripts):**
- [ ] Add `Content-Security-Policy`, `Cross-Origin-Opener-Policy: same-origin`,
      `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`), `Trusted-Types` directive, and
      extend HSTS to `includeSubDomains; preload` — via `headers()` in `next.config.mjs`. Test in
      a preview deploy before promoting to production; a bad CSP can silently break the page.
