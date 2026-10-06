# Vietnamese (i18n) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every page of `lequoctrung.vn` is fully readable in Vietnamese under `/vi/…`, English stays at the existing URLs, no mixed-language pages (blog post bodies excepted).

**Architecture:** All pages move under `app/[lang]/` (static params `en`, `vi`). `proxy.ts` rewrites unprefixed URLs to `/en/…` internally, 301s `/en/…` to unprefixed, passes `/vi/…`. UI strings live in typed TS dictionaries; Vietnamese profile data lives in `profile.vi.json`, kept structurally in sync with `profile.json` by a parity check in `validate`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, zod 4, pnpm workspaces, `node:test` via `tsx --test`.

**Spec:** `docs/superpowers/specs/2026-10-06-i18n-vietnamese-design.md`

## Global Constraints

- No new runtime dependencies (no `next-intl` etc.). `tsx` may be added as a website devDependency for tests.
- Locales exactly `["en", "vi"]`; default `en`; English URLs carry no prefix; Vietnamese URLs are `/vi` + path.
- Follow `docs/CONVENTIONS.md`: `components/ui/*` props-only; `"use client"` only on leaf `ui/` components (existing client components in `components/blog/` stay where they are); styling via `lib/tokens.ts`, inline styles like the surrounding code.
- No HTML inside dictionary strings; no new `dangerouslySetInnerHTML`.
- Blog post **content** (title, excerpt, body, tags from the blog API) is never translated; wrap it in `lang="vi"`.
- Every internal link goes through `localePath(locale, path)`.
- CI must stay green: `pnpm --filter @new-portfolio/profile-schema validate`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm --filter website build`.
- Commits: conventional style (`feat(i18n): …`), ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never commit to `main`/`develop`.
- Vietnamese copy: professional, first person "tôi", general audience, proper diacritics.

## Review Focus

1. Unprefixed static/root files (`/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/llms.txt`, `/icon.svg`, `/portrait.png`, `/media/…`) must not be rewritten into `/en/…` → covered by `resolveLocaleRoute` tests in Task 3.
2. Paths that merely start with "en"/"vi" letters (`/english`, `/video`) must not be treated as locale prefixes → tests in Task 3.
3. `localePath("vi", "/#contact")` must produce `/vi#contact`, not `/vi/#contact` → test in Task 2.
4. A tailored CV file passed to `validate <path>` must not be parity-checked against `profile.vi.json` → Task 1 step.
5. Unknown paths (`/foo`, `/vi/foo`) must render a localized 404, not crash for lack of a root layout → Task 3 verification.

---

### Task 1: `profile.vi.json` + parity check

**Files:**
- Create: `packages/profile-schema/src/parity.ts`
- Create: `packages/profile-schema/src/parity.test.ts`
- Modify: `packages/profile-schema/src/validate.ts`
- Modify: `packages/profile-schema/package.json` (add `"test": "tsx --test src/parity.test.ts"`)
- Create: `profile.vi.json` (repo root)
- Modify: `.github/workflows/ci.yml` (add `- run: pnpm test` after `pnpm lint`)
- Modify: `CLAUDE.md` (Commands/Conventions: mention `profile.vi.json`, parity check, `pnpm test` now runs tests)

**Interfaces:**
- Produces: `checkParity(en: unknown, vi: unknown): string[]` (empty = OK), `LOCKED_KEYS: ReadonlySet<string>`; file `profile.vi.json` valid against `profileSchema`.

- [ ] **Step 1: Write failing tests** — `packages/profile-schema/src/parity.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkParity } from "./parity";

test("identical structure with translated text passes", () => {
  const en = { basics: { name: "A", summary: "Hello", url: "https://x.y" }, work: [{ position: "Lead", startDate: "2025-03", tags: ["ai"] }] };
  const vi = { basics: { name: "A", summary: "Xin chào", url: "https://x.y" }, work: [{ position: "Trưởng nhóm", startDate: "2025-03", tags: ["ai"] }] };
  assert.deepEqual(checkParity(en, vi), []);
});

test("locked key mismatch reports the JSON path", () => {
  const errors = checkParity({ work: [{ startDate: "2025-03" }] }, { work: [{ startDate: "2025-04" }] });
  assert.deepEqual(errors, ['work[0].startDate: locked value differs ("2025-03" vs "2025-04")']);
});

test("array length mismatch is reported", () => {
  const errors = checkParity({ work: [{}, {}] }, { work: [{}] });
  assert.deepEqual(errors, ["work: array length differs (2 vs 1)"]);
});

test("missing and extra keys are reported", () => {
  const errors = checkParity({ a: "x", b: "y" }, { a: "x", c: "z" });
  assert.deepEqual(errors, ["b: missing in vi", "c: extra in vi"]);
});

test("tags elements are locked", () => {
  const errors = checkParity({ tags: ["ai"] }, { tags: ["trí tuệ nhân tạo"] });
  assert.deepEqual(errors, ['tags[0]: locked value differs ("ai" vs "trí tuệ nhân tạo")']);
});

test("_note keys are ignored", () => {
  assert.deepEqual(checkParity({ _note: "x", a: "1" }, { a: "2" }), []);
});

test("type mismatch is reported", () => {
  assert.deepEqual(checkParity({ a: ["x"] }, { a: "x" }), ["a: type differs (array vs string)"]);
});
```

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter @new-portfolio/profile-schema test` → fails (module `./parity` not found). Add the `test` script first.

- [ ] **Step 3: Implement** — `packages/profile-schema/src/parity.ts`:

```ts
/**
 * Structural parity between profile.json (en) and profile.vi.json (vi):
 * same keys, same array lengths, identical values for non-translatable keys.
 * Only free-text fields may differ. `_note` keys are author notes and ignored.
 */
export const LOCKED_KEYS: ReadonlySet<string> = new Set([
  "startDate", "endDate", "date", "releaseDate", "url", "email", "phone",
  "countryCode", "username", "network", "image", "tags",
]);

function kind(v: unknown): string {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  return typeof v;
}

function join(path: string, key: string): string {
  return path ? `${path}.${key}` : key;
}

