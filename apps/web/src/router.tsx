import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { beginViewTransition } from "./lib/vt";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		routeTree,
		context,
		scrollRestoration: true,
		defaultPreload: "intent",
		// View transitions: wraps every in-app navigation in
		// document.startViewTransition(). Named elements (blog-heading,
		// post-{kind}-{slug}) morph position+size; everything else cross-fades.
		// beginViewTransition() arms vtState.active here so components can skip
		// entrance animations (framer-motion initial) that would otherwise
		// poison the new-state snapshot.
		defaultViewTransition: {
			types: ({ fromLocation, toLocation }) => {
				beginViewTransition();
				const fromIndex = fromLocation?.state?.__TSR_index ?? 0;
				const toIndex = toLocation?.state?.__TSR_index ?? 0;
				return toIndex >= fromIndex ? ["navigate-forward"] : ["navigate-back"];
			},
		},
	});

	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
