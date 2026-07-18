---
name: tanstack-view-transition-morphs
description: "Per-element view-transition morphs (title/avatar/hero list-to-detail) in TanStack Router/Start SPAs. Includes the critical defaultViewTransition (not viewTransition) router option, the inject-a-script-into-main-world pattern to verify calls, and the per-slug uniqueness rule."
---

## Update — the silent footgun that made the morph "not work"

The router-level option to enable native view transitions in TanStack Router v1.170+ is **`defaultViewTransition`**, NOT `viewTransition`. Confirmed in `@tanstack/router-core/dist/esm/router.js:641`:

```js
const shouldViewTransition = this.shouldViewTransition ?? this.options.defaultViewTransition;
```

`createTanStackRouter` accepts arbitrary keys without error — `viewTransition: true` looks valid, type-checks, but the router NEVER reads it. `defaultViewTransition` stays `undefined` → `document.startViewTransition()` is NEVER called → instant swap with no morph. **No error, no warning, no visual transition.** The whole feature silently no-ops.

The correct wiring:
```ts
createTanStackRouter({
  routeTree,
  context,
  scrollRestoration: true,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultViewTransition: true,   // ← NOT viewTransition
})
```

Type signature is in `@tanstack/router-core/dist/esm/router.d.ts`: `defaultViewTransition?: boolean | ViewTransitionOptions`. There is also a per-`<Link>` `viewTransition` prop (singular) — but the router-wide enablement MUST be `defaultViewTransition`.

## How to verify the router actually calls `document.startViewTransition`

Per-`<Link>` visual inspection is not enough. `view-transition-name` and CSS may all be wired correctly, and `viewTransition: true` may be sitting in your router file, and **the morph still won't fire** because the wrong option name silently no-ops.

**Reliable internal check** — patch the global in the **main world** (NOT the agent-browser / DevTools isolated eval world):

```js
// Inject via a real <script> appended to document.documentElement, THEN click a Link.
// agent-browser eval and Chrome DevTools console run in an isolated world by default —
// their Window object is a different copy, so monkey-patching document.startViewTransition
// there does NOT count the router's main-world calls.
(() => {
  const s = document.createElement('script');
  s.textContent = `
    window.__vt_calls = 0;
    const o = document.startViewTransition.bind(document);
    document.startViewTransition = function(cb) {
      window.__vt_calls++;
      return o(cb);
    };
  `;
  document.documentElement.appendChild(s);
})();
// then click a Link via .click() and read window.__vt_calls.
// __vt_calls === 1 means the router really called document.startViewTransition.
// __vt_calls === 0 means the router option was silently misnamed.
```

**Visual proof with slugged duration** — temporarily inject a 3s duration to catch the morph mid-flight for screenshot verification:
```js
const s = document.createElement('style');
s.textContent = `
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) { animation-duration: 3s !important; animation-timing-function: linear !important; }
`;
document.head.appendChild(s);
// click a Link, capture screenshots every ~500ms; you'll see dual-state overlay: ghosted 
// old text bleeding through, image displaced mid-morph, header before/behind incoming title.
```

## Both option names — don't mix them up

| What you mean | Actual option |
|---|---|
| Router-wide always-on VT (Astro `<ViewTransitions />`-style) | `defaultViewTransition: true` on `createTanStackRouter({ ... })` |
| Per-link opt-in VT (only this specific link) | `viewTransition: true` prop on `<Link>` |
| Per-navigation VT from `router.navigate()` | `viewTransition: true` passed to `router.navigate({ ..., viewTransition: true })` |
| ❌ Looks right, types pass, silently no-ops | `viewTransition: true` on `createTanStackRouter({ ... })` |

## Symptom → cause cheatsheet

| Symptom | Likely cause |
|---|---|
| Cross-fade looks like a normal instant rerender (no fade, no morph) | `viewTransition: true` on router instead of `defaultViewTransition: true` — silently ignored |
| Cross-fade works but elements don't morph (just fade as one block) | Missing `view-transition-name` on elements — browser only morphs named elements |
| Two elements named identically on same snapshot | Browser SKIPS the whole transition (silent). Per-slug suffix each name. |
| Post-route component throws `params is not defined` | Use `Route.useParams()` in the component, `params` is only in `loader: ({ params }) => {}` |

---

# Original (full procedure, kept for reference)

# TanStack Router per-element View Transition morphs

