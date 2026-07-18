import { Star } from "lucide-react";
import {
	motion,
	useInView,
	useReducedMotion,
	type Variants,
} from "motion/react";
import { useEffect, useRef } from "react";

/** Easing per DESIGN.md: `cubic-bezier(0.16, 1, 0.3, 1)` — no bouncing/wiggling. */
const EASE = [0.16, 1, 0.3, 1] as const;

/** Count-up duration: ≤0.5s per DESIGN.md motion rule. */
const DURATION_MS = 400;

const POP: Variants = {
	hidden: { scale: 0, rotate: -45, opacity: 0 },
	shown: { scale: 1, rotate: 0, opacity: 1 },
};

/** Format a star count for display: 8 → "8", 19915 → "19.9k", 246230 → "246k". */
function formatStars(n: number): string {
	if (n < 1000) return String(n);
	if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
	return `${Math.round(n / 1000)}k`;
}

/**
 * A repo's star count as a microinteraction: the star icon pops in (scale +
 * rotate) when scrolled into view, and on hover of an ancestor `.group` it
 * scales up, tilts, and tints to the theme primary. Reduced-motion: static.
 * The count itself ticks up from 0 on view.
 */
export function Stars({ count }: { count: number }) {
	const ref = useRef<HTMLSpanElement>(null);
	const countRef = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: "-40px" });
	const reduce = useReducedMotion();

	// Seed the displayed count immediately to avoid a flicker-to-zero when the
	// animation starts: the DOM is written to `count` before the first frame.
	useEffect(() => {
		if (!countRef.current) return;
		if (!inView || reduce) {
			if (countRef.current) countRef.current.textContent = formatStars(count);
			return;
		}
		// Seed with starting value so there's no 0 flash before rAF fires.
		if (countRef.current) countRef.current.textContent = formatStars(0);
	}, [inView, count, reduce]);

	useEffect(() => {
		if (!inView) return;
		if (reduce) {
			// Reduced-motion: snap to final value, no animation.
			if (countRef.current) countRef.current.textContent = formatStars(count);
			return;
		}
		let raf = 0;
		const start = performance.now();
		// Drive the count-up via direct DOM mutation rather than setState, so
		// we don't trigger a React re-render every animation frame.
		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / DURATION_MS);
			const eased = 1 - (1 - t) ** 3;
			const current = Math.round(count * eased);
			if (countRef.current) countRef.current.textContent = formatStars(current);
			if (t < 1) raf = requestAnimationFrame(tick);
			else if (countRef.current)
				countRef.current.textContent = formatStars(count);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [inView, count, reduce]);

	return (
		<span
			ref={ref}
			role="img"
			className="ml-1 inline-flex items-center gap-0.5 text-xs text-base-content/65 transition-colors duration-300 group-hover:text-primary"
			aria-label={`${formatStars(count)} stars`}
		>
			<motion.span
				aria-hidden
				className="inline-flex"
				variants={POP}
				animate={reduce ? "shown" : inView ? "shown" : "hidden"}
				transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE }}
				whileHover={
					reduce
						? undefined
						: {
								scale: 1.35,
								rotate: 18,
								transition: { duration: 0.2, ease: EASE },
							}
				}
			>
				<Star className="size-3" />
			</motion.span>
			<span ref={countRef} aria-hidden>
				{formatStars(0)}
			</span>
		</span>
	);
}
