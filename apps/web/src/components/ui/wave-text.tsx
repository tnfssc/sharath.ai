import { motion, useReducedMotion } from "motion/react";

/**
 * Splits text into individual characters, each on a staggered sine wave.
 * While `active` is true, chars bob up and down infinitely. When `active`
 * becomes false, the wave smoothly settles back to y=0 (each char eases
 * to its rest position rather than unmounting abruptly).
 *
 * Accessibility: the animated per-character layer is `aria-hidden` (it is
 * decorative motion), and a visually-hidden `<span class="sr-only">`
 * carries the plain `text` for assistive tech. The reduced-motion branch
 * preserves the same `inline-block` wrapper structure to avoid layout shift.
 */
const EASE = [0.16, 1, 0.3, 1] as const;

const ANIMATE_ACTIVE = { y: [0, -4, 0] };
const ANIMATE_IDLE = { y: 0 };

const TRANSITION_ACTIVE = { duration: 0.8, repeat: Infinity, ease: EASE };
const TRANSITION_IDLE = { duration: 0.45, ease: EASE };

export function WaveText({
	text,
	active,
	className = "",
}: {
	text: string;
	active: boolean;
	className?: string;
}) {
	const reduce = useReducedMotion();

	// Reduced-motion: render plain text inside the same `inline-block` wrapper
	// used by the animated branch, so swapping branches causes no layout shift.
	if (reduce) {
		return (
			<span className={`inline-block ${className}`}>
				<span className="sr-only">{text}</span>
				<span aria-hidden="true">{text}</span>
			</span>
		);
	}

	return (
		<span className={`inline-block ${className}`}>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true">
				{Array.from(text).map((char, i) => (
					<motion.span
						key={i}
						className="inline-block"
						animate={active ? ANIMATE_ACTIVE : ANIMATE_IDLE}
						transition={
							active
								? { ...TRANSITION_ACTIVE, delay: i * 0.06 }
								: { ...TRANSITION_IDLE, delay: i * 0.025 }
						}
					>
						{char === " " ? "\u00A0" : char}
					</motion.span>
				))}
			</span>
		</span>
	);
}
