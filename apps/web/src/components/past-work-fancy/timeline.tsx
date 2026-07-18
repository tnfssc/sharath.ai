import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { MagicLink } from "#/components/magic-link";
import { Reveal } from "#/components/reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Job {
	company: string;
	href: string;
	period: string;
	role: string;
	items: { title: string; description: string; tags: string[] }[];
}

const jobs: Job[] = [
	{
		company: "Writer",
		href: "https://writer.com/",
		period: "Aug 2025 – now",
		role: "Software Engineer",
		items: [
			{
				title: "Durable agent runtime",
				description:
					"Resumable runs, SSE reconnects, replay deduplication, cancellation, recovery, checkpoints, and Restate workflows",
				tags: ["Python", "Redis Streams", "SSE", "Restate"],
			},
			{
				title: "Nested agents",
				description:
					"Parent-child orchestration with background execution, fan-in, inherited context and tools, durable artifacts, and cancellation cascades",
				tags: ["Multi-agent systems", "Python", "React"],
			},
			{
				title: "Agent Skills + Playbooks",
				description:
					"Reusable package-backed capabilities, chat-driven authoring, sandbox execution, scheduling, import/export, and embedded playbook runs",
				tags: ["Agent Skills", "Playbooks", "Sandboxes"],
			},
			{
				title: "LLM, tools + browser platform",
				description:
					"Provider routing and failover, prompt caching, MCP authorization, model catalogs, browser automation, and usage observability",
				tags: ["LLM routing", "MCP", "Stagehand", "Daytona", "Langfuse"],
			},
			{
				title: "Full-stack product + foundations",
				description:
					"Streaming agent UI, nested-run navigation, presentations, multimodal output, safer persistence boundaries, and 73% faster frontend tests",
				tags: ["TypeScript", "React", "Postgres", "GitHub Actions"],
			},
		],
	},
	{
		company: "Kortix AI",
		href: "https://kortix.ai/",
		period: "May 2025 – Aug 2025",
		role: "Freelance Software Engineer",
		items: [
			{
				title: "AI platform",
				description:
					"Stabilized and scaled the product, built the Kortix AI Python SDK, moved infrastructure to AWS, and set up end-to-end delivery",
				tags: [
					"AI Agents",
					"Python",
					"TypeScript",
					"Docker",
					"Daytona",
					"AWS",
					"Pulumi",
					"GitHub Actions",
				],
			},
		],
	},
	{
		company: "Veritus",
		href: "https://www.veritus.ai/",
		period: "Aug 2024 – Jul 2025",
		role: "Contract Senior SDE",
		items: [
			{
				title: "Literature Review",
				description:
					"220M+ records, 3TB+ data, 3x more relevant than Google Scholar",
				tags: ["Elasticsearch", "Bun", "Python"],
			},
			{
				title: "Custom AI models",
				description: "Up to 100x cheaper than Cohere",
				tags: ["Docker", "Python", "AWS Lambda", "ECR", "GitHub Actions"],
			},
			{
				title: "Payment system",
				description: "One-time + recurring with credit tracking",
				tags: ["Stripe", "Webhooks", "NextJS"],
			},
			{
				title: "Manuscript Review",
				description:
					"Built an AI-powered paper review workflow that simplifies most of the research-paper review process",
				tags: [
					"LangChain",
					"Elasticsearch",
					"Web scraping",
					"Document parsing",
				],
			},
			{
				title: "PDF Chat",
				description:
					"Built a streaming retrieval system for asking questions about uploaded PDFs",
				tags: ["Pinecone", "Cohere", "LangChain", "Web Streams"],
			},
			{
				title: "Developer experience",
				description:
					"Integrated observability, delivery, and development tooling that produced a reported 2x productivity gain",
				tags: ["Sentry", "CI/CD", "Vercel", "Docker", "Langfuse"],
			},
			{
				title: "Rearchitecture",
				description: "Multi-repo MERN to monorepo with tRPC + TypeScript",
				tags: ["NextJS", "tRPC", "Mongoose", "Tailwind", "Redis"],
			},
		],
	},
	{
		company: "SaaS Labs",
		href: "https://www.saaslabs.co/",
		period: "Jun 2022 – Aug 2024",
		role: "SDE II",
		items: [
			{
				title: "Apex",
				description: "Rewrote JustCall codebase away from PHP stack",
				tags: [
					"React",
					"Remix",
					"NestJS",
					"TypeScript",
					"Tailwind",
					"Vitest",
					"Docker",
				],
			},
			{
				title: "Search",
				description: "Full-text search for JustCall product family",
				tags: [
					"Microfrontend",
					"React",
					"Vite",
					"Shadow DOM",
					"Algolia",
					"Cheerio",
					"Docker",
					"Jenkins",
				],
			},
			{
				title: "AI Notetaker",
				description: "Bot that joins meetings, records, generates highlights",
				tags: [
					"Puppeteer",
					"NodeJS",
					"Docker",
					"Kubernetes",
					"FFmpeg",
					"Redis",
					"Bun",
				],
			},
		],
	},
	{
		company: "htOS",
		href: "https://htos-demo.sharath.uk/",
		period: "Apr 2022 – Jul 2022",
		role: "Freelance Lead Developer",
		items: [
			{
				title: "Room management",
				description:
					"Built an end-to-end type-safe hostel room management system for IIT Hyderabad",
				tags: ["Blitz.js", "TypeScript", "PostgreSQL", "NextAuth", "Prisma"],
			},
		],
	},
	{
		company: "covid19tracker",
		href: "https://c19-react.pages.dev/",
		period: "Sep 2021 – Dec 2021",
		role: "Freelance Deployment Engineer",
		items: [
			{
				title: "Platform delivery",
				description:
					"Took the product from development through deployment and scaled it to 3TB of traffic per month",
				tags: [
					"NodeJS",
					"Cloudflare",
					"GitHub Actions",
					"Docker",
					"PostgreSQL",
				],
			},
		],
	},
	{
		company: "Office of Career Services",
		href: "https://ocs.iith.ac.in/",
		period: "Feb 2020 – Apr 2021",
		role: "Freelance Web Developer",
		items: [
			{
				title: "Placement platform",
				description:
					"Moved IIT Hyderabad placements from paper workflows to a digital system for companies, staff, and students",
				tags: ["React", "JavaScript", "NodeJS", "Express", "MySQL"],
			},
		],
	},
	{
		company: "StoryXpress",
		href: "https://storyxpress.co/",
		period: "Jul 2020 – Sep 2020",
		role: "Full-Stack Developer Intern",
		items: [
			{
				title: "Internal products",
				description:
					"Built an internal dashboard and a Google Drive-like file experience",
				tags: ["React", "Webpack", "NodeJS", "ExpressJS"],
			},
		],
	},
];
export function Timeline() {
	const ref = useRef<HTMLOListElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 60%", "end 60%"],
	});
	const scaleY = useSpring(scrollYProgress, {
		stiffness: 120,
		damping: 30,
		mass: 0.4,
	});

	return (
		<section aria-labelledby="timeline-heading" className="px-6 py-24 md:px-8">
			<div className="mx-auto max-w-2xl">
				<Reveal>
					<h2
						id="timeline-heading"
						className="mb-10 text-2xl font-medium tracking-tight md:text-3xl"
					>
						Experience
					</h2>
				</Reveal>

				<ol ref={ref} className="relative">
					{/* scroll-following beam */}
					<motion.span
						aria-hidden
						className="absolute top-2 left-[5px] w-px origin-top bg-primary"
						style={{ scaleY, height: "calc(100% - 16px)" }}
					/>
					{jobs.map((job, i) => (
						<TimelineJob key={job.company} job={job} index={i} />
					))}
				</ol>
			</div>
		</section>
	);
}

