# Blog Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/blog` section to the portfolio website with a post-list page and a post-detail page, faithfully implementing the Claude Design specs in `Blog List.dc.html` and `Blog Post.dc.html`.

**Architecture:** All blog pages are Next.js App Router server components fetching from the blog API at render time. The blog section lives under `app/blog/` and shares a dedicated `BlogHeader` (sticky top nav) and `BlogFooter` (dark bottom). Post list uses a horizontal row layout (not a card grid). Post detail uses Newsreader serif for body text with a separately-constrained feature image. API types, fetch helpers, and a read-time estimator live in `lib/blog.ts`.

**Tech Stack:** Next.js 16 App Router, React 19 RSC, TypeScript strict, inline styles + CSS classes (matching existing codebase pattern), design tokens from `lib/tokens.ts`, no new npm dependencies.

## Global Constraints

- No new npm packages — use `fetch`, native Next.js, and existing design tokens.
- All inline styles must reference `tokens` from `lib/tokens.ts` — no hardcoded hex values (the few literal values in `.post-body` CSS are acceptable since they reference the same palette already in tokens).
- Strict TypeScript — no `any`, `as any`, or `@ts-ignore`.
- `BLOG_API_BASE_URL` (server-only env var) defaults to `http://localhost:8080/api/v1`. `MEDIA_BASE_URL` (server-only) defaults to `http://localhost:9000/blog-media`.
- API envelope: `{ data: T }` single, `{ data: T[], meta: PaginationMeta }` list, `{ error: string }` errors.
- Images use grayscale + accent colour-overlay treatment (see PostRow and PostPage).
- `read_time` is not in the API — compute from `content` word count: `Math.ceil(words / 200) + " min read"`.
- URL structure: `/blog` (list), `/blog/tags/[tag]` (filtered), `/blog/[slug]` (detail).
- Commits go on `feature/blog-section` branch off `develop`.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/blog.ts` | Create | API types, `fetchPosts`, `fetchPost`, `buildImageUrl`, `estimateReadTime` |
| `app/blog/layout.tsx` | Create | Blog shell — renders BlogHeader + children + BlogFooter |
| `components/blog/BlogHeader.tsx` | Create | Sticky nav with logo, "portfolio / blog(active) / contact" links |
| `components/blog/BlogFooter.tsx` | Create | Dark footer with © line and "← back to portfolio" link |
| `components/blog/PostRow.tsx` | Create | Horizontal list row: 300px thumb + text block (replaces card grid) |
| `components/blog/TagPill.tsx` | Create | Tag chip linking to `/blog/tags/[tag]` |
| `components/blog/Pagination.tsx` | Create | Prev/Next controls (API supports it; shown when `total_pages > 1`) |
| `app/blog/page.tsx` | Create | `/blog` — blog header section + PostRow list |
| `app/blog/tags/[tag]/page.tsx` | Create | `/blog/tags/[tag]` — filtered PostRow list |
| `components/blog/PostContent.tsx` | Create | Renders `html` inside `.post-body` wrapper |
| `app/blog/[slug]/page.tsx` | Create | `/blog/[slug]` — post detail with feature image + content |
| `app/globals.css` | Modify | Add `.post-row`, `.post-img`, `.post-title`, `.post-body`, `.feat` CSS |
| `components/sections/Nav.tsx` | Modify | Add "blog" `<a href="/blog">` link |
| `app/sitemap.ts` | Modify | Include blog posts |

---

## Task 1: Blog API types and client

**Files:**
- Create: `apps/website/lib/blog.ts`

**Interfaces:**
- Produces:
  - `Tag { id: string; name: string; slug: string }`
  - `PostSummary { id, title, slug, excerpt, featured_image_key: string|null, featured_image_alt: string|null, status, tags: Tag[], created_at: string }`
  - `PostDetail extends PostSummary` + `{ content: string; html: string; updated_at: string }`
  - `PaginationMeta { page, limit, total, total_pages: number }`
  - `fetchPosts(params?) → Promise<{ posts: PostSummary[]; meta: PaginationMeta }>`
  - `fetchPost(slug) → Promise<PostDetail | null>`
  - `buildImageUrl(key: string|null) → string|null`
  - `estimateReadTime(content: string) → string` — e.g. `"8 min read"`

- [ ] **Step 1: Create `lib/blog.ts`**

```ts
// apps/website/lib/blog.ts