Make a list-row's title/avatar/cover **morph** into the detail page's title/avatar/cover (Astro `<ViewTransitions>`-style shared-element transition) using the native View Transitions API in a TanStack Router / TanStack Start SPA.

## Whole-page cross-fade (the easy half)

TanStack Router v1.170+ supports the router-level option:
```ts
// src/router.tsx — IMPORTANT: option name is defaultViewTransition (see above)
createTanStackRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultViewTransition: true,
})
```
This produces a default 250ms whole-page cross-fade via `::view-transition-old(root)` / `::view-transition-new(root)`. **Hard reloads / new tab opens don't transition** — the API only fires on JS-driven navigations (router `<Link>` clicks, `router.navigate`). Falls back to React `startTransition` in browsers without `document.startViewTransition` (Firefox/Safari as of mid-2026) — `defaultViewTransition: true` is safe cross-browser.

CSS to dial to ≤0.5s impeccable + reduced-motion gated:
```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root),
  ::view-transition-group(*) {
    animation: none;
  }
}
```

## Per-element morphs (the part that doesn't "just work")

The browser only morphs elements with an explicit `view-transition-name`. Without naming, everything cross-fades as one block — **"I see the title/avatar/img all move" requires explicit names on both sides**.

### Mechanics (from Chrome's same-document VT guide + WICG explainer)
- Give the list-row version AND the detail-page version the **same** `view-transition-name`. The browser captures each separately and morphs position + size + content cross-fade between the two states.
- During the transition, named elements become **siblings** (the `::view-transition-group(name)` pseudo-tree is flat) — no parent clipping concerns.
- Default group animation: position/size via `transform`, width, height, plus an inner content cross-fade. Dial the duration via `::view-transition-group(*) { animation-duration: …; animation-timing-function: …; }` (the `*` wildcard matches all named groups).

### CRITICAL — the uniqueness footgun
**Every `view-transition-name` on a page must be unique at a single snapshot instant.** If two elements share the SAME name at the SAME time, the **transition is SKIPPED entirely** (silent failure — looks like an instant swap with no morph).

So shared morphs between a **list** (many items) and a **detail** (one item) require per-slug suffixing on the list side:
- ❌ `view-transition-name: post-title` on all 5 list rows → 5 dupes → SKIP
- ✅ `view-transition-name: post-title-${slug}` per row → 5 unique → morphs the matching row.

The detail page only has 1 of each name (the current slug) → unique → morphs cleanly. The non-matching list rows whose names don't appear on the detail side just fade out as normal exit-animation; the matching one morphs.

### Implementation pattern (React)
Use React's camelCase `viewTransitionName` inline style — no CSS classes needed (avoids Tailwind v4 variant-generation quirks for a custom property):

```tsx
// list row (inside .map(post => ...))
<span style={{ viewTransitionName: `post-title-${slugOf(post)}` }}>{post.title}</span>
{post.author.image && (
  <img src={post.author.image} alt="" referrerPolicy="no-referrer"
       style={{ viewTransitionName: `post-avatar-${slugOf(post)}` }} />
)}
{post.heroImage && (
  <img src={post.heroImage} alt="" referrerPolicy="no-referrer"
       style={{ viewTransitionName: `post-hero-${slugOf(post)}` }} />
)}
```

```tsx
// detail page
function BlogPost() {
  const { post } = Route.useLoaderData()
  const { slug } = Route.useParams()        // ← use route hook, NOT `params`
  return (
    <article>
      <h1 style={{ viewTransitionName: `post-title-${slug}` }}>{post.title}</h1>
      {post.author.image && (
        <img src={post.author.image} alt="" referrerPolicy="no-referrer"
             style={{ viewTransitionName: `post-avatar-${slug}` }} />
      )}
      {post.heroImage && (
        <img src={post.heroImage} alt="" referrerPolicy="no-referrer"
             style={{ viewTransitionName: `post-hero-${slug}` }} />
      )}
    </article>
  )
}
```

