import { Github, Linkedin, X, Youtube } from "lucide-react";
import { useReducedMotion } from "motion/react";
import type { SVGProps } from "react";

import { Magnetic } from "./magnetic";

/**
 * Solid brand glyph SVGs (Simple Icons paths, viewBox 0 0 24 24) — used as
 * the overlay for the "liquid pour" effect. Outer shape painted with
 * `fill="currentColor"` (brand color via parent color), inner cutout elements
 * painted with `fill="white"` on top — so the authentic logo shows through
 * (white triangle on red rounded-rect / white "in" on blue square). The CSS
 * `.liquid-fill` clip-path applies to the whole <svg> element, so both paths
 * rise together. Resting state is the lucide outline; on hover the brand-colored
 * solid silhouette rises from the bottom up via clip-path.
 */

const SiYouTube = (props: SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 24 24" aria-hidden {...props}>
		<path
			fill="currentColor"
			d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
		/>
		<path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
	</svg>
);

const SiLinkedIn = (props: SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 24 24" aria-hidden {...props}>
		<path
			fill="currentColor"
			d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"
		/>
		<path
			fill="white"
			d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"
		/>
	</svg>
);

const socials = [
	{
		name: "X",
		href: "https://x.com/tnfssc",
		Icon: X,
		Fill: null,
		fill: "#1DA1F2",
	},
	{
		name: "LinkedIn",
		href: "https://www.linkedin.com/in/tnfssc/",
		Icon: Linkedin,
		Fill: SiLinkedIn,
		fill: "#0A66C2",
	},
	{
		name: "GitHub",
		href: "https://github.com/tnfssc",
		Icon: Github,
		Fill: null,
		fill: "var(--color-base-content)",
	},
	{
		name: "YouTube",
		href: "https://www.youtube.com/@tnfssc",
		Icon: Youtube,
		Fill: SiYouTube,
		fill: "#FF0000",
	},
];

/**
 * Four social link icons (X, LinkedIn, GitHub, YouTube) with three
 * stacked micro-interactions: magnetic cursor-follow, brand-color liquid-pour
 * fill rising from the bottom (clip-path), and a small upward lift on hover.
 * The hover zone is the fixed `<a>` (with `p-1.5` padding); the magnetic
 * wrapper is INSIDE so the spring pull never moves the hover target off the
 * cursor — that would cause a wiggle loop near the edge.
 *
 * One source of truth: shared by Footer and hero links row.
 */
export function SocialIcons({
	iconClassName = "size-6",
	navClassName = "flex items-center gap-5",
}: {
	iconClassName?: string;
	navClassName?: string;
}) {
	const reduce = useReducedMotion();
	return (
		<nav className={navClassName} aria-label="Social links">
			{socials.map(({ name, href, Icon, Fill, fill }) => (
				<a
					key={name}
					href={href}
					target="_blank"
					rel="noreferrer noopener"
					className="group inline-flex p-1.5 text-base-content/60"
					aria-label={`${name} (opens in new tab)`}
				>
					<Magnetic strength={0.5}>
						<span
							className={`relative inline-flex${
								reduce
									? ""
									: " transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
							}`}
						>
							<Icon className={iconClassName} />
							{!reduce &&
								(Fill ? (
									<Fill
										className={`liquid-fill ${iconClassName} absolute inset-0`}
										style={{ color: fill }}
									/>
								) : (
									<Icon
										className={`liquid-fill ${iconClassName} absolute inset-0`}
										style={{ color: fill }}
										aria-hidden
									/>
								))}
						</span>
					</Magnetic>
				</a>
			))}
		</nav>
	);
}
