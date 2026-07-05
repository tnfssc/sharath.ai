# Migration plan: sharath.boi.gg → sharath.ai

Migrate the live personal site (`~/Code/sharath.boi.gg`, mature TanStack Start site) onto the
fresh `create-tanstack-app` scaffold (`~/Code/sharath.ai`). Both are TanStack Start, so this is a
content + features + backend migration, not a rewrite.

## Locked decisions

| Decision | Choice |
|---|---|
| **Backend** | Move to **Convex** (Phase 3) — not Drizzle/Turso |
| **Blog** | **File-based markdown** via content-collections — drop Outline + Turso blog tables |
| **Sequencing** | **Static site first** (home + portfolio + theme + UI), then blog, then backend |
| **ResumeAssistant** (old scaffold feature) | **Delete** |
| **Styling** | **Full restyle** with **daisyUI 5 + shadcn primitives** — do NOT port the old visual language |

Source-of-truth for these: this file + project memory.

---

## Phase 0 — Clean baseline

Strip the new project's template/demo cruft so what remains is a real foundation.

**Delete:**
- `src/routes/demo/**` — guitars, ai-chat, ai-image, form demos, table, store, tanstack-query demo, tts/transcription/structured/image
- `src/routes/api.ai.*` — demo AI endpoints
- Fake content: `content/jobs/*` (Initech/Initrode), `content/education/*` (code-school) + their `content-collections.ts` collections
- `convex/todos.ts` + its `schema.ts` entry, `src/routes/convex.tsx`, `src/components/.../convex/provider.tsx` (keep the convex dep for Phase 3)
- `src/lib/demo-*`, `src/hooks/demo.*`, demo components (`demo.*.tsx`, `demo-GuitarRecommendation`, `demo-AIAssistant`, `demo.FormComponents`)
- **`src/components/ResumeAssistant*`, `src/lib/resume-*`, `src/lib/resume-ai-hook.*`** — delete
- Unused shadcn primitives left orphaned after the above
- Regenerate `src/routeTree.gen.ts` (`nub run generate-routes`) so dead routes disappear

**Gate:** `nub run dev` boots, `/` renders the default page, no broken imports.

---

## Phase 1 — Static site (home + portfolio + theme + UI) + full restyle

The big phase. Port the live site's read-only experience with a **fresh daisyUI + shadcn** visual
design — structure/data ports from the old site; styling does NOT.

### 1a. Styling system setup (do this first)

Reference: https://daisyui.com/SKILL.md (daisyUI 5, official skill doc).

- `nub add -D daisyui@latest`, add `@plugin "daisyui";` to `src/styles.css`.
- **Support ALL built-in daisyUI themes** — enable every theme in the plugin config, not a single
  custom palette:
  ```css
  @plugin "daisyui" {
    themes: light --default, dark --prefersdark, cupcake, bumblebee, emerald, corporate, synthwave,
      retro, cyberpunk, valentine, halloween, garden, forest, aqua, lofi, pastel, fantasy, wireframe,
      black, luxury, dracula, cmyk, autumn, business, acid, lemonade, night, coffee, winter, dim, nord,
      sunset, caramellatte, abyss, silk;
  }
  ```
  Theme is chosen at runtime via `data-theme="NAME"` on `<html>`.
- **Theme switcher UI:** a control (daisyUI `dropdown`/`menu` or the `theme-controller` pattern)
  listing all themes; sets `data-theme` on `<html>` and persists to `localStorage`. Replaces the old
  `theme-provider`/`theme-toggle` (port the toggle's placement, reimplement on daisyUI's theme system).
- **Anti-flash:** inline script in `<head>` that reads `localStorage` and sets `data-theme` before
  first paint (avoid FOUC / hydration mismatch on SSR).
- **Theme-aware color bridge (load-bearing):** shadcn primitives must adapt to whichever daisyUI
  theme is active. Do NOT hardcode oklch in `:root`. Instead reference daisyUI's theme tokens by
  `var()`: map shadcn `--background`→`var(--color-base-100)`, `--foreground`→`var(--color-base-content)`,
  `--primary`→`var(--color-primary)`, `--primary-foreground`→`var(--color-primary-content)`,
  `--border`/`--input`→`var(--color-base-300)`, `--ring`→`var(--color-primary)`, etc. This way the
  shadcn utilities (`bg-background`, `text-foreground`) swap automatically with the daisyUI theme.
- **Convention:** use daisyUI semantic color names (no `dark:` prefixes). Use daisyUI component
  classes for visual/layout (card, timeline, tabs, hero, badge, collapse, step, stat). Use shadcn
  (Radix) primitives only for headless/complex interactions daisyUI doesn't cover well
  (combobox, dropdown, dialog, popover, hover-card). Drop `tw-animate-css`/`tailwindcss-animate`
  unless something needs them.