export function checkParity(en: unknown, vi: unknown, path = "", locked = false): string[] {
  const label = path || "(root)";
  if (kind(en) !== kind(vi)) return [`${label}: type differs (${kind(en)} vs ${kind(vi)})`];

  if (Array.isArray(en) && Array.isArray(vi)) {
    if (en.length !== vi.length) return [`${label}: array length differs (${en.length} vs ${vi.length})`];
    return en.flatMap((item, i) => checkParity(item, vi[i], `${path}[${i}]`, locked));
  }

  if (kind(en) === "object") {
    const a = en as Record<string, unknown>;
    const b = vi as Record<string, unknown>;
    const errors: string[] = [];
    for (const key of Object.keys(a)) {
      if (key === "_note") continue;
      if (!(key in b)) errors.push(`${join(path, key)}: missing in vi`);
      else errors.push(...checkParity(a[key], b[key], join(path, key), locked || LOCKED_KEYS.has(key)));
    }
    for (const key of Object.keys(b)) {
      if (key !== "_note" && !(key in a)) errors.push(`${join(path, key)}: extra in vi`);
    }
    return errors;
  }

  if (locked && en !== vi) return [`${label}: locked value differs (${JSON.stringify(en)} vs ${JSON.stringify(vi)})`];
  return [];
}
```

- [ ] **Step 4: Run tests, expect PASS** — `pnpm --filter @new-portfolio/profile-schema test`.

- [ ] **Step 5: Wire into `validate.ts`** — keep current behaviour for an explicit path argument (tailored CVs: schema only, **no** parity). With no argument: validate `profile.json`, then validate `../../../profile.vi.json` against `profileSchema`, then run `checkParity` on the two **raw parsed JSON** objects (not zod output). Print each parity error and `process.exit(1)` if any. Success message: `profile.json + profile.vi.json are valid and in parity`.

- [ ] **Step 6: Write `profile.vi.json`** — copy `profile.json`, translate every free-text value into natural professional Vietnamese (first person "tôi" where the English is first person): `basics.label`, `basics.summary`, `basics.location.city` (`"TP. Hồ Chí Minh"`), `work[].position/summary/highlights`, `volunteer[]` text, `education[].area/studyType/courses`, `projects[].description/highlights`, `skills[].name` (only if it is a category phrase, keep tech keywords as-is), `languages[].language/fluency` (e.g. `"Tiếng Việt"`, `"Bản ngữ"`, `"Tiếng Anh"`), certificate `name`/`issuer` stay as official names. Keep names of people/companies/products/tech terms in English. Do NOT touch locked keys; drop nothing; keep `_note` keys out (or copy, they're ignored). `work[0].highlights[0]` is shown as a one-line role narrative on the site — keep it one line.

- [ ] **Step 7: Validate** — `pnpm --filter @new-portfolio/profile-schema validate` → success. Then prove the check bites: temporarily change one `startDate` in `profile.vi.json`, rerun → exits 1 naming the path; revert.

- [ ] **Step 8: CI + docs** — add `- run: pnpm test` to `.github/workflows/ci.yml` after `pnpm lint`. Update `CLAUDE.md`: architecture diagram mentions `profile.vi.json`; Conventions bullet "When editing `profile.json`, update `profile.vi.json` in the same change — `validate` enforces structural parity (same keys/array lengths, identical dates/urls/tags)"; fix the line saying `pnpm test` is a no-op.

- [ ] **Step 9: Commit** — `git add packages/profile-schema profile.vi.json .github/workflows/ci.yml CLAUDE.md && git commit -m "feat(i18n): add profile.vi.json with structural parity check"`

---

### Task 2: i18n core — config, dictionaries, locale-aware formatting, `getProfile(locale)`

**Files:**
- Create: `apps/website/lib/i18n/config.ts`
- Create: `apps/website/lib/i18n/config.test.ts`
- Create: `apps/website/lib/i18n/dictionaries/en.ts`
- Create: `apps/website/lib/i18n/dictionaries/vi.ts`
- Create: `apps/website/lib/i18n/getDictionary.ts`
- Modify: `apps/website/lib/formatDate.ts` + Create `apps/website/lib/formatDate.test.ts`
- Modify: `apps/website/lib/profile.ts`
- Modify: `apps/website/lib/blog.ts` (`estimateReadTime` gains `locale`)
- Modify: `apps/website/package.json` (devDep `tsx` same version as profile-schema `^4.22.4`; script `"test": "tsx --test lib/*.test.ts lib/i18n/*.test.ts"`) — run `pnpm install` to update the lockfile.

**Interfaces (Produces — later tasks rely on these exact names):**
```ts
// lib/i18n/config.ts
export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export function isLocale(value: string): value is Locale;
export function localePath(locale: Locale, path: string): string;      // ("vi","/blog")→"/vi/blog"; ("vi","/")→"/vi"; ("vi","/#contact")→"/vi#contact"; ("en",p)→p
export function stripLocale(pathname: string): { locale: Locale; path: string }; // "/vi/blog"→{vi,"/blog"}; "/vi"→{vi,"/"}; "/en/blog"→{en,"/blog"}; "/blog"→{en,"/blog"}; "/video"→{en,"/video"}
export function fill(template: string, vars: Record<string, string | number>): string; // "{n} min" + {n:3} → "3 min"
export const ogLocale: Record<Locale, string>;   // { en: "en_US", vi: "vi_VN" }
export const htmlLang: Record<Locale, string>;   // { en: "en", vi: "vi" }
// lib/i18n/getDictionary.ts
export type Dictionary  // = Widen<typeof en>, re-exported from dictionaries/en.ts
export function getDictionary(locale: Locale): Dictionary;
// lib/formatDate.ts
export function formatDate(date: string, locale: Locale): string;               // en "Jan 2025", vi "01/2025", year-only "2025"
export function formatPeriod(startDate: string, endDate: string | undefined, locale: Locale): string; // "Jan 2025 — Present" / "01/2025 — Hiện tại"
// lib/profile.ts
export function getProfile(locale?: Locale): Profile; // default "en"
// lib/blog.ts
export function estimateReadTime(content: string, locale?: Locale): string; // default "en": "3 min read" / vi "3 phút đọc"
```

- [ ] **Step 1: Failing tests** — `apps/website/lib/i18n/config.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { localePath, stripLocale, fill, isLocale } from "./config";

