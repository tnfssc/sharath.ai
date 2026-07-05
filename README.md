# sharath.ai

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Personal portfolio + blog for Sharath. Built with TanStack Start, deployed to Cloudflare Workers.

## Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (SSR, file-based routing, server functions) |
| Styling | daisyUI 5 (all 35 themes) + Tailwind v4 + shadcn primitives (Radix) |
| Typography | Fraunces Variable (display serif) + Hanken Grotesk Variable (body) |
| Blog | File-based markdown via content-collections |
| Animations | Motion (framer-motion) |
| Deployment | Cloudflare Workers via `@cloudflare/vite-plugin` |

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server on port 3000 |
| `pnpm build` | Production build (client + Workers SSR bundle) |
| `pnpm preview` | Preview the production build locally |
| `pnpm deploy` | Build + deploy to Cloudflare Workers |
| `pnpm cf-typegen` | Generate Cloudflare env types via wrangler |
| `pnpm generate-routes` | Regenerate TanStack route tree |
| `pnpm test` | Run Vitest |
| `pnpm lint` | Biome lint |
| `pnpm format` | Biome format |
| `pnpm check` | Biome check (lint + format) |

## Deploy

Deploying requires a Cloudflare account and wrangler authentication:

```bash
npx wrangler login     # one-time
pnpm deploy            # build + wrangler deploy
```

The `wrangler.jsonc` config uses `nodejs_compat` and points `main` at
`@tanstack/react-start/server-entry`.

## Project structure

```
src/
├── components/
│   ├── past-work-fancy/    # Portfolio sections (hero, timeline, freelance, projects, oss, skills)
│   ├── ui/                 # Reusable UI primitives (disco-lights, flip-words, vibe-reveal, etc.)
│   ├── hero-tagline.tsx    # Per-character tagline flip animation
│   ├── social-icons.tsx    # Social links with magnetic + liquid-fill interactions
│   ├── magnetic.tsx        # Cursor-follow spring effect
│   ├── ThemeToggle.tsx     # Theme switcher (35 daisyUI themes)
│   ├── Header.tsx          # Non-sticky header with logo
│   ├── Footer.tsx
│   ├── DefaultCatchBoundary.tsx
│   └── NotFound.tsx
├── lib/
│   ├── blog.ts             # Blog post collection access
│   ├── markdown.ts         # marked + highlight.js rendering
│   ├── seo.ts              # Meta tags
│   ├── vt.ts               # View Transition state management
│   └── use-vibe-audio.ts   # Audio playback hook
├── routes/
│   ├── __root.tsx          # Root layout (theme, fonts, providers)
│   ├── index.tsx           # Home page
│   └── blog/
│       ├── index.tsx       # Blog list
│       └── $slug.tsx       # Blog post
├── styles.css              # Tailwind + daisyUI + custom CSS
└── router.tsx
content/
└── blog/                   # Markdown blog posts
public/
├── audio/                  # Vibe audio clips
├── icon.svg                # Favicon + PWA icons
└── robots.txt
```

## Design system

See [DESIGN.md](./DESIGN.md) for the full design system (type pairing, section treatments, anti-slop rules).

## Blog

Posts live in `content/blog/*.md` with frontmatter:

```markdown
---
title: Post Title
description: Short description
date: 2024-01-01
tags: [tag1, tag2]
author:
  name: Author Name
---

Markdown body...
```

Rendered with `marked` (headings, lists, code blocks) + `highlight.js` (syntax highlighting). Heading IDs auto-generated for anchor links.
