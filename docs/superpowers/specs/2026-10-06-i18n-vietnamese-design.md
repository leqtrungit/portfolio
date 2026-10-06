# Vietnamese (i18n) for the portfolio website — design

**Date:** 2026-10-06
**Status:** approved in conversation, pending written-spec review
**Scope:** `apps/website` + `profile.vi.json` + `packages/profile-schema` parity check

## Goal

Every part of `lequoctrung.vn` can be read fully in Vietnamese, with no mixed EN/VI pages. Target
audience is general (no specific persona). English stays the primary language at the existing URLs;
Vietnamese lives under `/vi`.

### In scope
- Homepage, `/privacy`, Nav, blog chrome (header, footer, list, post page UI, related/prev-next,
  share bar, TOC labels), metadata/OG/JSON-LD, language switcher.
- Profile content (`profile.json`) in Vietnamese via `profile.vi.json`.
- Blog chrome in **both** languages (it is currently hardcoded Vietnamese, e.g. "BÀI LIÊN QUAN" —
  this gets an English version).

### Out of scope
- Blog post **content** translation (posts stay Vietnamese in both locales for now).
- CV / PDF (`apps/cv-renderer`).
- Auto-detecting language from `Accept-Language`, or remembering the choice in a cookie.

## 1. Routing & structure

All pages move under a `[lang]` segment; non-localized route handlers stay at the root:

```
apps/website/app/
├── [lang]/
│   ├── layout.tsx              # former root layout: <html lang={lang}>, generateMetadata per locale
│   ├── page.tsx                # homepage
│   ├── opengraph-image.tsx
│   ├── privacy/page.tsx
│   └── blog/
│       ├── layout.tsx
│       ├── page.tsx
│       └── [slug]/ (page.tsx, opengraph-image.tsx)
├── sitemap.ts, robots.ts, feed.xml/, llms.txt/, llms-full.txt/, actions/   # unchanged, root-level
```

- `[lang]/layout.tsx` exports `generateStaticParams` → `[{ lang: "en" }, { lang: "vi" }]` and
  `dynamicParams = false`, so `/fr/...` 404s. Pages stay statically generated; existing `revalidate`
  values are kept.
- `[lang]/blog/[slug]/page.tsx` `generateStaticParams` returns the cross product of locales × slugs.

### `proxy.ts`
Keeps all current CSP/security headers on every response. Adds locale handling before them:

| Request path | Action |
|---|---|
| `/vi` or `/vi/…` | pass through |
| `/en` or `/en/…` | 301 → same path without the `/en` prefix (one URL per English page) |
| anything else localized | internal rewrite → `/en/…` (URL unchanged for the visitor) |

Excluded from locale handling (no rewrite): `sitemap.xml`, `robots.txt`, `feed.xml`, `llms.txt`,
`llms-full.txt`, `/media/*` (rewritten to the media origin in `next.config.mjs`), `/_next/*`,
`favicon.ico`, and static files from `public/` (`logo.svg`, `portrait.png`, any path with a file
extension). Server actions under `app/actions/` are invoked via POST to the page URL and are unaffected.

### Language switcher
- `components/ui/LanguageSwitcher.tsx` — `"use client"` leaf (allowed by `docs/CONVENTIONS.md`),
  uses `usePathname()` to compute the same page in the other locale (`/blog/abc` ↔ `/vi/blog/abc`).
- Rendered in `Nav` (homepage) and `BlogHeader`. Shows `EN / VI` with the active one marked.

## 2. Data & UI strings

### `lib/i18n/config.ts`
- `locales = ["en", "vi"] as const`, `type Locale`, `defaultLocale = "en"`, `isLocale(value)`.
- `localePath(locale, path)` → `"/blog"` for `en`, `"/vi/blog"` for `vi`. **Every** internal link
  (Nav, PostCard, PostNav, RelatedPosts, BlogHeader/Footer, privacy link, etc.) goes through it.

### Dictionaries — `lib/i18n/dictionaries/{en,vi}.ts`
- `en.ts` is the source; `type Dictionary` is derived from it with string literals widened to
  `string`. `vi.ts` is typed `Dictionary`, so a missing/extra key fails `typecheck` (and CI).
- Holds every hardcoded string: section labels, Nav, hero headline, TransformationsSection,
  Contact, `/privacy` body, blog chrome, metadata strings, alt text.