### 1b. Port structure + reimplement visuals

| Area | Action | From old (boi.gg) |
|---|---|---|
| **Shell** | Rebuild `__root.tsx` (QueryClient + PostHog + daisyUI theme), `providers.tsx`, `DefaultCatchBoundary`, `NotFound` | `routes/__root.tsx`, `components/{providers,DefaultCatchBoundary,NotFound}.tsx` |
| **Home `/`** | Port hero, restyle | `routes/index.tsx` + `ui/flip-words`, `ui/screen-center` |
| **Portfolio** | Port **structure + data**, full restyle (use daisyUI `timeline`, `card`, `tabs`, `badge`, `stat`, `collapse`) | `routes/past-work.tsx`, `routes/past-work-fancy.tsx`, `components/past-work-fancy/{hero,skills,projects,freelance,timeline,oss}.tsx`, `components/sidebar.tsx` |
| **Utils** | Port as-is | `lib/utils/{cn,seo,time}`, `lib/hash`, `lib/polyfill` |
| **Assets** | Port branding | `public/{icon.svg,icon.png,site.webmanifest}` |

**Mechanical carry-over for every ported file:** alias swap `~/...` → `#/...`; `appCss?url` →
`styles.css?url`; React Query `QueryClient` wiring into new root.

**Leave behind (Phase 1):** `routes/{ping,upload-to-cdn,blog/**}`, all `lib/{auth,trpc,s3,server,
cache,outline,services}`, `routes/api/*`, `src/db/*`.

### 1c. Component discovery protocol (per daisyUI skill)
Before writing daisyUI markup for each portfolio section, read 2–3 candidate component docs from
https://daisyui.com/components/ and pick the best fit by intent (e.g. `timeline` for the career
timeline, `tabs`/`collapse` for skills, `card`+`stat` for projects/oss).

**Gate:** `nub run dev` → `/` hero renders + animates, `/past-work-fancy` shows all sections
(hero, skills, projects, freelance, timeline, oss), light/dark toggle works, responsive sidebar
works, no console errors.

---

## Phase 2 — Blog on file-based markdown

- Add a `blog` collection to `content-collections.ts` (zod schema: title, slug, description,
  date, tags, author{name, social, image}, content). Directory `content/blog/`.
- Convert existing posts → `content/blog/*.md` (export from Outline once, then pure files).
- Port + restyle routes: `/blog` (list) and `/blog/$slug` (post). Use daisyUI `card`/`hero`/`prose`
  for the post body; keep `marked` + `highlight.js` (already deps) for rendering, or `streamdown`.
- Author info → frontmatter (replaces `blog_author` table).
- **Leave behind:** `routes/blog/create*` authoring UI, `lib/outline`, `lib/services/md-to-html`,
  Turso `blog_post`/`blog_author` tables.

**Gate:** blog index lists posts; `$slug` renders markdown with syntax highlighting; no external
runtime deps (no Outline, no DB).

---

## Phase 3 — Convex backend (deferred; re-architect)

Detail when we get here. Sketch:
- **Schema** → Convex `schema.ts`: auth tables (`user/session/account/verification`) + `cache` +
  any data the portfolio/admin needs.
- **Auth:** Convex Auth (Google OAuth) replacing Better Auth — or Better Auth w/ Convex adapter if
  the existing API surface is worth keeping. Decision point.
- **API:** old tRPC server fns → Convex queries/mutations (or a thin server-function layer for
  things that must stay server-side, e.g. Turnstile verification, webhook ingest).
- **Files:** Convex file storage vs. keep Cloudflare R2 — decision point.
- **Protected routes/admin:** reintroduce behind auth as needed.
- **Deploy:** Convex + frontend host. Decide whether to stay on Cloudflare or move off.

---

## Risks / notes

- **daisyUI + shadcn color bridge** is the subtlest part — both define theme tokens; keep them in
  sync via shared CSS vars so neither system goes off-theme.
- **Portfolio components** have data + UI-dependency shapes I haven't fully read yet; read each
  component + the old `ui/*` it imports before porting, bring only what's referenced.
- **`nub`** installs deps into a global virtual store outside the project root — `vite.config.ts`
  already has the `server.fs.allow` fix for this; don't remove it.
- **Linter/formatter:** new project uses **Biome** (old used oxlint/oxfmt). Don't port the old
  eslint/oxlint configs; follow Biome.
- Old `package.json` uses pnpm + `tsgo`/`tsc`; new uses nub + Biome. Port code, not tooling config.