test("localePath", () => {
  assert.equal(localePath("en", "/blog"), "/blog");
  assert.equal(localePath("en", "/"), "/");
  assert.equal(localePath("vi", "/"), "/vi");
  assert.equal(localePath("vi", "/blog/abc"), "/vi/blog/abc");
  assert.equal(localePath("vi", "/#contact"), "/vi#contact");
  assert.equal(localePath("en", "/#contact"), "/#contact");
});

test("stripLocale", () => {
  assert.deepEqual(stripLocale("/vi"), { locale: "vi", path: "/" });
  assert.deepEqual(stripLocale("/vi/blog/x"), { locale: "vi", path: "/blog/x" });
  assert.deepEqual(stripLocale("/en"), { locale: "en", path: "/" });
  assert.deepEqual(stripLocale("/en/privacy"), { locale: "en", path: "/privacy" });
  assert.deepEqual(stripLocale("/blog"), { locale: "en", path: "/blog" });
  assert.deepEqual(stripLocale("/video"), { locale: "en", path: "/video" });
  assert.deepEqual(stripLocale("/"), { locale: "en", path: "/" });
});

test("fill + isLocale", () => {
  assert.equal(fill("{n} min read", { n: 3 }), "3 min read");
  assert.equal(fill("{missing}", {}), "{missing}");
  assert.equal(isLocale("vi"), true);
  assert.equal(isLocale("fr"), false);
});
```

`apps/website/lib/formatDate.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatPeriod } from "./formatDate";

test("formatDate", () => {
  assert.equal(formatDate("2025-03", "en"), "Mar 2025");
  assert.equal(formatDate("2025-03", "vi"), "03/2025");
  assert.equal(formatDate("2025-03-14", "vi"), "03/2025");
  assert.equal(formatDate("2025", "vi"), "2025");
});

test("formatPeriod", () => {
  assert.equal(formatPeriod("2025-03", undefined, "en"), "Mar 2025 — Present");
  assert.equal(formatPeriod("2025-03", undefined, "vi"), "03/2025 — Hiện tại");
  assert.equal(formatPeriod("2020-01", "2021-12", "vi"), "01/2020 — 12/2021");
});
```

Note: test files import with relative paths (no `@/` alias) so `tsx --test` resolves them; `config.ts` and `formatDate.ts` must therefore not import via `@/` either (use relative imports inside `lib/`).

- [ ] **Step 2: Run, expect FAIL** — `pnpm --filter website test`.

- [ ] **Step 3: Implement `config.ts`, `formatDate.ts`** per the interfaces above. `localePath`: split off a `#hash` suffix first; for `vi` return `"/vi" + (base === "/" ? "" : base) + hash`. `stripLocale`: prefix match only when `pathname === "/vi" || pathname.startsWith("/vi/")` (same for `/en`). `fill`: `template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))`. `formatDate` en keeps the current `MONTHS` array; vi returns `MM/YYYY`.

- [ ] **Step 4: Run tests, expect PASS.**

- [ ] **Step 5: Dictionaries.** `dictionaries/en.ts` (declare `as const`, then derive the widened type):

```ts
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { readonly [K in keyof T]: Widen<T[K]> };

export const en = {
  nav: { work: "work", projects: "projects", stack: "stack", blog: "blog", contact: "contact", portfolio: "portfolio", language: "Language" },
  hero: {
    lead: "I turn root-cause analysis into",
    accent: "scalable solutions",
    middle: "and teams into",
    underline: "independent problem-solvers.",
    available: "available for select work",
  },
  transformations: {
    label: "SELECTED TRANSFORMATIONS",
    items: [
      { from: "manual 1st-level support", to: "AI agent, 60% less dev effort", tag: "BOSCH" },
      { from: "manual video edits", to: "1,500 auto-shipped / day", tag: "MEDIA AI" },
      { from: "60-step order cycle", to: "60% faster, 0 errors", tag: "HGM BPM" },
      { from: "siloed engineers", to: "100% proactive owners", tag: "DAT · BOSCH" },
    ],
  },
  sections: {
    experience: "EXPERIENCE",
    projects: "SELECTED PROJECTS",
    stack: "STACK",
    education: "EDUCATION",
    certificates: "CERTIFICATES",
    latestBlog: "LATEST FROM THE BLOG",
    allPosts: "all posts →",
  },
  contact: {
    kicker: "→ LET'S BUILD SOMETHING",
    headingLead: "Got a system that needs a",
    headingAccent: "root-cause fix",
    headingTail: "? Let's talk.",
    privacy: "Privacy",
  },
  blog: {
    siteName: "{name}'s Blog",
    kicker: "→ WRITING — NOTES FROM THE BUILD",
    titleLead: "The",
    titleAccent: "Blog",
    description:
      "A personal log of root-cause hunts, systems I build, and the lessons that only show up after something ships. Written by me, irregularly, honestly.",
    metaDescription:
      "A personal log of root-cause hunts, systems I build, and the lessons that only show up after something ships.",
    countOne: "{count} POST",
    countMany: "{count} POSTS",
    updated: "UPDATED {date}",
    empty: "No posts yet.",
    loadMore: "load more →",
    loading: "loading…",
    allPostsBack: "← all posts",
    readMore: "← read more posts",
    tagged: "TAGGED",
    share: "SHARE",
    shareButton: "Share",
    copyLink: "Copy link",
    copied: "Copied!",
    toc: "CONTENTS",
    tocAria: "Contents",
    related: "RELATED POSTS",
    prev: "← PREVIOUS",
    next: "NEXT →",
    postNavAria: "Previous and next posts",
    backToPortfolio: "← back to portfolio",
    privacy: "Privacy",
    notFound: "Post not found",
  },
  privacy: {
    title: "Privacy",
    kicker: "PRIVACY",
    intro: "How this site handles first-party analytics and visitor data.",
    home: "← home",
    backHome: "← back home",
    sections: [
      { heading: "WHAT IS COLLECTED", body: "This site uses first-party analytics only. When you load a page, we record the page path, referring URL, query string (including UTM parameters when present), approximate engagement (time on page and scroll depth), your IP address, and your browser User-Agent string." },
      { heading: "WHY", body: "These measurements support traffic analysis, bot and spam detection, and content improvement. They are not used for advertising or ad targeting." },
      { heading: "SHARING", body: "There are no third-party analytics vendors. Analytics data stays on infrastructure controlled by the site operator and is not sold or shared for marketing purposes." },
      { heading: "NO CROSS-SITE TRACKING", body: "This site does not use ad pixels, third-party tracking cookies, or shared advertising identifiers. Analytics does not follow you across other websites." },
      { heading: "RETENTION", body: "Raw analytics events are retained only as long as operationally needed. A more specific retention period will be published here if the backend defines one." },
    ],
  },
  notFound: { title: "Page not found", body: "The page you're looking for doesn't exist.", home: "← back home" },
} as const;

export type Dictionary = Widen<typeof en>;
```

