# Self-built blog: Go API + Postgres backend, blog routes + admin UI in apps/website

> Status: **planned, not started.** This is a design doc for a large upcoming feature — see
> `PROGRESS.md` for the one-line tracking entry. Nothing in this plan has been implemented yet.

## Context

The site currently links out to an external Ghost blog (`blog.lequoctrung.id.vn`) — referenced only
as a URL in `profile.json`'s `basics.profiles`, with zero code integration. The goal is to stop
depending on Ghost and own the whole stack: a real backend with its own database (hosting TBD,
expected to be Docker-based), with `apps/website` staying focused on rendering/SEO and centralizing
all traffic on `lequoctrung.vn` (blog lives at `/blog`, not a subdomain). Ghost data migration is
explicitly deferred to a later round — this plan only needs to keep the data model migration-friendly,
not build an importer.

Key decisions already made:
- **Backend**: Go + PostgreSQL, self-hosted later via Docker (host undecided).
- **URL**: `lequoctrung.vn/blog` inside the existing `apps/website` Next.js app — not a separate
  subdomain/app.
- **Admin UI**: lives inside `apps/website` (the "frontend only renders" constraint was explicitly
  waived for this) — see rationale in §5.
- **Admin auth**: single self-rolled admin (password + JWT), no third-party auth provider.

This is a large feature. Per the branching workflow already in place (`feature/*` off `develop`, PR
back into `develop`, CI-gated, squash merge — see `CLAUDE.md` `## Workflow`), it should ship as 4
sequential, independently-mergeable PRs (§7), not one giant PR.

## 1. Repo placement

New top-level `services/blog-api/` (sibling to `apps/`, `packages/`), **not** under `apps/`.
`pnpm-workspace.yaml` globs `apps/*`/`packages/*` as pnpm package roots (every entry has a
`package.json`); a Go module has none and isn't part of that graph. A new top-level `services/`
directory cleanly signals "non-Node, independently built/deployed" with zero risk of pnpm trying to
treat it as a workspace package. `CLAUDE.md`'s architecture section should get a short addition
noting `services/blog-api` as a sibling Go service, outside the pnpm graph, once this lands.

Module layout (idiomatic, sized for a solo blog, not over-engineered):
```
services/blog-api/
├── go.mod / go.sum
├── Dockerfile                  # multi-stage, CGO_ENABLED=0, alpine runtime
├── docker-compose.yml          # local dev only: api + postgres
├── .env.example
├── cmd/api/main.go             # wires config, db pool, router, http.Server
├── internal/
│   ├── config/config.go        # env vars: DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD_HASH, PORT
│   ├── db/db.go                # pgx pool
│   ├── posts/                  # model.go, repository.go, handlers.go
│   └── auth/                   # handlers.go (login), jwt.go, middleware.go (RequireAuth)
├── migrations/0001_init.sql
└── docs/api.md
```

## 2. Database schema (Postgres)

```sql
CREATE TABLE posts (
    id              BIGSERIAL PRIMARY KEY,
    slug            TEXT NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    excerpt         TEXT NOT NULL DEFAULT '',
    content_md      TEXT NOT NULL,            -- plain Markdown, not a Go-specific format
    cover_image_url TEXT,                      -- nullable, external URL only for v1 (see §8)
    status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
    published_at    TIMESTAMPTZ,               -- null while draft; set on publish
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_status_published_at ON posts (status, published_at DESC);

CREATE TABLE tags (
    id   BIGSERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);
CREATE TABLE post_tags (
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id  BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);
```

Join table (not a `text[]` column) for tags — buys a real "list tags" query and stable tag renames
for one extra repository method; the idiomatic relational default. No `users` table — single admin
credential lives in env (`ADMIN_PASSWORD_HASH`), not the DB.

**Migration-friendliness (not built now)**: `content_md` is plain Markdown (Ghost's mobiledoc/lexical
export converts to Markdown via existing tooling), `slug` is the natural upsert key Ghost also uses,
`published_at` mirrors Ghost's own field semantics.

Migration tool: `golang-migrate/migrate` — plain `.sql` files, no DSL, no heavier ORM needed at this
size.

## 3. Go backend API surface

