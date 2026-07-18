import { createFileRoute } from "@tanstack/react-router";

import { Hero } from "#/components/past-work-fancy/hero";
import { OpenSource } from "#/components/past-work-fancy/oss";
import { Projects } from "#/components/past-work-fancy/projects";
import { Skills } from "#/components/past-work-fancy/skills";
import { Timeline } from "#/components/past-work-fancy/timeline";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div>
			<Hero />
			<Timeline />
			<Projects />
			<OpenSource />
			<Skills />
		</div>
	);
}