### Common gotchas (all hit during this build)
1. **`viewTransition` vs `defaultViewTransition` router option** — see the top of this skill. Misnaming is the #1 cause of "no morph happens." Type-checker doesn't catch it.
2. **`params` is not in scope in the component body.** The route `loader: ({ params }) => {...}` destructures `params` — that's a loader arg, NOT component scope. Inside the component use `Route.useParams()` to get the slug. Using `params.slug` in the component → `ReferenceError: params is not defined` → 500.
3. **`referrerPolicy="no-referrer"` on ALL images** is mandatory if the CDN hotlink-protects (returns 403 otherwise). The view-transition snapshot captures rendered pixels, so the image must ACTUALLY load — apply the attr to hero/cover AND inline-markdown images. For markdown: register a custom `image` renderer in `marked.use({ renderer: { image({href,title,text}) { return \`<img src="${href}" alt="${alt}" referrerpolicy="no-referrer" loading="lazy" />\` } } })`.
4. **Inline JSX edit footgun**: when a `<span>`/`<h1>` becomes multi-line (you added a `style={...}` prop), opening an `edit` SWAP that doesn't include the body on the same line silently duplicates attributes — always include the body + closing tag in the SWAP body, or re-read the file and re-write the block. Manifests as `Class value "…", key "…", and prop "style" assigned to same element` or `Adjacent JSX must be wrapped`.
5. **Conditional JSX closers**: when you insert content BEFORE a `{cond && (<X/>)}` block, the closing `)}` drifts. Always re-read after a multi-line edit before chaining more edits — count opens/closes manually.
6. **Isolated-world patching gotcha**: agent-browser's `eval` and Chrome DevTools console run in an ISOLATED world — `window` and `document` are separate copies. Monkey-patching `document.startViewTransition` there does NOT count the router's main-world calls. Inject via a real `<script>` element appended to `document.documentElement`. `getComputedStyle(el).viewTransitionName` returns the actual computed name → use as a definitive runtime check (better than grepping HTML). `typeof document.startViewTransition === 'function'` confirms capability. agent-browser isolated-world eval monkey-patching is unreliable for call-counting.
7. **`::view-transition-group(*)`** with the `*` wildcard matches all named groups — valid CSS (Chromium-only feature; FF/Safari without VT support just ignore it).

## Verifying the morph is actually configured (debug checklist)
1. Router option name correct? `grep defaultViewTransition src/router.tsx` → `defaultViewTransition: true`. NOT `viewTransition`.
2. Router actually calls startViewTransition? → inject `<script>` in main world that increments `window.__vt_calls` on a monkey-patched `document.startViewTransition`, click a Link, read `__vt_calls`. **Must be 1, not 0.** (Setting the wrong option name silently leaves it at 0 with no error.)
3. CSS served? `curl /src/styles.css | grep view-transition-group` → emits the rule.
4. List side has unique per-slug names? `curl /blog | grep -oE 'post-title-[a-z0-9-]+' | sort -u` → should list every slug, no dups.
5. Detail side has matching names? `curl /blog/$slug | grep -oE 'post-(title|hero|avatar)-$slug'` → 3 matches.
6. Names actually computed? `getComputedStyle(titleEl).viewTransitionName` and `getComputedStyle(heroEl).viewTransitionName` → return the configured names (proves the browser accepts the props, not just that they're in HTML).
7. Browser supports VT? `typeof document.startViewTransition === 'function'` → `'function'`.
8. Reduced-motion not gating at test time? `matchMedia('(prefers-reduced-motion: reduce)').matches` → `false` for the morph to run.
9. Uniqueness verified? `curl /blog | grep -oE 'post-(title|hero|avatar)-[a-z0-9-]+' | sort | uniq -c | awk '$1 > 1 {print "DUP:", $0}'` → no dups. If dupes exist, the browser SKIPS the entire transition (the documented footgun).
10. Visual proof when in doubt? Inject a 3s CSS duration override, click a Link, take screenshots every ~500ms. Mid-transition frames should show dual-state snapshot overlay (ghosted old text + displaced image + incoming new layout all blent). If you only see settled frames, the router option was misnamed or you're testing on a hard reload.

## Sources
- TanStack view-transitions example (note: example uses `defaultViewTransition` in commented-out form): https://tanstack.com/router/v1/docs/framework/react/examples/view-transitions
- TanStack Router source (`@tanstack/router-core/dist/esm/router.js:641`): `shouldViewTransition ?? this.options.defaultViewTransition`
- Chrome same-document VT guide (uniqueness rule, named groups, flat sibling tree): https://developer.chrome.com/docs/web-platform/view-transitions/same-document
- MDN view-transition-name: https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name
- WICG view-transitions explainer (multi-element, same name ⇒ skip): https://github.com/WICG/view-transitions/blob/main/explainer.md
