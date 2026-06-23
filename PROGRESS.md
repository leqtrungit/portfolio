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

**Status:** Planning done, no code or infra changes made yet.

### Steps

- [x] Add host-based redirect in `apps/website/next.config.mjs`: any request with
      `Host: lequoctrung.id.vn` → `https://lequoctrung.vn/` (collapse all paths to root, since
      the new site has no `/en`/`/vi` equivalents — path-preserving would 404).
- [ ] Attach `lequoctrung.vn` to the Vercel project for `apps/website` (this repo); remove the
      Cloudflare-level redirect currently sending `.vn` → `.id.vn`.
- [ ] Attach `lequoctrung.id.vn` to the same Vercel project so the redirect above takes effect for it.
- [ ] Verify `blog.lequoctrung.id.vn` is unaffected (it's a separate subdomain/host, not the apex).
- [ ] Verify with curl:
  - `curl -I https://lequoctrung.vn/` → 200, new site
  - `curl -I https://lequoctrung.id.vn/` → 301 → `lequoctrung.vn/`
  - `curl -I https://lequoctrung.id.vn/en` → 301 → `lequoctrung.vn/`
  - `curl -I https://blog.lequoctrung.id.vn/` → 200, unchanged
- [ ] Verify/add `lequoctrung.vn` as a property in Google Search Console.
- [ ] Submit `https://lequoctrung.vn/sitemap.xml` in the new GSC property.
- [ ] Once redirects have been live and crawled for a few days, run GSC **Change of Address**
      tool from `lequoctrung.id.vn` property → `lequoctrung.vn` property.
- [ ] Monitor old property's Coverage report — `/en`, `/vi` URLs should show as "Page with
      redirect", not errors.

### Open SEO follow-ups from the audit (not blocking the migration, but related)

- [ ] OG/Twitter image is portrait (750×1000) — replace with a proper 1200×630 landscape image.
- [ ] Meta description (`profile.basics.summary`, 170 chars) is over the ~160 char SERP-safe limit.
- [ ] Person JSON-LD (`apps/website/app/layout.tsx`) missing `worksFor`; `image` field silently
      drops if `basics.url` is unset.