`dictionaries/vi.ts`:

```ts
import type { Dictionary } from "./en";

export const vi: Dictionary = {
  nav: { work: "kinh nghiệm", projects: "dự án", stack: "công nghệ", blog: "blog", contact: "liên hệ", portfolio: "portfolio", language: "Ngôn ngữ" },
  hero: {
    lead: "Tôi biến phân tích nguyên nhân gốc rễ thành",
    accent: "giải pháp có thể mở rộng",
    middle: "và giúp đội ngũ trở thành",
    underline: "những người tự giải quyết vấn đề.",
    available: "đang nhận một số dự án chọn lọc",
  },
  transformations: {
    label: "NHỮNG CHUYỂN ĐỔI TIÊU BIỂU",
    items: [
      { from: "hỗ trợ cấp 1 thủ công", to: "AI agent, giảm 60% công sức dev", tag: "BOSCH" },
      { from: "chỉnh sửa video thủ công", to: "1.500 video tự động xuất / ngày", tag: "MEDIA AI" },
      { from: "quy trình đặt hàng 60 bước", to: "nhanh hơn 60%, 0 lỗi", tag: "HGM BPM" },
      { from: "kỹ sư làm việc rời rạc", to: "100% chủ động làm chủ", tag: "DAT · BOSCH" },
    ],
  },
  sections: {
    experience: "KINH NGHIỆM",
    projects: "DỰ ÁN TIÊU BIỂU",
    stack: "CÔNG NGHỆ",
    education: "HỌC VẤN",
    certificates: "CHỨNG CHỈ",
    latestBlog: "BÀI VIẾT MỚI NHẤT",
    allPosts: "tất cả bài viết →",
  },
  contact: {
    kicker: "→ CÙNG XÂY DỰNG",
    headingLead: "Hệ thống của bạn cần được",
    headingAccent: "xử lý tận gốc",
    headingTail: "? Hãy trò chuyện.",
    privacy: "Quyền riêng tư",
  },
  blog: {
    siteName: "Blog của {name}",
    kicker: "→ GHI CHÉP — TỪ NHỮNG GÌ TÔI XÂY DỰNG",
    titleLead: "Góc",
    titleAccent: "Blog",
    description:
      "Nhật ký cá nhân về những lần truy tìm nguyên nhân gốc rễ, những hệ thống tôi xây dựng, và những bài học chỉ lộ ra sau khi sản phẩm đã ra mắt. Tôi tự viết, không đều đặn, nhưng thật lòng.",
    metaDescription:
      "Nhật ký cá nhân về những lần truy tìm nguyên nhân gốc rễ, những hệ thống tôi xây dựng, và những bài học chỉ lộ ra sau khi sản phẩm ra mắt.",
    countOne: "{count} BÀI VIẾT",
    countMany: "{count} BÀI VIẾT",
    updated: "CẬP NHẬT {date}",
    empty: "Chưa có bài viết nào.",
    loadMore: "xem thêm →",
    loading: "đang tải…",
    allPostsBack: "← tất cả bài viết",
    readMore: "← đọc thêm bài khác",
    tagged: "THẺ",
    share: "CHIA SẺ",
    shareButton: "Chia sẻ",
    copyLink: "Sao chép link",
    copied: "Đã sao chép!",
    toc: "MỤC LỤC",
    tocAria: "Mục lục",
    related: "BÀI LIÊN QUAN",
    prev: "← BÀI TRƯỚC",
    next: "BÀI SAU →",
    postNavAria: "Bài trước và bài sau",
    backToPortfolio: "← về trang portfolio",
    privacy: "Quyền riêng tư",
    notFound: "Không tìm thấy bài viết",
  },
  privacy: {
    title: "Quyền riêng tư",
    kicker: "QUYỀN RIÊNG TƯ",
    intro: "Cách trang web này xử lý dữ liệu phân tích (first-party) và dữ liệu người truy cập.",
    home: "← trang chủ",
    backHome: "← về trang chủ",
    sections: [
      { heading: "DỮ LIỆU ĐƯỢC THU THẬP", body: "Trang web này chỉ dùng công cụ phân tích của chính mình (first-party). Khi bạn mở một trang, hệ thống ghi lại đường dẫn trang, URL giới thiệu, chuỗi truy vấn (bao gồm tham số UTM nếu có), mức độ tương tác ước tính (thời gian trên trang và độ sâu cuộn), địa chỉ IP và chuỗi User-Agent của trình duyệt." },
      { heading: "MỤC ĐÍCH", body: "Các số liệu này phục vụ phân tích lưu lượng truy cập, phát hiện bot và spam, và cải thiện nội dung. Chúng không được dùng cho quảng cáo hay nhắm mục tiêu quảng cáo." },
      { heading: "CHIA SẺ", body: "Không có bên thứ ba nào cung cấp dịch vụ phân tích. Dữ liệu phân tích nằm trên hạ tầng do chủ trang web kiểm soát, không được bán hay chia sẻ cho mục đích marketing." },
      { heading: "KHÔNG THEO DÕI CHÉO TRANG", body: "Trang web này không dùng pixel quảng cáo, cookie theo dõi của bên thứ ba hay mã định danh quảng cáo dùng chung. Công cụ phân tích không theo dõi bạn trên các trang web khác." },
      { heading: "THỜI GIAN LƯU TRỮ", body: "Dữ liệu sự kiện thô chỉ được lưu trong thời gian cần thiết cho vận hành. Nếu backend xác định thời hạn lưu trữ cụ thể hơn, thông tin đó sẽ được công bố tại đây." },
    ],
  },
  notFound: { title: "Không tìm thấy trang", body: "Trang bạn tìm không tồn tại.", home: "← về trang chủ" },
};
```

