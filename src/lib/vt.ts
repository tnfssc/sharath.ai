/**
 * Module-level flag: `true` while a view transition is in flight.
 *
 * Set synchronously in the router's `defaultViewTransition.types` callback,
 * which runs BEFORE the React update callback inside
 * `document.startViewTransition(update)`. This lets components read the flag
 * during render and skip entrance animations (e.g. framer-motion `initial`)
 * that would otherwise poison the new-state snapshot with `opacity: 0`.
 *
 * Cleared on `viewtransitionend` (or a 600ms fallback timeout).
 */
export const vtState = { active: false }

if (typeof document !== 'undefined') {
  document.addEventListener('viewtransitionend', () => {
    vtState.active = false
  })
  // Fallback: if viewtransitionend doesn't fire (e.g. transition skipped),
  // clear after 600ms — enough for the 0.4s animation + buffer.
  document.addEventListener('viewtransitionstart', () => {
    setTimeout(() => { vtState.active = false }, 600)
  })
}