const API_BASE = process.env.BLOG_API_BASE_URL ?? "http://localhost:8080/api/v1";
const MEDIA_BASE = process.env.MEDIA_BASE_URL ?? "http://localhost:9000/blog-media";

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_key: string | null;
  featured_image_alt: string | null;
  status: string;
  tags: Tag[];
  created_at: string;
}

export interface PostDetail extends PostSummary {
  content: string;
  html: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export function buildImageUrl(key: string | null): string | null {
  if (!key) return null;
  return `${MEDIA_BASE}/${key}`;
}

export function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export async function fetchPosts(
  params: { tag?: string; page?: number; limit?: number } = {}
): Promise<{ posts: PostSummary[]; meta: PaginationMeta }> {
  const url = new URL(`${API_BASE}/posts`);
  if (params.tag) url.searchParams.set("tag", params.tag);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.limit) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);

  const json = (await res.json()) as { data: PostSummary[]; meta: PaginationMeta };
  return { posts: json.data, meta: json.meta };
}

export async function fetchPost(slug: string): Promise<PostDetail | null> {
  const res = await fetch(`${API_BASE}/posts/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);

  const json = (await res.json()) as { data: PostDetail };
  return json.data;
}
```

- [ ] **Step 2: Verify types**

```bash
cd apps/website && pnpm typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git checkout -b feature/blog-section
git add apps/website/lib/blog.ts
git commit -m "feat(blog): add API client types and fetch helpers"
```

---

## Task 2: Blog layout, BlogHeader, BlogFooter

**Files:**
- Create: `apps/website/components/blog/BlogHeader.tsx`
- Create: `apps/website/components/blog/BlogFooter.tsx`
- Create: `apps/website/app/blog/layout.tsx`

**Interfaces:**
- Produces:
  - `<BlogHeader />` — sticky nav, "blog" link highlighted in `tokens.accent`
  - `<BlogFooter name={string} />` — dark footer with copyright and back link
  - `app/blog/layout.tsx` — wraps all `/blog/**` pages, fetches author name from profile

- [ ] **Step 1: Create `components/blog/BlogHeader.tsx`**

```tsx
// apps/website/components/blog/BlogHeader.tsx
import { Logo } from "@/components/ui/Logo";
import { tokens } from "@/lib/tokens";

export function BlogHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(246,243,236,.88)",
        backdropFilter: "blur(10px)",
        borderBottom: `1.5px solid ${tokens.colors.border}`,
      }}
    >
      <div
        className="nav-inner"
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", color: "inherit" }}>
          <Logo />
        </a>
        <nav
          className="nav-links"
          style={{
            display: "flex",
            gap: 26,
            fontFamily: tokens.fonts.mono,
            fontSize: 12,
            letterSpacing: "0.04em",
            color: tokens.colors.textFaint,
          }}
        >
          <a href="/" className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
            portfolio
          </a>
          <a href="/blog" className="navlink" style={{ textDecoration: "none", color: tokens.accent }}>
            blog
          </a>
          <a href="/#contact" className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
            contact
          </a>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `components/blog/BlogFooter.tsx`**

```tsx
// apps/website/components/blog/BlogFooter.tsx
import { tokens } from "@/lib/tokens";

export function BlogFooter({ name }: { name: string }) {
  return (
    <footer style={{ background: tokens.colors.dark, color: tokens.colors.onDark }}>
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "44px 32px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 16,
          fontFamily: tokens.fonts.mono,
          fontSize: 12,
          color: tokens.colors.onDarkMuted,
          letterSpacing: "0.04em",
        }}
      >
        <span>© 2026 {name} — Saigon</span>
        <a href="/" style={{ color: tokens.colors.onDarkPill, textDecoration: "none" }}>
          ← back to portfolio
        </a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create `app/blog/layout.tsx`**

```tsx
// apps/website/app/blog/layout.tsx
import type { ReactNode } from "react";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { getProfile } from "@/lib/profile";
import { tokens } from "@/lib/tokens";

export default function BlogLayout({ children }: { children: ReactNode }) {
  const profile = getProfile();
  return (
    <div style={{ background: tokens.colors.bg, color: tokens.colors.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <BlogHeader />
      <main style={{ flex: 1 }}>{children}</main>
      <BlogFooter name={profile.basics.name} />
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
cd apps/website && pnpm typecheck
```

- [ ] **Step 5: Commit**

```bash
git add apps/website/components/blog/BlogHeader.tsx \
        apps/website/components/blog/BlogFooter.tsx \
        apps/website/app/blog/layout.tsx
git commit -m "feat(blog): add blog layout with BlogHeader and BlogFooter"
```

---

## Task 3: TagPill and Pagination

**Files:**
- Create: `apps/website/components/blog/TagPill.tsx`
- Create: `apps/website/components/blog/Pagination.tsx`

**Interfaces:**
- Produces:
  - `<TagPill tag={Tag} />` — mono chip, links to `/blog/tags/{tag.slug}`, uses `.pill` CSS class
  - `<Pagination meta={PaginationMeta} buildHref={(page: number) => string} />` — returns `null` when `total_pages <= 1`

- [ ] **Step 1: Create `components/blog/TagPill.tsx`**

```tsx
// apps/website/components/blog/TagPill.tsx
import { tokens } from "@/lib/tokens";
import type { Tag } from "@/lib/blog";

export function TagPill({ tag }: { tag: Tag }) {
  return (
    <a
      href={`/blog/tags/${tag.slug}`}
      className="pill"
      style={{
        fontFamily: tokens.fonts.mono,
        fontSize: 11,
        color: tokens.colors.textFaint,
        border: `1px solid ${tokens.colors.borderMuted}`,
        padding: "5px 11px",
        letterSpacing: "0.03em",
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      {tag.name}
    </a>
  );
}
```

- [ ] **Step 2: Create `components/blog/Pagination.tsx`**

```tsx
// apps/website/components/blog/Pagination.tsx
import { tokens } from "@/lib/tokens";
import type { PaginationMeta } from "@/lib/blog";

export function Pagination({ meta, buildHref }: { meta: PaginationMeta; buildHref: (page: number) => string }) {
  if (meta.total_pages <= 1) return null;

  const hasPrev = meta.page > 1;
  const hasNext = meta.page < meta.total_pages;

  const base = {
    fontFamily: tokens.fonts.mono,
    fontSize: 12,
    letterSpacing: "0.04em",
    border: `1.5px solid ${tokens.colors.border}`,
    padding: "9px 18px",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48 }}>
      {hasPrev ? (
        <a href={buildHref(meta.page - 1)} className="navlink" style={{ ...base, color: tokens.colors.textMuted }}>
          ← prev
        </a>
      ) : (
        <span style={{ ...base, color: tokens.colors.borderMuted, borderColor: tokens.colors.borderMuted, pointerEvents: "none" }}>
          ← prev
        </span>
      )}
      <span style={{ fontFamily: tokens.fonts.mono, fontSize: 12, color: tokens.colors.textFaint }}>
        {meta.page} / {meta.total_pages}
      </span>
      {hasNext ? (
        <a href={buildHref(meta.page + 1)} className="navlink" style={{ ...base, color: tokens.colors.textMuted }}>
          next →
        </a>
      ) : (
        <span style={{ ...base, color: tokens.colors.borderMuted, borderColor: tokens.colors.borderMuted, pointerEvents: "none" }}>
          next →
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
cd apps/website && pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add apps/website/components/blog/TagPill.tsx apps/website/components/blog/Pagination.tsx
git commit -m "feat(blog): add TagPill and Pagination components"
```

---

## Task 4: PostRow component + CSS

**Files:**
- Create: `apps/website/components/blog/PostRow.tsx`
- Modify: `apps/website/app/globals.css`

**Design spec (from `Blog List.dc.html`):**
- `display: grid; grid-template-columns: 300px 1fr; gap: 40px; align-items: center; padding: 42px 0`
- `border-bottom: 1px solid #ddd6c8`
- Left: thumbnail 200px tall with `border: 1.5px solid #17150f; overflow: hidden` + grayscale + accent overlay
- On row hover: background highlight, image scales 1.03, title turns accent color
- Date/readTime in mono muted; big title (`clamp(24px, 3.4vw, 33px)`); excerpt; tag pills

**Interfaces:**
- Consumes: `PostSummary`, `buildImageUrl`, `estimateReadTime` from `lib/blog.ts`; `TagPill`; `tokens`
- Produces: `<PostRow post={PostSummary} />` — horizontal list row, links to `/blog/{post.slug}`

- [ ] **Step 1: Add PostRow CSS to `app/globals.css`**

Append to the end of `apps/website/app/globals.css`:

```css
/* Blog list rows */
.post-row { transition: background .22s ease; }
.post-row:hover { background: rgba(23,21,15,.035); }
.post-row:hover .post-title { color: var(--ac, #cf4326); }
.post-img { transition: transform .3s ease; }
.post-row:hover .post-img { transform: scale(1.03); }
.post-title { transition: color .18s ease; }

/* Blog prose content */
.post-body { font-family: 'Newsreader', Georgia, serif; }
.post-body p { font-size: 19px; line-height: 1.72; color: #2c2920; margin: 0 0 26px; }
.post-body h2 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 28px; letter-spacing: -.01em; color: #17150f; margin: 46px 0 16px; }
.post-body h3 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: -.01em; color: #17150f; margin: 46px 0 16px; }
.post-body h4 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 20px; letter-spacing: -.01em; color: #17150f; margin: 36px 0 12px; }
.post-body blockquote { margin: 34px 0; padding: 6px 0 6px 26px; border-left: 3px solid var(--ac, #cf4326); font-style: italic; font-size: 23px; line-height: 1.5; color: #17150f; }
.post-body a { color: var(--ac, #cf4326); text-decoration: underline; text-underline-offset: 3px; }
.post-body strong { font-weight: 600; color: #17150f; }
.post-body code { font-family: 'JetBrains Mono', monospace; font-size: 15px; background: rgba(23,21,15,.06); padding: 2px 6px; border-radius: 3px; }
.post-body pre { font-family: 'JetBrains Mono', monospace; font-size: 14px; background: #17150f; color: #f6f3ec; padding: 20px 24px; overflow-x: auto; margin: 1.5em 0; line-height: 1.65; }
.post-body pre code { background: transparent; padding: 0; font-size: inherit; }
.post-body ul, .post-body ol { padding-left: 1.5em; margin: 0 0 1.2em; }
.post-body li { margin-bottom: 0.4em; }
.post-body img { max-width: 100%; height: auto; margin: 1.5em 0; }
.post-body hr { border: none; border-top: 1.5px solid #cabfa9; margin: 2.5em 0; }
.post-body table { border-collapse: collapse; width: 100%; margin: 1.5em 0; font-size: 15px; font-family: 'Bricolage Grotesque', sans-serif; }
.post-body th, .post-body td { border: 1px solid #cabfa9; padding: 8px 12px; text-align: left; }
.post-body th { background: rgba(23,21,15,.04); font-weight: 600; }

/* Responsive */
@media (max-width: 760px) {
  .blog-head { padding: 54px 0 30px !important; }
  .post-row { grid-template-columns: 1fr !important; gap: 18px !important; padding: 30px 0 !important; }
  .post-thumb { height: 200px !important; }
  .feat { height: 300px !important; }
  .post-body p { font-size: 17px !important; }
}
```

- [ ] **Step 2: Create `components/blog/PostRow.tsx`**

```tsx
// apps/website/components/blog/PostRow.tsx
import { buildImageUrl, estimateReadTime, type PostSummary } from "@/lib/blog";
import { TagPill } from "@/components/blog/TagPill";
import { tokens } from "@/lib/tokens";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y} · ${m} · ${day}`;
}

export function PostRow({ post }: { post: PostSummary }) {
  const imageUrl = buildImageUrl(post.featured_image_key);
  const readTime = estimateReadTime(post.excerpt ?? post.title);

  return (
    <a
      href={`/blog/${post.slug}`}
      className="post-row"
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 40,
        alignItems: "center",
        padding: "42px 0",
        borderBottom: `1px solid ${tokens.colors.borderHairline}`,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Thumbnail */}
      <div
        className="post-thumb"
        style={{
          position: "relative",
          height: 200,
          border: `1.5px solid ${tokens.colors.border}`,
          overflow: "hidden",
          background: tokens.colors.borderMuted,
          flexShrink: 0,
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={post.featured_image_alt ?? post.title}
            className="post-img"
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.05)" }}
          />
        )}
        {/* Accent colour overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: tokens.accent,
            mixBlendMode: "multiply",
            opacity: 0.26,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Text block */}
      <div>
        <div style={{ fontFamily: tokens.fonts.mono, fontSize: 12, color: tokens.colors.onDarkMuted, letterSpacing: "0.04em", marginBottom: 14 }}>
          {formatDate(post.created_at)}{" "}
          <span style={{ color: tokens.colors.borderMuted }}>/</span>{" "}
          {readTime}
        </div>
        <h2
          className="post-title"
          style={{
            fontWeight: 700,
            fontSize: "clamp(24px, 3.4vw, 33px)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p style={{ fontSize: 16, lineHeight: 1.55, color: tokens.colors.textMuted, margin: "14px 0 20px", maxWidth: 560 }}>
            {post.excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {post.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
```

- [ ] **Step 3: Verify**

```bash
cd apps/website && pnpm typecheck
```

- [ ] **Step 4: Commit**

```bash
git add apps/website/components/blog/PostRow.tsx apps/website/app/globals.css
git commit -m "feat(blog): add PostRow component and blog CSS (post-row, post-body)"
```

---

## Task 5: Blog list page (`/blog`)

**Files:**
- Create: `apps/website/app/blog/page.tsx`

**Design spec (from `Blog List.dc.html`):**
- Header: "→ WRITING — NOTES FROM THE BUILD" label + "The *Blog*" h1 (serif italic "Blog") + intro p + count line
- List: section of PostRow components separated by hairline borders, no grid
- No explicit pagination in design — render `<Pagination>` below the list (hidden when single page)

**Interfaces:**
- Consumes: `fetchPosts` from `lib/blog.ts`; `PostRow`, `Pagination`, `tokens`

- [ ] **Step 1: Create `app/blog/page.tsx`**

```tsx
// apps/website/app/blog/page.tsx
import type { Metadata } from "next";
import { fetchPosts } from "@/lib/blog";
import { PostRow } from "@/components/blog/PostRow";
import { Pagination } from "@/components/blog/Pagination";
import { tokens } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Blog",
  description: "A personal log of root-cause hunts, systems I build, and the lessons that only show up after something ships.",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogListPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));

  const { posts, meta } = await fetchPosts({ page, limit: 10 });

  const countLine = `${meta.total} POST${meta.total !== 1 ? "S" : ""} · UPDATED ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()}`;

  return (
    <div className="pad-x" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>

      {/* ===== HEADER ===== */}
      <header className="blog-head" style={{ padding: "78px 0 36px", borderBottom: `1.5px solid ${tokens.colors.border}` }}>
        <div style={{ fontFamily: tokens.fonts.mono, fontSize: 12, letterSpacing: "0.14em", color: tokens.accent, marginBottom: 26 }}>
          → WRITING — NOTES FROM THE BUILD
        </div>
        <h1 style={{ fontWeight: 700, fontSize: "clamp(40px, 9vw, 76px)", lineHeight: 1, letterSpacing: "-0.03em", margin: 0 }}>
          The{" "}
          <span style={{ fontFamily: tokens.fonts.serif, fontStyle: "italic", fontWeight: 400 }}>
            Blog
          </span>
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: tokens.colors.textMuted, maxWidth: 540, margin: "24px 0 0" }}>
          A personal log of root-cause hunts, systems I build, and the lessons that only show up after something ships. Written by me, irregularly, honestly.
        </p>
        <div style={{ fontFamily: tokens.fonts.mono, fontSize: 12, color: tokens.colors.onDarkMuted, letterSpacing: "0.04em", marginTop: 22 }}>
          {countLine}
        </div>
      </header>

      {/* ===== POST LIST ===== */}
      <section style={{ padding: "8px 0 96px" }}>
        {posts.length === 0 ? (
          <p style={{ fontFamily: tokens.fonts.mono, fontSize: 13, color: tokens.colors.textMuted, padding: "48px 0" }}>
            No posts yet.
          </p>
        ) : (
          <>
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
            <Pagination meta={meta} buildHref={(p) => `/blog?page=${p}`} />
          </>
        )}
      </section>

    </div>
  );
}
```

- [ ] **Step 2: Start dev server and verify**

```bash
BLOG_API_BASE_URL=http://localhost:8080/api/v1 pnpm dev
```

Visit `http://localhost:3000/blog`. Expected:
- Sticky BlogHeader with "portfolio / blog(accent) / contact"
- Large header: "→ WRITING — NOTES FROM THE BUILD", big "The *Blog*" h1 (italic serif for "Blog")
- Horizontal post rows with thumbnail (grayscale + overlay) on left, text on right
- Dark BlogFooter at bottom

