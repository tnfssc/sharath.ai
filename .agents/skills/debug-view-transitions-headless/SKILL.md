---
name: debug-view-transitions-headless
description: "Debug View Transitions API animations in headless Chromium where screenshots can't capture the overlay layer. Uses document.getAnimations(), dataset attributes, and types-callback instrumentation instead of visual verification."
---

# Debug View Transitions in headless Chromium

## The core problem

Headless Chromium (agent-browser, Puppeteer, Playwright with `--headless=old`) **cannot render the View Transitions overlay layer**. Screenshots taken during a deliberately-slowed 3-second transition have identical MD5 hashes — the compositor captures only the settled final state, never the in-flight `::view-transition-*` pseudo-elements. Visual verification is impossible.

## What DOESN'T work

- ❌ Screenshots during transition (identical bytes, no overlay visible)
- ❌ `agent-browser eval` monkey-patching `document.startViewTransition` (runs in an **isolated world** — `window` and `document` are separate copies; the patch doesn't reach the app's main-world calls)
- ❌ `<script>` element injection via eval `textContent` (script elements inserted via `textContent` don't auto-execute per HTML spec; only `<script src>` elements do)
- ❌ `viewtransitionstart`/`viewtransitionend` events in headless (may not fire reliably)

## What DOES work

### 1. Verify `view-transition-name` is applied (computed style)

```js
// agent-browser eval — this CAN read computed styles from the isolated world
const el = document.querySelector('h1')
getComputedStyle(el).viewTransitionName  // → "blog-heading" or "none"
```

This proves the browser accepts the inline `style={{ viewTransitionName: '...' }}` — not just that it's in the HTML.

### 2. Verify `startViewTransition` capability + CSS support

```js
typeof document.startViewTransition  // → "function" if supported
CSS.supports('selector(:active-view-transition-type(a))')  // → true if types supported
```

### 3. Verify the `types` callback fires (dataset attribute bridge)

The `types` callback in `defaultViewTransition: { types: ({ fromLocation, toLocation }) => [...] }` runs in the **main world** (it's part of the app's router code). Write to `document.documentElement.setAttribute('data-vt-debug', ...)` inside the callback — `document.documentElement` (`<html>`) is shared between isolated and main worlds, so `agent-browser eval` can read the attribute back.

```ts
// In router.tsx (main world):
defaultViewTransition: {
  types: ({ fromLocation, toLocation }) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-vt-debug', `${fromLocation?.pathname} → ${toLocation?.pathname}`)
    }
    return ['navigate-forward']
  },
}
```

```js
// In agent-browser eval (isolated world):
document.documentElement.getAttribute('data-vt-debug')  // → "/ → /blog" or null
```

**This is how I discovered the root cause of a 2-day debugging session**: the `types` callback fired for `/blog → /` but NOT for `/ → /blog`. The cause: the Hero's Blog link used `<motion.a href="/blog">` (a plain anchor tag) instead of TanStack Router's `<Link to="/blog">`. Plain `<a>` tags are intercepted for SPA navigation but don't go through `router.navigate()` which calls `startViewTransition`. Only `<Link>` components trigger view transitions.

### 4. Inspect running animations via `document.getAnimations()`

During a VT, the browser creates animations on `::view-transition-*` pseudo-elements. These are accessible via `document.getAnimations()` — but ONLY from the main world. To access them from headless, add the inspection code to your app's source (not via eval injection):

```ts
// In your app's VT module (e.g., src/lib/vt.ts):
document.addEventListener('viewtransitionstart', () => {
  requestAnimationFrame(() => {
    const anims = document.getAnimations()
    const summary = anims.map(a => ({
      name: a.animationName,
      duration: a.effect?.getTiming()?.duration,
      easing: a.effect?.getTiming()?.easing,
      keyframes: a.effect?.getKeyframes()?.map(k => `${k.opacity ?? '?'}@${k.offset}`),
    }))
    document.documentElement.setAttribute('data-vt-anims', JSON.stringify(summary))
  })
})
```

The animation names follow the pattern `-ua-view-transition-group-anim-{name}` for group animations and `-ua-view-transition-old-anim-{name}` / `-ua-view-transition-new-anim-{name}` for old/new image animations. Custom CSS `@keyframes` show their actual names.

### 5. Check served CSS (Vite JS module extraction)

Tailwind v4 processes CSS and wraps it in a JS module. To verify rules survived processing:

```bash
curl -s "http://localhost:3000/src/styles.css" | python3 -c "
import re, sys
js = sys.stdin.read()
m = re.search(r'const __vite__css = \"(.*?)\"\n__vite__updateStyle', js, re.S)
if m:
  css = m.group(1).replace('\\\\n','\n')
  print('keyframes vt-fade-out:', 'keyframes vt-fade-out' in css)
  print('blog-heading rules:', 'blog-heading' in css)
"
```

Tailwind v4 strips comments from raw CSS but **preserves all rules** including `::view-transition-*` pseudo-element selectors and `@keyframes`.

### 6. Check for duplicate `view-transition-name` (uniqueness footgun)

If two elements share the same `view-transition-name` at the same snapshot instant, the browser **SKIPS the entire transition** silently. Check:

```bash
curl -s "http://localhost:3000/blog" | grep -oE 'view-transition-name:[^;\"]*' | sort | uniq -c | awk '$1 > 1 {print "DUP:", $0}'
```

### 7. Check for entrance animations poisoning the snapshot

Framer-motion `initial={{ opacity: 0 }}` fires on every component mount, including in-app navigations during a VT. The new-state snapshot captures `opacity: 0` → morphs from visible-old to invisible-new → looks like a flash/fade, not a morph.

**Symptom**: morph works in one direction (e.g., `/blog → /` where the old page has no entrance animation) but not the other (e.g., `/ → /blog` where the new page has framer-motion `initial`).

**Fix**: Module-level flag set in the `types` callback (which runs BEFORE the React update callback), read during render to skip `initial`:

```ts
// src/lib/vt.ts
export const vtState = { active: false }
// cleared on viewtransitionend or 600ms fallback

// src/router.tsx
defaultViewTransition: {
  types: () => { vtState.active = true; return ['navigate-forward'] },
}

// src/components/Hero.tsx
<motion.h1 initial={vtState.active ? false : { opacity: 0, y: 24 }}>
```

### 8. Verify navigation uses `<Link>` not `<a>` (the #1 cause of "no VT")

TanStack Router's `<Link>` component calls `router.navigate()` which wraps the update in `document.startViewTransition()`. Plain `<a href="/path">` tags are intercepted for SPA navigation but DON'T go through `startViewTransition` — no VT fires, no morph happens.

**Check**: `grep -r "motion.a\|<a " src/components/ | grep href` — if any internal links use plain `<a>` instead of `<Link>`, the VT won't fire for those navigations.

**Fix**: Use `motion.create(Link)` for internal links:

```tsx
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'

const MotionLink = motion.create(Link)

// For internal links:
<MotionLink to="/blog" style={{ x: sx, y: sy }} whileTap={{ scale: 0.97 }}>
  {children}
</MotionLink>

// For external links:
<motion.a href="https://example.com" target="_blank" rel="noreferrer">
  {children}
</motion.a>
```

## Debug flowchart

```
VT doesn't work?
├─ Check types callback fires (dataset attr bridge)
│  ├─ NOT CALLED → navigation uses <a> not <Link> → switch to <Link>
│  └─ CALLED → VT fires but morph invisible
│     ├─ Check getComputedStyle(el).viewTransitionName on both pages
│     │  └─ "none" → inline style not applied → check React rendering
│     ├─ Check for duplicate names (uniq -c) → SKIP if dupes
│     ├─ Check new-page elements opacity (framer-motion initial poisoning)
│     │  └─ opacity=0 → add vtState.active gate
│     └─ Check CSS served (Vite module extraction) → rules stripped?
└─ Check document.startViewTransition exists → browser support
```

## Headless-only gotcha summary

| Technique | Works in headless? | Why |
|---|---|---|
| Screenshots during VT | ❌ | Compositor captures settled state, not overlay |
| `getComputedStyle().viewTransitionName` | ✅ | DOM is shared between worlds |
| `document.documentElement.setAttribute` bridge | ✅ | `<html>` is shared between worlds |
| `CSS.supports(...)` | ✅ | Shared API |
| Monkey-patch via eval | ❌ | Isolated world, separate `document` |
| `<script src>` injection | ⚠️ | Executes in main world, but timing-sensitive |
| `document.getAnimations()` via eval | ❌ | Isolated world, separate animations |
| `document.getAnimations()` via app source | ✅ | Runs in main world |
| `viewtransitionstart/end` events | ⚠️ | May not fire in headless — use dataset bridge instead |
| Served CSS extraction from Vite module | ✅ | Server-side, no browser needed |
