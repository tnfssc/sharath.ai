import { motion, useReducedMotion } from "motion/react";
import { Magnetic } from "#/components/magnetic";
import { Reveal } from "#/components/reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Project {
	name: string;
	href: string;
	description: string;
	tags: string[];
}

const projects: Project[] = [
	{
		name: "AtomR",
		href: "https://atom.sharath.uk",
		description: "Chain Reaction clone with realtime multiplayer",
		tags: ["Convex", "Vite", "React", "mise"],
	},
	{
		name: "zevium",
		href: "https://zevium.dev",
		description: "Open marketplace for random APIs",
		tags: ["Cloudflare Workers", "TanStack Start", "tRPC", "MCP", "SQLite"],
	},
	{
		name: "sharath.ai",
		href: "https://sharath.ai",
		description: "My website, definitive edition",
		tags: ["TanStack Start", "TypeScript", "Tailwind", "Cloudflare Workers"],
	},
	{
		name: "gai",
		href: "https://github.com/tnfssc/gai",
		description: "Fast AI command generator for the terminal",
		tags: ["Go", "OpenAI", "Docker", "GitHub Actions"],
	},
	{
		name: "Terminova",
		href: "https://terminova.dev",
		description:
			"Predictive AI autocomplete for the terminal, discontinued as the space evolved",
		tags: ["Rust", "TypeScript", "Tauri", "Wails", "Go", "OpenAI"],
	},
	{
		name: "@boi.gg/exception",
		href: "https://github.com/boi-gg/exception",
		description: "Tiny, typed, modular exception handling for TypeScript",
		tags: ["TypeScript", "NPM", "Vitest", "GitHub Actions"],
	},
	{
		name: "Self-hosted",
		href: "https://www.sharath.uk/self-hosted",
		description: "Personal VPS cluster running production services",
		tags: ["Docker Swarm", "Cloudflare Tunnel", "GlusterFS", "SOPS", "Linux"],
	},
];

const itemClassName = "py-5 first:pt-0 last:pb-0";

function ProjectLink({ project }: { project: Project }) {
	return (
		<a
			className="group block focus-visible:outline-2 focus-visible:outline-offset-4"
			href={project.href}
			rel="noreferrer"
			target="_blank"
		>
			<Magnetic>
				<span className="font-display text-lg font-medium link-draw group-hover:text-primary">
					{project.name}
				</span>
			</Magnetic>
			<p className="mt-1 text-sm text-base-content/60 transition-colors group-hover:text-base-content">
				{project.description}
			</p>
			<p className="mt-1.5 text-xs text-base-content/60 transition-colors group-hover:text-base-content/90">
				{project.tags.join(" · ")}
			</p>
		</a>
	);
}

export function Projects() {
	const reduce = useReducedMotion();

	return (
		<section className="px-6 py-20 md:px-8">
			<div className="mx-auto max-w-2xl">
				<Reveal>
					<h2 className="mb-6 text-2xl font-medium tracking-tight md:text-3xl">
						Projects
					</h2>
				</Reveal>

				<ul className="divide-y divide-base-300">
					{projects.map((project, i) =>
						reduce ? (
							<li key={project.name} className={itemClassName}>
								<ProjectLink project={project} />
							</li>
						) : (
							<motion.li
								key={project.name}
								className={itemClassName}
								initial={{ opacity: 0, y: 16 }}
								transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
								viewport={{ margin: "-60px", once: true }}
								whileInView={{ opacity: 1, y: 0 }}
							>
								<ProjectLink project={project} />
							</motion.li>
						),
					)}
				</ul>
			</div>
		</section>
	);
}