- [ ] **Step 3: Commit**

```bash
git add apps/website/app/blog/page.tsx
git commit -m "feat(blog): add blog list page at /blog"
```

---

## Task 6: Tag-filtered list page (`/blog/tags/[tag]`)

**Files:**
- Create: `apps/website/app/blog/tags/[tag]/page.tsx`

**Interfaces:**
- Consumes: same as Task 5 + `tag` path param

- [ ] **Step 1: Create `app/blog/tags/[tag]/page.tsx`**

```tsx
// apps/website/app/blog/tags/[tag]/page.tsx
import type { Metadata } from "next";
import { fetchPosts } from "@/lib/blog";
import { PostRow } from "@/components/blog/PostRow";
import { Pagination } from "@/components/blog/Pagination";
import { tokens } from "@/lib/tokens";

interface PageProps {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag} — Blog`, description: `Posts tagged with "${tag}".` };
}

export default async function TagListPage({ params, searchParams }: PageProps) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));

  const { posts, meta } = await fetchPosts({ tag, page, limit: 10 });

  return (
    <div className="pad-x" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>

      <header className="blog-head" style={{ padding: "78px 0 36px", borderBottom: `1.5px solid ${tokens.colors.border}` }}>
        <div style={{ fontFamily: tokens.fonts.mono, fontSize: 12, letterSpacing: "0.14em", color: tokens.accent, marginBottom: 26 }}>
          → WRITING — NOTES FROM THE BUILD
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(32px, 7vw, 56px)", lineHeight: 1, letterSpacing: "-0.03em", margin: 0 }}>
            #{tag}
          </h1>
          <a
            href="/blog"
            style={{ fontFamily: tokens.fonts.mono, fontSize: 12, color: tokens.colors.accentMuted, textDecoration: "none", letterSpacing: "0.04em" }}
          >
            ← all posts
          </a>
        </div>
        <div style={{ fontFamily: tokens.fonts.mono, fontSize: 12, color: tokens.colors.onDarkMuted, letterSpacing: "0.04em", marginTop: 22 }}>
          {meta.total} POST{meta.total !== 1 ? "S" : ""}
        </div>
      </header>

      <section style={{ padding: "8px 0 96px" }}>
        {posts.length === 0 ? (
          <p style={{ fontFamily: tokens.fonts.mono, fontSize: 13, color: tokens.colors.textMuted, padding: "48px 0" }}>
            No posts for this tag.
          </p>
        ) : (
          <>
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
            <Pagination meta={meta} buildHref={(p) => `/blog/tags/${tag}?page=${p}`} />
          </>
        )}
      </section>

    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
cd apps/website && pnpm typecheck
```

Visit `http://localhost:3000/blog/tags/go` — same layout as /blog but with tag heading.

- [ ] **Step 3: Commit**

```bash
git add apps/website/app/blog/tags/
git commit -m "feat(blog): add tag-filtered list page at /blog/tags/[tag]"
```

---

## Task 7: Post detail page

**Files:**
- Create: `apps/website/components/blog/PostContent.tsx`
- Create: `apps/website/app/blog/[slug]/page.tsx`

**Design spec (from `Blog Post.dc.html`):**
- Content area max-width: **760px** (header/tags), **980px** (feature image), **680px** (body text)
- Feature image: height 460px, `border: 1.5px solid #17150f`, `box-shadow: 8px 8px 0 tokens.accent`, grayscale + accent overlay + dark lighten overlay, figcaption below in mono muted
- Lede paragraph: 21px, line-height 1.6, color `#17150f` (first `<p>` — backend renders this in the html; handle via `.post-body p:first-of-type` CSS override)
- Back link: "← all posts" in mono muted at the top
- Footer tags section: "TAGGED" label + tag pills + "← read more posts" pill-style link

**Interfaces:**
- Consumes: `fetchPost`, `PostDetail`, `buildImageUrl`, `estimateReadTime` from `lib/blog.ts`; `TagPill`; `tokens`

- [ ] **Step 1: Create `components/blog/PostContent.tsx`**

```tsx
// apps/website/components/blog/PostContent.tsx

export function PostContent({ html }: { html: string }) {
  return (
    <article
      className="post-body"
      style={{ padding: "44px 0 40px" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

- [ ] **Step 2: Add lede override to `app/globals.css`**

Append to the end of `apps/website/app/globals.css`:

```css
/* Lede paragraph (first <p> inside post body) */
.post-body > p:first-of-type {
  font-size: 21px !important;
  line-height: 1.6 !important;
  color: #17150f !important;
}
```

- [ ] **Step 3: Create `app/blog/[slug]/page.tsx`**

```tsx
// apps/website/app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchPost, buildImageUrl, estimateReadTime } from "@/lib/blog";
import { PostContent } from "@/components/blog/PostContent";
import { TagPill } from "@/components/blog/TagPill";
import { tokens } from "@/lib/tokens";
import { truncateForMeta } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) return { title: "Post not found" };
  const description = post.excerpt ? truncateForMeta(post.excerpt) : truncateForMeta(post.title);
  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, type: "article", publishedTime: post.created_at, modifiedTime: post.updated_at },
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y} · ${m} · ${day}`;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) notFound();

  const imageUrl = buildImageUrl(post.featured_image_key);
  const readTime = estimateReadTime(post.content);

  return (
    <>
      {/* ===== HEADER (max 760px) ===== */}
      <div className="pad-x" style={{ maxWidth: 760, margin: "0 auto", padding: "0 32px" }}>
        <header className="post-head" style={{ padding: "64px 0 34px" }}>
          <a
            href="/blog"
            style={{ fontFamily: tokens.fonts.mono, fontSize: 12, letterSpacing: "0.06em", color: tokens.colors.onDarkMuted, textDecoration: "none", display: "inline-block", marginBottom: 30 }}
          >
            ← all posts
          </a>
          <div style={{ fontFamily: tokens.fonts.mono, fontSize: 12, color: tokens.colors.onDarkMuted, letterSpacing: "0.04em", marginBottom: 18 }}>
            {formatDate(post.created_at)}{" "}
            <span style={{ color: tokens.colors.borderMuted }}>/</span>{" "}
            {readTime}
          </div>
          <h1 style={{ fontWeight: 700, fontSize: "clamp(32px, 6vw, 52px)", lineHeight: 1.06, letterSpacing: "-0.025em", margin: 0 }}>
            {post.title}
          </h1>
          {post.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
              {post.tags.map((tag) => (
                <TagPill key={tag.id} tag={tag} />
              ))}
            </div>
          )}
        </header>
      </div>

      {/* ===== FEATURE IMAGE (max 980px, full-bleed within container) ===== */}
      {imageUrl && (
        <div className="pad-x" style={{ maxWidth: 980, margin: "0 auto", padding: "0 32px 10px" }}>
          <figure className="feat" style={{ position: "relative", margin: 0, height: 460, border: `1.5px solid ${tokens.colors.border}`, boxShadow: `8px 8px 0 ${tokens.accent}`, overflow: "hidden" }}>
            <img
              src={imageUrl}
              alt={post.featured_image_alt ?? post.title}
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.05)" }}
            />
            {/* Accent overlay */}
            <div style={{ position: "absolute", inset: 0, background: tokens.accent, mixBlendMode: "multiply", opacity: 0.24, pointerEvents: "none" }} />
            {/* Dark lighten overlay */}
            <div style={{ position: "absolute", inset: 0, background: tokens.colors.dark, mixBlendMode: "lighten", opacity: 0.12, pointerEvents: "none" }} />
          </figure>
          <figcaption style={{ fontFamily: tokens.fonts.mono, fontSize: 11, color: tokens.colors.onDarkMuted, letterSpacing: "0.03em", marginTop: 12 }}>
            {post.excerpt}
          </figcaption>
        </div>
      )}

      {/* ===== CONTENT (max 680px) ===== */}
      <div className="pad-x" style={{ maxWidth: 680, margin: "0 auto", padding: "0 32px" }}>
        <PostContent html={post.html} />

        {/* ===== FOOTER TAGS ===== */}
        <div style={{ padding: "28px 0 80px", borderTop: `1px solid ${tokens.colors.borderHairline}` }}>
          <div style={{ fontFamily: tokens.fonts.mono, fontSize: 11, letterSpacing: "0.1em", color: tokens.colors.onDarkMuted, marginBottom: 14 }}>
            TAGGED
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 34 }}>
            {post.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} />
            ))}
          </div>
          <a
            href="/blog"
            className="pill"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: tokens.fonts.mono,
              fontSize: 13,
              color: tokens.colors.text,
              border: `1.5px solid ${tokens.colors.border}`,
              padding: "11px 20px",
              textDecoration: "none",
              letterSpacing: "0.03em",
            }}
          >
            ← read more posts
          </a>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Verify and visual check**

```bash
cd apps/website && pnpm typecheck
```

Visit `http://localhost:3000/blog/some-slug`. Expected:
- "← all posts" back link (mono, muted)
- Big title, date/readTime, tag pills
- Feature image with accent box-shadow (`8px 8px 0 #cf4326`), grayscale + overlays
- Body text in Newsreader serif, first paragraph larger (21px)
- "TAGGED" section + pill link at bottom

