# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Check `PROGRESS.md` at the start of a new session — it tracks longer-running, cross-session tasks
(e.g. the domain migration currently in progress) and their next steps.

## Architecture

`profile.json` (root) is the single source of truth for all personal/career data, modeled on the
[JSON Resume](https://jsonresume.org/schema/) schema with light extensions (`highlights`/`tags` on
work and projects, for tailoring). Everything else derives from it:

```
profile.json (root, JSON Resume schema)
    │
    ├── packages/profile-schema  — zod schema + TS types + validator, imported by both apps
    ├── apps/website             — Next.js portfolio (lequoctrung.vn), reads profile.json at build time
    └── apps/cv-renderer         — react-pdf renderer, turns profile.json (or a tailored variant) into PDF
```

- `packages/profile-schema/src/schema.ts` defines `profileSchema` (zod) and the inferred `Profile` type.
  Both apps import this package as `@new-portfolio/profile-schema` — never duplicate the type/shape elsewhere.
- `apps/website/lib/profile.ts` loads and validates `profile.json` via `profileSchema.parse(...)`.
- `apps/cv-renderer/src/templates/master.tsx` is the react-pdf document component (composed from
  `src/components/*` building blocks and `src/theme.ts`); `src/render.tsx` is the CLI entry that
  validates an input JSON file and writes a PDF.
- **Tailored CV workflow**: there is no AI script in this repo. To produce a tailored CV, ask Claude Code
  (interactively, in this session) to read a job description plus `profile.json` and write a tailored
  profile JSON into `tailored/` (gitignored), then render it with the cv-renderer (see commands below).
  Keep the same `profileSchema` shape — only reorder/trim/reword content, don't invent facts.

This is a pnpm workspace monorepo (`pnpm-workspace.yaml`: `apps/*`, `packages/*`).

## Commands

Install once at the root:
```bash
pnpm install
```

Validate `profile.json` against the schema:
```bash
pnpm --filter @new-portfolio/profile-schema validate
```

Website (Next.js):
```bash
pnpm dev                 # next dev, from root (alias for --filter website dev)
pnpm --filter website build
pnpm --filter website lint
pnpm --filter website typecheck
```

CV renderer (react-pdf → PDF):
```bash
# Master CV: profile.json -> apps/cv-renderer/out/master-cv.pdf
pnpm --filter cv-renderer build:master

# Tailored CV: pass an explicit input/output path
cd apps/cv-renderer && pnpm tsx src/render.tsx ../../tailored/<name>.json out/<name>.pdf
```

Root-level scripts fan out via `pnpm -r <script>`: `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
Only `website` defines `lint`; `pnpm test` is currently a no-op since no package defines a `test`
script. `cv-renderer` has no plain `build` script — use `build:master` (above) or `build:tailored`
(needs explicit input/output args, see CV renderer commands).

## Conventions

- See `docs/CONVENTIONS.md` for component/template architecture rules (smart vs. dumb components in
  `apps/website`, building-block/theme/template structure in `apps/cv-renderer`).
- Never hand-edit data inside `apps/website` or `apps/cv-renderer` — all resume content lives in
  `profile.json` (or a `tailored/*.json` variant), edited directly or through Claude Code.
- `tailored/*.json` files are gitignored — they are generated, per-application artifacts, not source of truth.
- Dates in `profile.json` follow `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` (enforced by `profileSchema`).
- The website app uses `transpilePackages: ["@new-portfolio/profile-schema"]` in `next.config.mjs` since
  the schema package ships TypeScript source directly (no build step) — keep this in sync if the package
  is renamed or moved.

## Workflow

`main` and `develop` are both protected on GitHub (no direct pushes, PR + passing CI required, enforced
even for the repo owner). `main` is production — every merge auto-deploys to `lequoctrung.vn` via Vercel.
`develop` is the integration branch — it gets a Vercel preview deployment, never production.

- Feature/fix work: branch off `develop` as `feature/<name>` or `fix/<name>`, open a PR back into `develop`.
- Release: when `develop` is in a shippable state, open a PR `develop` → `main`.
- Urgent prod-only fix: branch off `main` as `fix/<name>`, PR into `main`, then a follow-up PR/merge
  `main` → `develop` to keep `develop` in sync.
- **Never commit directly to `main` or `develop`** — including from Claude Code. Always create a
  `feature/<name>` branch off `develop` first, then open a PR.
- CI (`.github/workflows/ci.yml`) runs `profile-schema validate`, `typecheck`, `lint`, and
  `website build` on every PR — these are the same commands listed under Commands above.
