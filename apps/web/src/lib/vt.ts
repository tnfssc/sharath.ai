/**
 * Module-level flag: `true` while a view transition is in flight.
 *
 * Set synchronously by `beginViewTransition()` (called from the router's
 * `defaultViewTransition.types` callback, which runs BEFORE the React update
 * callback inside `document.startViewTransition(update)`). This lets components
 * read the flag during render and skip entrance animations (e.g. framer-motion
 * `initial`) that would otherwise poison the new-state snapshot with
 * `opacity: 0`.
 *
 * Cleared promptly on `viewtransitionend`. A 600ms self-reset fallback timer
 * (armed in `beginViewTransition`, re-armed on each call) guards against
 * skipped transitions that never fire `viewtransitionend` — so the flag can
 * never get stuck `true`. `undefined` sentinel = no timer armed;
 * `clearTimeout(undefined)` is a spec no-op.
 */
export const vtState = { active: false };

let fallbackTimer: NodeJS.Timeout | undefined;

/**
 * Mark a view transition as in-flight.
 *
 * Sets `vtState.active = true` synchronously and arms a 600ms self-reset
 * fallback timer. Re-entry clears any prior timer first (`clearTimeout`) so a
 * stale fallback from an earlier transition can't fire mid-transition and
 * prematurely clear the flag. The fallback is the safety net for transitions
 * that get skipped (reduced motion, no DOM change) and thus never dispatch
 * `viewtransitionend`; the normal path is cleared by that listener.
 */
export function beginViewTransition(): void {
	vtState.active = true;
	clearTimeout(fallbackTimer);
	fallbackTimer = setTimeout(() => {
		vtState.active = false;
		fallbackTimer = undefined;
	}, 600);
}

if (typeof document !== "undefined") {
	// Prompt clear: viewtransitionend fires when the snapshot animation
	// finishes. Cancel the pending fallback so it can't race this clear.
	document.addEventListener("viewtransitionend", () => {
		clearTimeout(fallbackTimer);
		fallbackTimer = undefined;
		vtState.active = false;
	});
}
