import { useSyncExternalStore } from "react";

let mediaQuery: MediaQueryList | undefined;

function getMediaQuery() {
	mediaQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)");
	return mediaQuery;
}

function subscribe(onChange: () => void) {
	const query = getMediaQuery();
	query.addEventListener("change", onChange);
	return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
	return getMediaQuery().matches;
}

function getServerSnapshot() {
	return false;
}

/** Keep server and initial hydration markup identical, then follow OS changes. */
export function useReducedMotion() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
