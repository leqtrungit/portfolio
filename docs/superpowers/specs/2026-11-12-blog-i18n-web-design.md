# Blog i18n on the personal website

**Date:** 2026-11-12
**Status:** draft, pending owner review
**Site:** `lequoctrung.vn` (`portfolio/apps/website`)
**Engine:** `blog-api.lequoctrung.id.vn` (site `personal`)

## Intent

The personal site chrome is already bilingual (`/` English, `/vi` Vietnamese). The blog engine already stores per-locale translations. The website still fetches posts without `?locale=`, hardcodes `lang="vi"` on post bodies, and shares one slug URL for both chrome locales. Kick off real bilingual blog on the web: the page locale drives the API, translated slugs get their own URLs, and a missing translation still renders instead of 404ing the article.

This is the work deferred in `blog-api/docs/superpowers/specs/2026-11-02-multitenant-design.md` §16.1.

## Why now

Engine support is done. Harnix landing already speaks `?locale=` + `translations[]`. The personal site is the remaining consumer.

## Goals

- Every public blog fetch from the website sends `?locale=` matching the page locale.
- A published translation is reachable at `localePath(locale, /blog/{that-locale-slug})`.
- Language switcher on an article goes to the other locale's slug when a translation exists.
- A post with only one published locale still opens under both chrome locales (current behavior), with `lang` set to the served locale.
- Sitemap / metadata grow hreflang only when both locales are published.
- Enabling `i18n` on site `personal` does not require a same-day frontend deploy to stay up: a `400 locale not allowed` falls back to the site default.

## Non-goals

- Translating existing post bodies. That is authoring in the CMS after the flag is on.
- Changing chrome i18n, `profile.json` / `profile.vi.json`, or URL policy for non-blog pages.
- Harnix `landing-page` (`harnix.vn`). It already has VI at `/` and EN at `/en` and already calls the CMS with `locale`.
- Public `GET /api/v1/site` locale discovery, CORS on post routes, or a Vietnamese PDF CV.
- Cookies, `Accept-Language`, or any locale memory. Locale stays in the URL.
- A second RSS feed. `/feed.xml` stays the primary (English-preferring) feed.

## Anti-goals

- English `/blog/{vi-slug}` 404s after `locale=en` is turned on.
- Homepage / `/blog` going blank because the personal site has not enabled `i18n` yet.
- Language switcher sending `/vi/blog/{en-slug}` when the Vietnamese slug is different.
- hreflang pairs that point two locales at the same untranslated body.

## Constraints

- Locales stay `en` | `vi`. Default chrome locale is `en`. Site default in the engine is `vi`.
- No new runtime i18n library.
- Server-side fetch only (RSC + the existing `loadMorePosts` server action). Do not introduce a browser call to `blog-api`.
- Slugs are unique per `(site, locale)`. The same post may use different slugs in `vi` and `en`.
- List fallback is the engine's: `GET /posts?locale=en` may return a `vi` item. Always trust `item.locale`.
- Detail has no engine fallback: `GET /posts/{slug}?locale=X` 404s when that translation is missing. The website does the fallback.
- Follow `docs/CONVENTIONS.md`. Branch off `develop` as `feature/blog-i18n-web`. Never commit to `main`/`develop`.

## URL and SEO

| Post state | English URL | Vietnamese URL | Canonical | hreflang |
| --- | --- | --- | --- | --- |
| VI only (today) | `/blog/{vi-slug}` | `/vi/blog/{vi-slug}` | `/blog/{vi-slug}` | none |
| EN + VI published | `/blog/{en-slug}` | `/vi/blog/{vi-slug}` | self | `en` + `vi` + `x-default` → EN |
| Wrong slug for the page locale, translation exists | 308 to the correct locale URL | same | — | — |

`x-default` is the English URL when both exist. Matches chrome pages.

## Fetch contract

All helpers live in `apps/website/lib/blog.ts`.

- `fetchPosts({ locale, ... })` → `GET /posts?locale=`
- `fetchPost(slug, locale)` → `GET /posts/{slug}?locale=`
- `fetchRelatedPosts` / `fetchAdjacentPosts` / `fetchAllPosts` take `locale` the same way
- On HTTP 400 (locale not allowed), retry once with `locale=vi` (engine default)
- `resolvePost(slug, pageLocale)`:
  1. `fetchPost(slug, pageLocale)`
  2. If null, `fetchPost(slug, otherLocale)`
  3. If the served post has a published translation for `pageLocale` whose slug ≠ requested slug → caller 308s to that URL
  4. Otherwise return the post; caller renders with `lang={post.locale}`

`translationSlug(post, locale)` reads `post.translations`. Switcher hrefs:

- other locale has a slug → `localePath(other, /blog/{slug})`
- otherwise → same slug under the other chrome locale (VI-only fallback)

## Surfaces

Pass `locale` and honor `post.locale` on: homepage `LatestBlogSection`, `/[lang]/blog`, `/[lang]/blog/[slug]`, `PostListWithLoadMore` / `loadMorePosts`, `RelatedPosts`, `PostNav`, `PostRow`, OG image, `sitemap.ts`, `feed.xml`, `llms.txt`, `llms-full.txt`.

`LanguageSwitcher` accepts optional per-locale hrefs so an article can point at a different slug. Home and blog index keep deriving the other URL from the pathname.

## Ops (owner)

In Engine → Sites → `personal`: set `locales` to `vi, en`, default `vi`, turn `features.i18n` on. After that, `GET https://blog-api.lequoctrung.id.vn/api/v1/posts?locale=en` is 200. Then publish English translations in the admin locale tabs.

## Left to the builder

- Exact mock style in `lib/blog.test.ts` (existing file uses `node:test` + `tsx`).
- Whether `resolvePost` returns a `redirectTo` field or the page does the comparison.
- Whether feed items that fell back to `vi` keep `/blog/{slug}` (yes, unless a reason appears).
