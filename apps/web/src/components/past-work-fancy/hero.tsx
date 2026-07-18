import { motion } from "motion/react";
import { useState } from "react";
import { HeroTagline } from "#/components/hero-tagline";
import { MagicLink } from "#/components/magic-link";
import { Magnetic } from "#/components/magnetic";
import { SocialIcons } from "#/components/social-icons";
import { DiscoLights } from "#/components/ui/disco-lights";
import { FlipWords } from "#/components/ui/flip-words";
import { PointerHint } from "#/components/ui/pointer-hint";
import { VibeFloaters } from "#/components/ui/vibe-floaters";
import { VibeReveal } from "#/components/ui/vibe-reveal";
import { WaveText } from "#/components/ui/wave-text";
import { useVibeAudio } from "#/lib/use-vibe-audio";
import { vtState } from "#/lib/vt";

const EASE = [0.16, 1, 0.3, 1] as const;

// Must match the taglines rendered by HeroTagline (hero-tagline.tsx) so the
// accessible name on the wrapper below tracks the visible text during disco.
const TAGLINE_A = "Building next-gen software to make AI more accessible.";
const TAGLINE_B = "Building next-gen slopware to make human life difficult.";

const roles: [string, ...string[]] = [
	"AI systems engineer",
	"agent platform builder",
	"full-stack engineer",
	"open-source contributor",
];
const links = [{ href: "/blog", label: "Blog", external: false }];

export function Hero() {
	const [vibeHover, setVibeHover] = useState(false);
	const { preload, toggle, playing, clickCount } = useVibeAudio();
	const disco = playing;
	return (
		<section className="relative flex min-h-[88dvh] flex-col items-center justify-center px-6 pt-16 text-center">
			<DiscoLights active={disco} />
			<VibeFloaters active={disco} />
			<motion.h1
				animate={{ opacity: 1, y: 0 }}
				className="relative z-10 text-6xl font-medium tracking-tight text-foreground md:text-8xl"
				initial={vtState.active ? false : { opacity: 0, y: 24 }}
				transition={{ duration: 0.6, ease: EASE }}
			>
				<Magnetic strength={0.18}>
					<span className="relative inline-block">Sharath</span>
				</Magnetic>
			</motion.h1>

			<motion.div
				animate={{ opacity: 1 }}
				className="relative z-10 mt-5 text-xl font-semibold md:text-2xl"
				initial={vtState.active ? false : { opacity: 0 }}
				transition={{ delay: 0.15, duration: 0.5 }}
			>
				<VibeReveal
					reveal={<WaveText text="vibe coder" active={playing} />}
					className="text-primary"
					onHoverChange={(hovered) => {
						setVibeHover(hovered);
						if (hovered) preload();
					}}
					onRevealClick={toggle}
					forceReveal={playing}
					hint={
						<PointerHint
							visible={vibeHover || playing}
							clickedCounter={clickCount}
							playing={playing}
						/>
					}
					hideCursor={vibeHover}
				>
					<FlipWords className="text-primary" duration={2800} words={roles} />
				</VibeReveal>
				<motion.p
					animate={{ opacity: 1 }}
					aria-label={disco ? TAGLINE_B : TAGLINE_A}
					className="mt-6 max-w-md text-sm text-base-content/60 md:text-base"
					initial={vtState.active ? false : { opacity: 0 }}
					transition={{ delay: 0.3, duration: 0.5 }}
				>
					<HeroTagline disco={disco} />
				</motion.p>
			</motion.div>

			<motion.div
				animate={{ opacity: 1 }}
				className="mt-8 flex flex-col items-center gap-5 text-sm font-medium"
				initial={vtState.active ? false : { opacity: 0 }}
				transition={{ delay: 0.4, duration: 0.5 }}
			>
				<SocialIcons
					iconClassName="size-5"
					navClassName="flex items-center gap-4"
				/>
				{links.map((link) => (
					<MagicLink
						key={link.label}
						href={link.href}
						rel={link.external ? "noreferrer" : undefined}
						target={link.external ? "_blank" : undefined}
						className="group font-medium transition-colors duration-200 hover:text-primary"
					>
						<span
							style={
								link.href === "/blog"
									? { viewTransitionName: "blog-heading" }
									: undefined
							}
						>
							{link.label}
						</span>
						{link.external && (
							<span className="ml-0.5 inline-block transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
								↗
							</span>
						)}
					</MagicLink>
				))}
			</motion.div>
		</section>
	);
}
