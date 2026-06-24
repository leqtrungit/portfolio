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

- [ ] OG/Twitter image is portrait (750×1000) — replace with a proper 1200×630 landscape image.
- [ ] Meta description (`profile.basics.summary`, 170 chars) is over the ~160 char SERP-safe limit.
- [ ] Person JSON-LD (`apps/website/app/layout.tsx`) missing `worksFor`; `image` field silently
      drops if `basics.url` is unset.
