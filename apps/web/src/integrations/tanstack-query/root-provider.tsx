import { QueryClient } from "@tanstack/react-query";

export function getContext(): { queryClient: QueryClient } {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60_000,
				retry: false,
			},
		},
	});

	return {
		queryClient,
	};
}
