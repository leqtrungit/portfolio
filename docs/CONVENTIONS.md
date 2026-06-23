# Component & Template Conventions

These rules exist so that future design handoffs (website) and reference layouts (CV PDF) can be
"dropped in" without re-architecting. They apply before any specific styling library or visual
design has been chosen — they govern structure and responsibility boundaries, not visuals.

## `apps/website` — smart vs. dumb components

```
apps/website/
├── app/                          # routes — compose sections/ only, no data calls, no raw JSX
├── components/
│   ├── ui/                       # dumb — presentational only
│   └── sections/                 # smart — data-aware, compose ui/
└── lib/
    ├── profile.ts                 # loads + validates profile.json
    └── tokens.ts                  # single source of design tokens (colors, spacing, typography)
```

1. **Dumb (`components/ui/*`)**: only accept a typed `Props` interface (named `<Component>Props`),
   never import `profile.json`, `getProfile()`, or any other data source. They don't decide page
   layout, only render what's passed in. Named exports only (no default export).
2. **Smart (`components/sections/*`)**: may call `getProfile()` or receive already-fetched data,
   map it into props for `components/ui/*`. Should not contain complex display JSX — compose it
   from `ui/`.
3. **`app/page.tsx` (and other routes)**: only compose `sections/*`. Never call `getProfile()`
   directly, never contain raw display JSX.
4. **Server vs. Client**: default to Server Components. `"use client"` is only ever placed on leaf
   components inside `ui/` that need interactivity (state/events) — never on `sections/` or routes.
5. **Styling**: no UI/styling library is chosen yet. Until one is, `components/ui/*` must not
   hardcode colors/spacing — read them from `lib/tokens.ts` (currently a stub). When a design
   handoff arrives, fill in `tokens.ts` and restyle `ui/*` — the architecture doesn't change.
6. **Naming**: filename matches component name (PascalCase), one component per file, `Props` type
   colocated in the same file unless reused across ≥2 files (then move to `components/ui/types.ts`).

## `apps/cv-renderer` — template architecture

```
apps/cv-renderer/src/
├── components/        # react-pdf building blocks (Heading, Section, ListItem) — props only
├── theme.ts            # single source of style values (colors, spacing, fonts)
├── templates/
│   └── master.tsx       # a complete document, composed from components/ + theme
└── render.tsx           # CLI entry — imports a template, validates input, writes PDF
```

1. **`components/*`**: only accept props, never import `Profile` or `profileSchema` — same rule as
   dumb components on the website side.
2. **`theme.ts`**: the single source of style values. Matching a new reference design (e.g. a
   layout produced by an external script) means editing `theme.ts` (and adding new `components/`
   only if the reference has a structurally different layout) — not rewriting templates from
   scratch.
3. **`templates/<name>.tsx`**: one template per file, composed from `components/` + `theme` (or a
   template-specific theme override). `master.tsx` is the current baseline.
4. **Adding a new template**: create `templates/<name>.tsx`; never modify an existing template to
   add a variant.