- Rich copy with inline styling (e.g. the hero headline's accent/underline spans) is stored as named
  parts (`{ lead, accent, middle, underline }`) — no HTML in strings, no `dangerouslySetInnerHTML`.
- `getDictionary(locale)` is synchronous (two small static imports). Routes call it and pass the
  relevant slice to sections as props; `components/ui/*` stay props-only.

### Profile content — `profile.vi.json` (repo root)
- Same `profileSchema`. `getProfile(locale)` in `apps/website/lib/profile.ts` picks the file.
  `profile.json` stays the source of truth for English and for the CV renderer.
- **Parity check** `packages/profile-schema/src/parity.ts`, run by the existing `validate` script
  (already in CI). Fails when the two files differ in:
  - object keys, or array lengths (at any depth);
  - values of non-translatable keys: `startDate`, `endDate`, `date`, `releaseDate`, `url`, `email`,
    `phone`, `countryCode`, `username`, `network`, `image`, `tags`.
  - `_note` keys are ignored. All other string values may differ.
- Error output names the JSON path of each mismatch (e.g. `work[2].startDate`).

### Dates — `formatDate(date, locale)` / `formatPeriod(start, end, locale)`
| | en | vi |
|---|---|---|
| month + year | `Jan 2025` | `01/2025` |
| year only | `2025` | `2025` |
| ongoing | `Present` | `Hiện tại` |

Blog dates follow the page locale as well.

## 3. SEO & metadata

- `generateMetadata` per locale: title/description from that locale's profile/dictionary;
  `openGraph.locale` = `en_US` / `vi_VN` with `alternateLocale` set to the other one.
- JSON-LD (`Person`, `WebSite`, `Blog`) built per locale, with `inLanguage`.

| Page | canonical | hreflang (`alternates.languages`) |
|---|---|---|
| `/`, `/privacy`, `/blog` (list) and their `/vi` versions | self | `en` → `/…`, `vi` → `/vi/…`, `x-default` → `/…` |
| `/blog/<slug>`, `/vi/blog/<slug>` | both → `/blog/<slug>` | none |

Blog posts get no hreflang because a canonical pointing elsewhere plus hreflang is a conflicting
signal. When posts get real translations, drop the shared canonical and add hreflang.
Post bodies keep `lang="vi"` on their content wrapper in both locales.

- **Sitemap:** add `/vi`, `/vi/blog`, `/vi/privacy` (and `/privacy` if missing), each with
  `alternates.languages`. Posts remain listed only as `/blog/<slug>`.
- **OG images:** homepage OG image moves to `[lang]/opengraph-image.tsx` and renders the localized
  label. Post OG image design is unchanged and identical across locales.
- **Unchanged:** `feed.xml` (posts are Vietnamese), `robots.ts`, `llms-full.txt`. `llms.txt` gets one
  added line pointing to the Vietnamese version at `/vi`.

## 4. Verification

No test framework is added. Verification:

1. **CI-enforced:** `typecheck` (dictionary key parity), `validate` (profile schema + parity). Prove the
   parity check works by deliberately breaking a field locally and seeing `validate` fail.
2. **Production build + `curl`** (`next build && next start`):
   - `/` and `/vi` → 200 with correct `<html lang>`.
   - `/en/blog` → 301 `/blog`; `/fr` → 404.
   - canonical/hreflang tags match the table above; `/vi/blog/<slug>` canonical is `/blog/<slug>`.
   - `sitemap.xml`, `feed.xml`, `/media/*`, `/portrait.png` are not rewritten.
   - CSP header present on localized pages.
3. **Playwright:** screenshots of EN and VI at desktop and mobile widths (Vietnamese copy is longer —
   check hero headline and Nav don't break); click the language switcher on several pages; scan
   `/vi` pages for leftover English UI copy.

## Translation

Claude drafts the first Vietnamese version of `vi.ts` and `profile.vi.json` (professional tone,
first person "tôi", general audience). The user reviews and edits in the PR before merge.

## Delivery

Two PRs into `develop`:
1. `feature/i18n-profile-vi` — `profile.vi.json` + parity check (content-only, focused translation review).
2. `feature/i18n-routing` — `[lang]` routing, proxy, dictionaries, section/component updates,
   switcher, SEO. Depends on PR 1.

Release PR `develop` → `main` (merge commit, not rebase) only after both are merged, so production
never shows a half-translated site.