`getDictionary.ts`: `const dictionaries = { en, vi } satisfies Record<Locale, Dictionary>; export function getDictionary(locale: Locale): Dictionary { return dictionaries[locale]; }` and `export type { Dictionary }`.

- [ ] **Step 6: `getProfile(locale = "en")`** — import both `../../../profile.json` and `../../../profile.vi.json`, parse the selected one with `profileSchema`. Keep existing zero-arg callers working (default `en`).

- [ ] **Step 7: `estimateReadTime(content, locale = "en")`** — en `"{n} min read"`, vi `"{n} phút đọc"` (use `getDictionary`? No — keep `lib/blog.ts` free of dictionary imports; inline the two templates).

- [ ] **Step 8: Verify** — `pnpm install && pnpm --filter website test && pnpm --filter website typecheck && pnpm --filter website lint`. Existing callers of `formatDate/formatPeriod` now fail typecheck — pass `"en"` at those call sites for now (Task 4 replaces with the real locale).

- [ ] **Step 9: Commit** — `feat(i18n): add locale config, dictionaries and locale-aware formatting`.

---

### Task 3: `[lang]` routing + proxy locale handling (pages still render English copy)

**Files:**
- Create: `apps/website/lib/i18n/routing.ts`, `apps/website/lib/i18n/routing.test.ts`
- Modify: `apps/website/proxy.ts`
- Move (with `git mv`): `app/layout.tsx` → `app/[lang]/layout.tsx`; `app/page.tsx` → `app/[lang]/page.tsx`; `app/opengraph-image.tsx` → `app/[lang]/opengraph-image.tsx`; `app/privacy/` → `app/[lang]/privacy/`; `app/blog/` → `app/[lang]/blog/`
- Create: `app/[lang]/not-found.tsx`, `app/[lang]/[...rest]/page.tsx`
- Stay at root (do not move): `app/globals.css`, `app/icon.svg`, `app/sitemap.ts`, `app/robots.ts`, `app/feed.xml/`, `app/llms.txt/`, `app/llms-full.txt/`, `app/actions/`

**Interfaces:**
- Consumes: `isLocale`, `locales`, `Locale`, `htmlLang`, `getDictionary` from Task 2.
- Produces:
```ts
// lib/i18n/routing.ts
export type RouteDecision =
  | { type: "next" }
  | { type: "redirect"; pathname: string }   // 301
  | { type: "rewrite"; pathname: string };
export function resolveLocaleRoute(pathname: string): RouteDecision;
```
- Every page/layout under `app/[lang]` receives `params: Promise<{ lang: string }>` and narrows with `isLocale` (call `notFound()` otherwise).

- [ ] **Step 1: Failing tests** — `lib/i18n/routing.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLocaleRoute } from "./routing";

test("unprefixed pages rewrite to /en", () => {
  assert.deepEqual(resolveLocaleRoute("/"), { type: "rewrite", pathname: "/en" });
  assert.deepEqual(resolveLocaleRoute("/blog/abc"), { type: "rewrite", pathname: "/en/blog/abc" });
  assert.deepEqual(resolveLocaleRoute("/opengraph-image"), { type: "rewrite", pathname: "/en/opengraph-image" });
});

test("/vi passes through", () => {
  assert.deepEqual(resolveLocaleRoute("/vi"), { type: "next" });
  assert.deepEqual(resolveLocaleRoute("/vi/blog/abc"), { type: "next" });
});

test("/en prefix 301s to unprefixed, except generated OG images", () => {
  assert.deepEqual(resolveLocaleRoute("/en"), { type: "redirect", pathname: "/" });
  assert.deepEqual(resolveLocaleRoute("/en/blog"), { type: "redirect", pathname: "/blog" });
  assert.deepEqual(resolveLocaleRoute("/en/opengraph-image"), { type: "next" });
  assert.deepEqual(resolveLocaleRoute("/en/blog/abc/opengraph-image"), { type: "next" });
});

test("root files, media and static assets are untouched", () => {
  for (const p of ["/sitemap.xml", "/robots.txt", "/feed.xml", "/llms.txt", "/llms-full.txt", "/icon.svg", "/portrait.png", "/media/a/b.webp", "/media/abc", "/_next/static/x.js"]) {
    assert.deepEqual(resolveLocaleRoute(p), { type: "next" }, p);
  }
});

test("look-alike prefixes are not locales", () => {
  assert.deepEqual(resolveLocaleRoute("/english"), { type: "rewrite", pathname: "/en/english" });
  assert.deepEqual(resolveLocaleRoute("/video"), { type: "rewrite", pathname: "/en/video" });
});
```

- [ ] **Step 2: Run, expect FAIL.** Add `lib/i18n/*.test.ts` already covered by the test script.

- [ ] **Step 3: Implement `routing.ts`**:

```ts
const BYPASS = [/^\/_next\//, /^\/media(\/|$)/, /\.[a-z0-9]+$/i];
const OG_IMAGE = /\/opengraph-image(-[\w-]+)?$/;

export function resolveLocaleRoute(pathname: string): RouteDecision {
  if (BYPASS.some((re) => re.test(pathname))) return { type: "next" };
  if (pathname === "/vi" || pathname.startsWith("/vi/")) return { type: "next" };
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    if (OG_IMAGE.test(pathname)) return { type: "next" };
    return { type: "redirect", pathname: pathname.slice(3) || "/" };
  }
  return { type: "rewrite", pathname: pathname === "/" ? "/en" : `/en${pathname}` };
}
```

