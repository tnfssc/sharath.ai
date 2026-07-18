import { useEffect, useLayoutEffect } from "react";

/**
 * Module-level scroll-state for the blog index page.
 *
 * Why: TanStack's `scrollRestoration: true` saves scroll positions keyed by
 * each history entry's `__TSR_key` into sessionStorage — but a forward-push
 * `<Link to="/blog">` mints a NEW `__TSR_key`, so the cached scroll for the
 * previous /blog entry never matches → TanStack falls through to its default
 * `scrollTo({top:0})`. The user reports landing at the top of the list after
 * pressing "Back to blog" from an article — even though they scrolled down
 * before opening the post.
 *
 * This bypasses that mechanism: the module holds the last scrollY captured
 * while the blog list was on screen, and restores it on the next mount via
 * `useLayoutEffect` (synchronous, runs before paint — and before the View
 * Transition captures its new-state snapshot, so the morph lands at the
 * correct scroll position). Module state resets on full reload (which loses
 * scroll anyway) and is isolated per tab (each tab is its own JS realm).
 *
 * `useBlogScrollRestoration()` is called once by BlogIndex. It installs the
 * restore-on-mount effect and a rAF-throttled scroll listener that persists
 * the position as the user scrolls. The listener is removed on unmount.
 */
let savedBlogScroll = 0;

export function useBlogScrollRestoration(): void {
	useLayoutEffect(() => {
		if (savedBlogScroll > 0) window.scrollTo(0, savedBlogScroll);
	}, []);

	useEffect(() => {
		let ticking = false;
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				savedBlogScroll = window.scrollY;
				ticking = false;
			});
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
}
