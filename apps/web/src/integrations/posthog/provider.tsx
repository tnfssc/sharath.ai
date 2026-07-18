import { PostHogProvider as BasePostHogProvider } from "@posthog/react";
import posthog from "posthog-js";
import type { ReactNode } from "react";

// Validate the key format before initialising — a missing/garbage key would
// otherwise init posthog with junk and silently leak events to nowhere, or
// worse, to a mistyped host. PostHog public keys are `phc_` + base62.
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const isValidPostHogKey = (key: unknown): key is string =>
	typeof key === "string" && /^phc_[A-Za-z0-9]{20,}$/.test(key);

if (typeof window !== "undefined" && isValidPostHogKey(POSTHOG_KEY)) {
	posthog.init(POSTHOG_KEY, {
		api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
		person_profiles: "identified_only",
		capture_pageview: false,
		defaults: "2025-11-30",
		// PII hardening: disable autocapture of arbitrary element interactions
		// (which would otherwise send raw textContent/attributes), and mask all
		// text + inputs in any session recordings. `maskTextSelector: '*'`
		// masks every text node (the SDK has no `maskAllText` flag).
		autocapture: false,
		mask_all_text: true,
		mask_all_element_attributes: true,
		session_recording: {
			maskTextSelector: "*",
			maskAllInputs: true,
		},
	});
}

// TODO(privacy): add an explicit consent banner and gate posthog.init behind
// user opt-in. Currently the SDK initialises on load for all visitors. Out of
// scope for this PR — tracked separately.

interface PostHogProviderProps {
	children: ReactNode;
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
	return <BasePostHogProvider client={posthog}>{children}</BasePostHogProvider>;
}