- [ ] **Step 4: Tests PASS.**

- [ ] **Step 5: `proxy.ts`** — keep the whole CSP/header block and its doc comment. Build the response from the decision, then set headers on it:

```ts
const decision = resolveLocaleRoute(request.nextUrl.pathname);
let response: NextResponse;
if (decision.type === "redirect") {
  const url = request.nextUrl.clone();
  url.pathname = decision.pathname;
  response = NextResponse.redirect(url, 301);
} else if (decision.type === "rewrite") {
  const url = request.nextUrl.clone();
  url.pathname = decision.pathname;
  response = NextResponse.rewrite(url);
} else {
  response = NextResponse.next();
}
```
Rename the `_request` param to `request`. Add one comment line above the decision explaining the locale scheme (unprefixed = en via rewrite, `/vi` passthrough, `/en` 301). Keep the `matcher` unchanged.

- [ ] **Step 6: Move routes** with `git mv` per the Files list. Fix the relative `readFileSync(path.join(process.cwd(), "app/globals.css"))` — it's cwd-relative so it still works; leave it.

- [ ] **Step 7: `app/[lang]/layout.tsx`** — becomes the root layout:
  - `export function generateStaticParams() { return locales.map((lang) => ({ lang })); }` and `export const dynamicParams = false;`
  - Signature `export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> })`; `const { lang } = await params; if (!isLocale(lang)) notFound();` → `<html lang={htmlLang[lang]} …>`.
  - Keep `export const metadata` as-is for now (Task 6 turns it into `generateMetadata`).
- [ ] **Step 8: Every moved page** (`page.tsx`, `privacy/page.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`, both `opengraph-image.tsx`, `blog/layout.tsx`) accepts `params` with `lang` (narrow with `isLocale`), but renders unchanged English content. `blog/[slug]/page.tsx` params become `Promise<{ lang: string; slug: string }>`; its `generateStaticParams` returns `locales.flatMap((lang) => posts.map((p) => ({ lang, slug: p.slug })))` (keep the try/catch → `[]`). In `blog/[slug]/opengraph-image.tsx` the params type gains `lang`.
- [ ] **Step 9: 404s** —
  - `app/[lang]/[...rest]/page.tsx`: `import { notFound } from "next/navigation"; export default function CatchAll() { notFound(); }`
  - `app/[lang]/not-found.tsx`: `not-found` files cannot read params, so it renders `components/ui/NotFoundContent.tsx` — a `"use client"` leaf that takes no props, derives the locale via `usePathname()` + `stripLocale()`, reads `getDictionary(locale).notFound`, and links back with `localePath(locale, "/")`. Style it like the privacy page header (mono kicker, h1, back link) using `tokens`.
