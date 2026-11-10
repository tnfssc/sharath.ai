import { createFileRoute } from "@tanstack/react-router";

import { Hero } from "#/components/past-work-fancy/hero";
import { OpenSource } from "#/components/past-work-fancy/oss";
import { Projects } from "#/components/past-work-fancy/projects";
import { SideQuests } from "#/components/past-work-fancy/side-quests";
import { Skills } from "#/components/past-work-fancy/skills";
import { Timeline } from "#/components/past-work-fancy/timeline";
import { getLatestVideos } from "#/lib/youtube";

export const Route = createFileRoute("/")({
	loader: () => getLatestVideos(),
	// Uploads are rare; don't refetch on every in-app visit to the home page.
	staleTime: 60 * 60 * 1000,
	component: Home,
});

function Home() {
	const videos = Route.useLoaderData();

	return (
		<div>
			<Hero />
			<Timeline />
			<Projects />
			<OpenSource />
			<Skills />
			<SideQuests videos={videos} />
		</div>
	);
}