- [ ] **Step 5: Commit**

```bash
git add apps/website/components/blog/PostContent.tsx \
        apps/website/app/blog/\[slug\]/ \
        apps/website/app/globals.css
git commit -m "feat(blog): add post detail page with feature image and Newsreader prose"
```

---

## Task 8: Nav link + sitemap

**Files:**
- Modify: `apps/website/components/sections/Nav.tsx`
- Modify: `apps/website/app/sitemap.ts`

- [ ] **Step 1: Add "blog" to `Nav.tsx`**

In `apps/website/components/sections/Nav.tsx`, inside the `<nav>` that renders `<NavLink>` elements, add a blog link **before** the existing links:

```tsx
// Replace the <nav> inner content:
<nav
  className="nav-links"
  style={{
    display: "flex",
    gap: 26,
    fontFamily: tokens.fonts.mono,
    fontSize: 12,
    letterSpacing: "0.04em",
    color: tokens.colors.textFaint,
  }}
>
  <a href="/blog" className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
    blog
  </a>
  <NavLink href="#work">work</NavLink>
  <NavLink href="#projects">projects</NavLink>
  <NavLink href="#stack">stack</NavLink>
  <NavLink href="#contact">contact</NavLink>
</nav>
```

- [ ] **Step 2: Extend `app/sitemap.ts`**