- [ ] **Step 10: Verify** — `pnpm --filter website typecheck && pnpm --filter website lint && pnpm --filter website test && pnpm --filter website build`. Then `pnpm --filter website start` (port 3000) in the background and check:
  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/            # 200
  curl -s localhost:3000/ | grep -o '<html lang="[a-z]*"'                 # lang="en"
  curl -s localhost:3000/vi | grep -o '<html lang="[a-z]*"'               # lang="vi"
  curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" localhost:3000/en/blog   # 301 …/blog
  curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/foo             # 404
  curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/vi/foo          # 404
  curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/sitemap.xml     # 200
  curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/feed.xml        # 200
  curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/icon.svg        # 200
  curl -sI localhost:3000/vi | grep -i content-security-policy             # present
  curl -s localhost:3000/ | grep -o 'rel="icon"[^>]*'                     # icon link still emitted
  ```
  The blog API may be unreachable locally; blog pages then render their error/empty states — that's acceptable for status checks as long as `/blog` returns 200. Stop the server afterwards.
- [ ] **Step 11: Commit** — `feat(i18n): move routes under [lang] and add locale routing in proxy`.

---

### Task 4: Localize homepage (sections, Nav, language switcher)

**Files:**
- Create: `apps/website/components/ui/LanguageSwitcher.tsx`
- Modify: `app/[lang]/page.tsx`, `components/sections/{Nav,HeroSection,TransformationsSection,WorkSection,ProjectsSection,StackSection,LatestBlogSection,EducationCertificatesSection,ContactSection}.tsx`, `components/blog/PostCard.tsx` (link via `localePath`, title/excerpt wrapped `lang="vi"`)

**Interfaces:**
- Consumes: `getDictionary`, `Dictionary`, `localePath`, `stripLocale`, `Locale`, `getProfile(locale)`, `formatDate/formatPeriod(…, locale)`.
- Produces: `LanguageSwitcher` (`"use client"`), props `{ label: string }` — renders `EN / VI` links. Uses `usePathname()`, normalizes with `stripLocale()` (works whether Next reports the visible or rewritten path), and links each locale to `localePath(target, path)`; the active locale is not a link (`aria-current="true"`, `tokens.accent` color). Styling matches Nav links (mono 12px, `tokens.colors.textFaint`). Wrap in `<nav aria-label={label}>`.
- Section prop convention: each section that has copy receives `locale: Locale` and `dict: Dictionary` (or the relevant slice, e.g. `dict: Dictionary["hero"]`) — pick slices, keep it consistent.

- [ ] **Step 1:** `app/[lang]/page.tsx` — `const { lang } = await params` (narrow), `const profile = getProfile(lang)`, `const dict = getDictionary(lang)`; pass `locale`/`dict` slices to sections.
- [ ] **Step 2:** Replace every hardcoded string listed under `nav`, `hero`, `transformations`, `sections`, `contact` in the dictionary. Hero headline renders `{lead} <span accent>{accent}</span>{" "}<span serif>—</span> {middle}{" "}<span underline>{underline}</span>` preserving existing styles. Contact heading: `{headingLead} <span accent>{headingAccent}</span>{headingTail}`. `TransformationsSection` takes its items from `dict.transformations.items` (delete the hardcoded array).
- [ ] **Step 3:** Links: Nav blog link → `localePath(locale, "/blog")`; ContactSection privacy → `localePath(locale, "/privacy")`; LatestBlogSection "all posts" → `localePath(locale, "/blog")`; `PostCard` gets a `locale` prop and links `localePath(locale, \`/blog/${slug}\`)`. Hash links (`#work` etc.) stay as-is.
- [ ] **Step 4:** Dates: `formatPeriod(…, locale)` / `formatDate(…, locale)` in Work/Education sections.
- [ ] **Step 5:** Add `<LanguageSwitcher label={dict.nav.language} />` at the end of the Nav links row (after contact), separated like other links. Check the mobile nav CSS in `app/globals.css` (`.nav-links`) still fits; if links overflow at 375px, allow wrap or reduce `gap` in the existing media query only.
- [ ] **Step 6:** Verify: typecheck, lint, test, build; `start` and confirm `curl -s localhost:3000/vi | grep -c "KINH NGHIỆM"` ≥ 1 and `curl -s localhost:3000/ | grep -c "EXPERIENCE"` ≥ 1; `curl -s localhost:3000/vi | grep -o 'href="/vi/blog"'` present. Grep the `/vi` HTML for leftover English section labels: `curl -s localhost:3000/vi | grep -E "SELECTED PROJECTS|LATEST FROM THE BLOG|available for select work"` → no output.
- [ ] **Step 7: Commit** — `feat(i18n): localize homepage and add language switcher`.

---

### Task 5: Localize blog chrome, privacy page and 404

**Files:**
- Modify: `app/[lang]/blog/layout.tsx`, `app/[lang]/blog/page.tsx`, `app/[lang]/blog/[slug]/page.tsx`, `app/[lang]/blog/[slug]/opengraph-image.tsx` (read time per locale), `app/[lang]/privacy/page.tsx`
- Modify: `components/blog/{BlogHeader,BlogFooter,PostRow,PostListWithLoadMore,PostNav,RelatedPosts,TableOfContents,ShareBar,TagPill?}.tsx`
- `components/blog/Pagination.tsx` is unused — leave it untouched.

**Interfaces:**
- Consumes: Task 2 + Task 4 (`PostCard` now takes `locale`).
- Client components (`PostListWithLoadMore`, `ShareBar`) receive their strings as props (`labels: { loadMore: string; loading: string }`, `labels: { share: string; copyLink: string; copied: string }`) and `locale` where they render links (`PostRow` used by `PostListWithLoadMore` needs `locale`).

- [ ] **Step 1: Blog layout** — read `lang` from params; `BlogHeader` gets `locale` + `dict.nav` and renders portfolio/blog/contact links via `localePath` (`/`, `/blog`, `/#contact`) plus `<LanguageSwitcher label={dict.nav.language} />`; `BlogFooter` gets `locale` + `labels` (privacy, backToPortfolio) and uses `getProfile(lang)` for name/city. **Remove `lang="vi"` from `<main>`** — the chrome is now in the page language; post content gets its own `lang="vi"` (Step 3).
- [ ] **Step 2: Blog list page** — all copy from `dict.blog` (kicker, title parts, description, empty, count line). Count line: `fill(total === 1 ? countOne : countMany, { count: total }) + " · " + fill(updated, { date })` where `date = new Date().toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", { month: "long", year: "numeric" }).toUpperCase()`. Pass `locale` and `labels` to `PostListWithLoadMore` → `PostRow` (links via `localePath`; post title/excerpt wrapper gets `lang="vi"`).
- [ ] **Step 3: Post page** — `← all posts`, `TAGGED`, `SHARE`, `← read more posts` from dict; back links via `localePath(lang, "/blog")`; `estimateReadTime(post.content, lang)`; wrap post header title + excerpt + `PostContent` + tag pills in elements carrying `lang="vi"` (e.g. `<h1 lang="vi">`, `<div lang="vi">` around TOC+content — TOC labels come from dict but TOC item text is post content, so put `lang="vi"` on the item list, not the label). `ShareBar` url stays the canonical `https://lequoctrung.vn/blog/${slug}` (both locales share the canonical), pass labels. `PostNav` gets `locale` + labels (prev/next/aria) and links via `localePath`. `RelatedPosts` gets `locale` + label and passes `locale` to `PostCard`. `TableOfContents` gets `label`/`ariaLabel` props. `generateMetadata` `notFound` title uses dict.
- [ ] **Step 4: OG image for posts** — use `estimateReadTime(post.content, lang)`; everything else unchanged.
- [ ] **Step 5: Privacy page** — all copy from `dict.privacy` (map `sections`), back links `localePath(lang, "/")`.
- [ ] **Step 6: Verify** — typecheck, lint, test, build, `start`:
  ```bash
  curl -s localhost:3000/vi/blog | grep -E "load more|all posts|No posts yet|WRITING"        # no output
  curl -s localhost:3000/blog | grep -E "BÀI LIÊN QUAN|MỤC LỤC|BÀI TRƯỚC"                    # no output
  curl -s localhost:3000/vi/privacy | grep -c "QUYỀN RIÊNG TƯ"                               # ≥ 1
  curl -s localhost:3000/vi/privacy | grep -E "WHAT IS COLLECTED|back home"                  # no output
  ```
  If the blog API is reachable (env `BLOG_API_BASE_URL` set), also pick a slug from `/feed.xml` and check `/vi/blog/<slug>` returns 200 with Vietnamese chrome (`THẺ`, `CHIA SẺ`) and `/blog/<slug>` with English chrome (`TAGGED`, `SHARE`).
- [ ] **Step 7: Commit** — `feat(i18n): localize blog chrome and privacy page`.

---

### Task 6: SEO — metadata, hreflang, canonical, JSON-LD, sitemap, OG, llms.txt

**Files:**
- Create: `apps/website/lib/i18n/seo.ts` (+ `seo.test.ts`)
- Modify: `app/[lang]/layout.tsx`, `app/[lang]/page.tsx`, `app/[lang]/privacy/page.tsx`, `app/[lang]/blog/page.tsx`, `app/[lang]/blog/[slug]/page.tsx`, `app/[lang]/opengraph-image.tsx`, `app/sitemap.ts`, `app/llms.txt/route.ts`

**Interfaces:**
```ts
// lib/i18n/seo.ts
export function localizedAlternates(locale: Locale, path: string): {
  canonical: string;
  languages: Record<"en" | "vi" | "x-default", string>;
};
// localizedAlternates("vi", "/blog") → { canonical: "/vi/blog", languages: { en: "/blog", vi: "/vi/blog", "x-default": "/blog" } }
```

- [ ] **Step 1: Failing test** `lib/i18n/seo.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { localizedAlternates } from "./seo";

test("localizedAlternates", () => {
  assert.deepEqual(localizedAlternates("vi", "/blog"), {
    canonical: "/vi/blog",
    languages: { en: "/blog", vi: "/vi/blog", "x-default": "/blog" },
  });
  assert.deepEqual(localizedAlternates("en", "/"), {
    canonical: "/",
    languages: { en: "/", vi: "/vi", "x-default": "/" },
  });
});
```
Run → FAIL; implement with `localePath`; run → PASS.

- [ ] **Step 2: Layout `generateMetadata({ params })`** — replaces `export const metadata`: title default/template from `getProfile(lang)`; description = `truncateForMeta(profile.basics.summary)`; `openGraph.locale = ogLocale[lang]`, `openGraph.alternateLocale = [ogLocale[other]]`, `openGraph.url = localePath(lang, "/")`, `siteName`; keep twitter + RSS alternate types; `alternates: { ...localizedAlternates(lang, "/"), types: { "application/rss+xml": "/feed.xml" } }`. JSON-LD built inside the component from `getProfile(lang)` + `getDictionary(lang).blog.siteName` (via `fill`), with `inLanguage: htmlLang[lang]` on `WebSite` and `Blog`; `Blog.url` = `${siteUrl}${localePath(lang, "/blog")}`.
- [ ] **Step 3: Page metadata** — `app/[lang]/page.tsx` adds `generateMetadata` with `alternates: localizedAlternates(lang, "/")`; privacy: title from dict, `alternates: localizedAlternates(lang, "/privacy")`; blog list: title "Blog", description `dict.blog.metaDescription`, `alternates: { ...localizedAlternates(lang, "/blog"), types: rss }`.
- [ ] **Step 4: Post metadata** — canonical stays `/blog/${slug}` for both locales, **no** `languages`; `openGraph.url` = `/blog/${slug}`; `openGraph.locale` stays `"vi_VN"` (content language). JSON-LD `BlogPosting` unchanged (`inLanguage: "vi"`).
- [ ] **Step 5: Home OG image** — `app/[lang]/opengraph-image.tsx` reads `lang` from params and uses `getProfile(lang)` (label + summary localized). Check the generated `og:image` URL in `/` and `/vi` HTML resolves with 200 (`curl -s localhost:3000/vi | grep -o 'property="og:image" content="[^"]*"'` then curl that path, stripping the origin).
- [ ] **Step 6: Sitemap** — for each of `/`, `/privacy`, `/blog` emit an entry for each locale (`url: siteUrl + localePath(locale, path)` with `alternates: { languages: { en: siteUrl + path, vi: siteUrl + localePath("vi", path) } }`); keep existing priorities/changeFrequency per path (privacy: `yearly`, 0.3). Posts unchanged (`/blog/<slug>` only).
- [ ] **Step 7: llms.txt** — after the summary line add `"", \`Vietnamese version: ${siteUrl}/vi\``.
- [ ] **Step 8: Verify** — typecheck, lint, test, build, `start`:
  ```bash
  curl -s localhost:3000/vi | grep -oE '<link rel="(canonical|alternate)"[^>]*>'
  # canonical …/vi ; alternate hreflang en → /, vi → /vi, x-default → /
  curl -s localhost:3000/vi/privacy | grep -o 'rel="canonical"[^>]*'   # …/vi/privacy
  curl -s localhost:3000/vi | grep -o 'og:locale" content="[^"]*"'       # vi_VN
  curl -s localhost:3000/sitemap.xml | grep -c "<loc>"                   # ≥ 6 (+ posts)
  curl -s localhost:3000/sitemap.xml | grep -c 'hreflang="vi"'           # ≥ 3
  curl -s localhost:3000/llms.txt | grep "/vi"
  ```
  With blog API reachable: `/vi/blog/<slug>` canonical is `https://lequoctrung.vn/blog/<slug>` and has no `hreflang`.
- [ ] **Step 9: Commit** — `feat(i18n): localized metadata, hreflang, sitemap alternates and OG`.

---

### Task 7: End-to-end verification + PROGRESS.md

**Files:**
- Modify: `PROGRESS.md` (add an "i18n (Vietnamese)" section: status, PR links, follow-up = translate blog post content later)
- Scratch only (not committed): Playwright script in the session scratchpad.

- [ ] **Step 1:** Fresh `pnpm --filter @new-portfolio/profile-schema validate && pnpm typecheck && pnpm lint && pnpm test && pnpm --filter website build` — all green.
- [ ] **Step 2:** `pnpm --filter website start`; Playwright (Chromium, `executablePath` per environment if needed) screenshots of `/`, `/vi`, `/blog`, `/vi/blog`, `/vi/privacy`, a 404 (`/vi/nope`) at 1280×800 and 375×812; click the language switcher on `/` and `/vi/blog` and assert the URL becomes `/vi` and `/blog`. Inspect screenshots for overflowing hero headline / nav on mobile; fix in the owning component if broken.
- [ ] **Step 3:** Scan `/vi`, `/vi/blog`, `/vi/privacy` visible text (`page.innerText("body")`) for leftover English UI words from the en dictionary (exclude names, tech terms, emails, blog post content) — fix any leaks.
- [ ] **Step 4:** Update `PROGRESS.md`; commit `docs: track i18n progress`.