function TimelineJob({ job, index }: { job: Job; index: number }) {
	const reduce = useReducedMotion();

	const content = (
		<>
			<span
				aria-hidden
				className="absolute top-1.5 left-0 size-2.5 rounded-full bg-primary ring-4 ring-base-100"
			/>
			<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
				<h3 className="text-lg font-medium">
					<MagicLink
						href={job.href}
						rel="noreferrer"
						target="_blank"
						className="hover:text-primary"
					>
						{job.company}
					</MagicLink>
				</h3>
				<span className="text-xs text-base-content/65">{job.period}</span>
			</div>
			<p className="mb-3 text-sm text-base-content/70">{job.role}</p>
			<ul className="space-y-2">
				{job.items.map((item) => (
					<li key={item.title} className="text-sm">
						<span className="font-medium">{item.title}</span>
						<span className="text-base-content/60">: {item.description}</span>
						<p className="mt-0.5 text-xs text-base-content/60">
							{item.tags.join(" · ")}
						</p>
					</li>
				))}
			</ul>
		</>
	);

	if (reduce) {
		return <li className="relative mb-12 pl-8 last:mb-0">{content}</li>;
	}

	return (
		<motion.li
			className="relative mb-12 pl-8 last:mb-0"
			initial={{ opacity: 0, x: -16 }}
			transition={{ delay: index * 0.07, duration: 0.5, ease: EASE }}
			viewport={{ margin: "-60px", once: true }}
			whileInView={{ opacity: 1, x: 0 }}
		>
			{content}
		</motion.li>
	);
}