Libraries (small, justified, no framework/ORM overkill for a solo-blog-sized service):
- Router: `go-chi/chi/v5` (stdlib-`net/http`-compatible, minimal).
- Postgres: `jackc/pgx/v5` + `pgxpool`, hand-written SQL (no ORM — schema's too small to justify one).
- Migrations: `golang-migrate/migrate`.
- JWT: `golang-jwt/jwt/v5`. Password hashing: stdlib `golang.org/x/crypto/bcrypt`.
- Config: plain `os.Getenv` into a struct — no config library for ~5 vars.

Endpoints:

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/posts` | none | published only; `?page=`, `?limit=`, `?tag=<slug>` |
| GET | `/posts/{slug}` | none | 404 if missing or not published |
| GET | `/tags` | none | |
| GET | `/healthz` | none | liveness, used by compose healthcheck |
| POST | `/admin/login` | none | body `{password}` → JWT |
| GET | `/admin/posts` | JWT | all posts incl. drafts, paginated |
| POST | `/admin/posts` | JWT | create (slug auto-derived from title if omitted) |
| GET | `/admin/posts/{id}` | JWT | fetch by id for editing |
| PUT | `/admin/posts/{id}` | JWT | update (incl. `status` — no separate publish endpoint) |
| DELETE | `/admin/posts/{id}` | JWT | |

## 4. Containerization

Multi-stage `Dockerfile` (golang:1.23-alpine build → alpine:3.20 runtime, static binary, migrations
copied in for deploy-time `migrate up`). `docker-compose.yml` for local dev: `postgres:16-alpine` +
the `api` service, healthcheck-gated `depends_on`. Production hosting is out of scope (§8) — this
only has to prove the container + local compose loop end-to-end.

## 5. Frontend additions to `apps/website`

**API client** — `lib/blogApi.ts`: typed `listPosts()`, `getPostBySlug()`, `listTags()` reading
`BLOG_API_URL` (server-only env, never `NEXT_PUBLIC_`). Every function catches fetch errors and
returns `null`/empty rather than throwing — this is the graceful-degradation mechanism for a
self-hosted backend with uncertain uptime.

**Public routes**:
- `app/blog/page.tsx` → `components/sections/BlogListSection.tsx` (smart, calls
  `listPosts()`/`listTags()`) → `components/ui/PostCard.tsx` (dumb).
- `app/blog/[slug]/page.tsx` → `components/sections/PostSection.tsx`, `notFound()` on null. Renders
  Markdown via `components/ui/MarkdownContent.tsx`.
- Both routes use `export const revalidate = 60` (ISR), not `force-dynamic`/`force-static`: if the
  backend is down, Next keeps serving the last-good cached page instead of blocking every request on
  a possibly-dead home server, and `blogApi.ts`'s error-catching means even an uncached first hit
  renders an "unavailable" state instead of a 500. `app/page.tsx` (homepage) is untouched — it never
  imports `blogApi.ts`, so backend health can't affect it.

**Markdown rendering** (no MDX, 3 small packages, consistent with this repo's "hand-rolled over heavy
deps" style — see `lib/formatDate.ts`):
- `react-markdown` (Markdown → React, no compile step) + `remark-gfm` (tables/strikethrough) +
  `rehype-highlight` (code blocks). Wired up once in `MarkdownContent.tsx`; code-block colors sourced
  from `lib/tokens.ts` via a small `globals.css` addition (consistent with the existing inlined-CSS
  pattern in `app/layout.tsx`).

**SEO**:
- `app/sitemap.ts` (currently hardcoded to just `/`) — extend to append one entry per published post
  from `listPosts()`; fall back to just `/` if the backend call fails.
- Per-post `generateMetadata()` following the `truncateForMeta` pattern already used in
  `app/layout.tsx`.
- Per-post `BlogPosting` JSON-LD, stylistically identical to the existing `personJsonLd` block in
  `app/layout.tsx`, with `author` pointing at the existing `Person` data from `getProfile()`.

**Admin UI — inside `apps/website`, under `/admin`, calling the Go API only via Next.js Route
Handlers (never directly from the browser):**

Why here and not a Go-rendered admin or a separate app: this monorepo already has a full React/Next
UI toolchain, `lib/tokens.ts`, and component conventions; building a second templating story in Go
for one admin user is pure duplication, and a third deployable app isn't justified for ~5 pages.

```
app/admin/
├── login/page.tsx       # public; ui/LoginForm.tsx ("use client" leaf)
├── page.tsx              # post list incl. drafts (protected)
├── new/page.tsx           # new post form (protected)
└── [id]/edit/page.tsx     # edit post form (protected)
app/api/admin/
├── login/route.ts
├── posts/route.ts
└── posts/[id]/route.ts
```

Auth flow:
1. `LoginForm` POSTs the password to `app/api/admin/login/route.ts`, which calls the Go API's
   `POST /admin/login` server-to-server, then sets the returned JWT as an **httpOnly, Secure,
   SameSite=Strict** cookie (`blog_admin_token`) on the response. The browser never holds the raw JWT.
2. All other admin reads/writes go through `app/api/admin/posts*` Route Handlers, which read the
   cookie server-side via `cookies()`, forward it as `Authorization: Bearer <token>` to the Go API,
   and proxy the response. **No browser-to-Go-API calls at all** — this avoids any CORS config on the
   Go side and means `proxy.ts`'s current CSP (`default-src 'self'`, no `connect-src` needed) stays
   untouched, since the browser only ever talks to `lequoctrung.vn`.
3. Route-level gating: extend `apps/website/proxy.ts` (currently only sets security headers, matcher
   already covers all routes except `_next`/favicon) to redirect `/admin/*` (excluding
   `/admin/login`) to `/admin/login` when the `blog_admin_token` cookie is absent — a UX redirect, not
   the security boundary. The real boundary is the Go API rejecting invalid/expired JWTs with 401;
   Route Handlers just forward that 401, no second JWT-verification library needed in the Next app.
4. `proxy.ts`'s CSP comment ("this site has no forms, no user input") becomes inaccurate once the
   login/post forms exist — update that comment when this PR lands; `form-action 'self'` already
   covers same-origin form posts, no CSP value change needed, just the stale comment.
5. `cover_image_url`'s CSP impact (`img-src 'self' data:` will need widening once a real external
   image URL is used) is a follow-up at that point, not now — no posts exist yet.

**New env var**: `BLOG_API_URL` (server-only).

## 6. CI implications

- New, separate workflow `.github/workflows/blog-api-ci.yml`, path-filtered to
  `services/blog-api/**` on PRs into `main`/`develop` and pushes to `develop` — kept as its own file
  (not a second job in `ci.yml`) so it's skipped entirely on pure-frontend PRs. Runs `go build ./...`,
  `go vet ./...`, `golangci-lint`.
- Existing `ci.yml` is unaffected — `pnpm --filter website build` must keep succeeding with no live
  Go backend in CI. True by construction since `app/blog/*`/`app/admin/*` are ISR/dynamic (no eager
  `generateStaticParams` fetch at build time) and `blogApi.ts`/`sitemap.ts` degrade gracefully on
  fetch failure. Verify this explicitly during PR3 review (build with `BLOG_API_URL` unset).

## 7. PR sequence (each: branch off `develop`, PR back into `develop`, squash merge)

1. **`feature/blog-backend-scaffold`** — `services/blog-api` skeleton, schema, public read endpoints
   (`/posts`, `/posts/{slug}`, `/tags`, `/healthz`), Dockerfile + compose, `blog-api-ci.yml`. No auth.
   Independently reviewable as "a working read-only API + local Docker loop."
2. **`feature/blog-backend-auth`** — `internal/auth`, admin endpoints, `RequireAuth` middleware.
3. **`feature/blog-frontend-public`** — `lib/blogApi.ts`, `/blog` + `/blog/[slug]`, markdown
   rendering, sitemap/SEO. CI doesn't need a live backend (§6); manual verification needs PR1's API
   reachable somewhere.
4. **`feature/blog-frontend-admin`** — `/admin/*` pages, `app/api/admin/*` Route Handlers,
   `proxy.ts` gating, login/post forms. Depends on PR2's admin API.

## 8. Non-goals for this round

- Ghost data migration (schema left migration-friendly only — see §2).
- Production hosting decision for the Go service (Docker image + local compose only; `BLOG_API_URL`
  wiring in Vercel happens once a host is chosen).
- Image/cover-photo upload pipeline — v1 ships `cover_image_url` as a plain external-URL text field
  only.

## Verification (per PR)

- PR1: `docker compose up` locally → `curl localhost:8080/healthz`, `/posts`, `/tags` return expected
  JSON against a freshly-migrated empty DB; `blog-api-ci.yml` passes on the PR.
- PR2: `curl -X POST /admin/login` with the configured password returns a JWT; admin endpoints reject
  missing/invalid JWTs with 401 and accept valid ones; create→list→update→delete round-trip via curl.
- PR3: `pnpm --filter website build` succeeds with `BLOG_API_URL` unset (graceful degradation check);
  with PR1's API running locally, `/blog` lists posts, `/blog/[slug]` renders Markdown incl. a code
  block and a table; `sitemap.ts` includes post URLs.
- PR4: log in via `/admin/login`, create a draft, verify it does **not** appear on public `/blog`,
  publish it, verify it appears; log out/cookie-cleared access to `/admin` redirects to
  `/admin/login`; confirm no CSP violations in browser console on any admin page.