Replace the full contents of `apps/website/app/sitemap.ts`:

```ts
// apps/website/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/profile";
import { fetchPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profile = getProfile();
  const siteUrl = profile.basics.url ?? "https://lequoctrung.vn";

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const { posts } = await fetchPosts({ limit: 100 });
    postEntries = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.created_at),
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

- [ ] **Step 3: Full build check**

```bash
cd apps/website && pnpm typecheck
pnpm --filter website build
```
Expected: build succeeds.

- [ ] **Step 4: Visual check on homepage**

Visit `http://localhost:3000`. Confirm "blog" link appears before "work" in the portfolio nav. Click it — navigates to `/blog`.

- [ ] **Step 5: Commit + push + open PR**

```bash
git add apps/website/components/sections/Nav.tsx apps/website/app/sitemap.ts
git commit -m "feat(blog): add blog nav link and extend sitemap with posts"
git push -u origin feature/blog-section
```

Open PR: `feature/blog-section` → `develop`.

---

## Self-Review

**Spec coverage:**
- [x] Blog List design: sticky nav with "portfolio / blog(active) / contact"
- [x] Blog List header: "→ WRITING" label, "The *Blog*" h1 with serif italic, intro, count line
- [x] Blog List rows: `300px 1fr` grid, thumbnail with grayscale+overlay, date/readTime, title, excerpt, tags
- [x] Blog List hover: background, title accent, image scale — via `.post-row`, `.post-img`, `.post-title` CSS
- [x] Dark footer on both pages — `BlogFooter`
- [x] Blog Post: 760px/980px/680px nested container widths
- [x] Blog Post feature image: `box-shadow: 8px 8px 0 accent`, grayscale + accent overlay + dark lighten overlay
- [x] Blog Post body: Newsreader serif, 19px/1.72 line-height, h3 headings, blockquote with accent left-border
- [x] Blog Post lede (first p): 21px override via `.post-body > p:first-of-type`
- [x] Blog Post footer: "TAGGED" label + tags + "← read more posts" pill button
- [x] `read_time` not in API → `estimateReadTime(content)` from word count

**Type consistency:**
- `PostSummary` → `PostRow`, `fetchPosts`
- `PostDetail extends PostSummary` → `PostPage`, `PostContent`
- `buildImageUrl(key: string|null): string|null` → `PostRow`, `PostPage`
- `estimateReadTime(content: string): string` → `PostRow`, `PostPage`
- `PaginationMeta` → `Pagination`
