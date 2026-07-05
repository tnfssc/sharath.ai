# DESIGN.md — sharath.ai

Impeccable-style design system for the portfolio. Every component reads this.

## Register

**Brand.** This is a personal portfolio — the impression *is* the product. Editorial,
personality-forward, restrained. Not an app dashboard.

## Typography

Pair two faces. Never use one for everything.

- **Display — Fraunces Variable** (`@fontsource-variable/fraunces`). Characterful serif with
  optical sizing. Used for: the name, section headings, project/company names. Set with a slight
  negative letter-spacing on large sizes only (`tracking-tight`), never crushed.
- **Body — Hanken Grotesk Variable** (`@fontsource-variable/hanken-grotesk`). Clean grotesk.
  Used for: all running text, descriptions, tags, nav.

Hierarchy (ratio ≥ 1.25 between steps; fewer sizes, more contrast):

| Role | Font | Size | Weight |
|---|---|---|---|
| Name (hero) | Fraunces | text-6xl → text-8xl | 500 |
| Section heading | Fraunces | text-2xl → text-3xl | 500 |
| Card/title | Hanken | text-base/lg | 600 |
| Body | Hanken | text-sm/base | 400 |
| Meta/tags | Hanken | text-xs | 500 |

Avoid: Inter, Geist, Space Grotesk, Instrument Serif (overused). No all-caps body. No eyebrow
pills above headings.

## Color

daisyUI themes, all 35 switchable via `data-theme`. Use **semantic** tokens only
(`text-base-content`, `bg-base-100/200`, `text-primary`, `border-base-300`). No `dark:` prefixes.
One primary accent per screen max. Default theme follows OS (light/dark).

## Layout — section variety (kill card-everywhere)

Each section gets a **distinct** treatment so the page has rhythm:

- **Hero** — centered, generous whitespace, large serif name, animated role, tagline, two text
  links (not buttons-as-cards).
- **Employment** — a real **vertical timeline** (connecting line + node dots), not cards.
- **Freelance** — **bordered rows** (top border dividers, no elevation), not cards.
- **Projects** — **numbered list rows** with hover affordance, not a 3-up card grid.
- **Open Source** — **inline running list** of compact links.
- **Tech Stack** — **dense inline prose** (comma/· separated), not a grid of pills.

## Elevation & edges

Commit to **one** edge treatment per surface — never a hairline border *and* a wide shadow together.
- Sections separated by vertical space + a single hairline rule, not card shadows.
- Hover states: subtle background shift (`hover:bg-base-200`) or a left/right border accent, not
  translate + drop shadow.

## Motion

Reveal-on-scroll is fine but content must be visible if motion fails (progressive enhancement).
Keep durations short (≤ 0.5s), one easing (`cubic-bezier(0.16, 1, 0.3, 1)`). No bouncing/wiggling.

## Anti-references (do not ship)

Purple gradients, glassmorphism, neon glow, top color bars on cards, side-stripe borders,
identical card grids, hairline+shadow combos, oversized hero headlines that fill the viewport.
