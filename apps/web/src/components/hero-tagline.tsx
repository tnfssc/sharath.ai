import {
	AnimatePresence,
	LayoutGroup,
	motion,
	useReducedMotion,
} from "motion/react";
import type { CSSProperties } from "react";

/**
 * Per-character tagline swap using AnimatePresence + popLayout + layout.
 *
 * How it works:
 * 1. PREFIX/SUFFIX SCAN: common prefix ("Building next-gen s") and
 *    suffix (".") are rendered as static text — they never animate.
 * 2. The divergent MIDDLE is split into per-character motion.spans.
 *    Each char's React key is `${position}-${char}`. When disco toggles,
 *    chars that are identical at the same position keep the same key →
 *    React preserves them (no animation). Chars that differ get a new
 *    key → AnimatePresence plays exit on the old, enter on the new.
 * 3. `mode="popLayout"` pops exiting chars out of flow (position:
 *    absolute) so entering chars immediately take their natural inline
 *    position. No width measurement, no inline-grid, no max-width
 *    slots — every char renders at its own natural width.
 * 4. `layout` on the container + prefix + suffix animates the reflow
 *    (width changes, position shifts) smoothly.
 * 5. `whiteSpace: 'pre'` on the container preserves space characters
 *    inside inline-block spans.
 *
 * Ref: https://motion.dev/docs/react-animate-presence#poplayout
 */

const TAGLINE_A = "Building next-gen software to make AI more accessible.";
const TAGLINE_B = "Building next-gen slopware to make human life difficult.";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DURATION = 0.3;
const STAGGER = 0.025;

function findBounds(a: string, b: string) {
	let pi = 0;
	while (pi < a.length && pi < b.length && a[pi] === b[pi]) pi++;
	let si = 0;
	while (
		si < a.length - pi &&
		si < b.length - pi &&
		a[a.length - 1 - si] === b[b.length - 1 - si]
	)
		si++;
	return { pi, si };
}

const srOnly: CSSProperties = {
	position: "absolute",
	width: "1px",
	height: "1px",
	padding: "0",
	margin: "-1px",
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	border: "0",
};

const layoutT = { layout: { duration: 0.4, ease: EASE } };

export function HeroTagline({ disco }: { disco: boolean }) {
	const reduce = useReducedMotion();
	const tagline = disco ? TAGLINE_B : TAGLINE_A;

	if (reduce) {
		return (
			<>
				<span style={srOnly}>{tagline}</span>
				<span aria-hidden>{tagline}</span>
			</>
		);
	}

	const { pi, si } = findBounds(TAGLINE_A, TAGLINE_B);
	const prefix = TAGLINE_A.slice(0, pi);
	const suffix = TAGLINE_A.slice(TAGLINE_A.length - si);
	const mid = disco
		? TAGLINE_B.slice(pi, TAGLINE_B.length - si)
		: TAGLINE_A.slice(pi, TAGLINE_A.length - si);

	return (
		<>
			<span style={srOnly}>{tagline}</span>
			<LayoutGroup>
				<span aria-hidden style={{ whiteSpace: "pre" }}>
					{prefix && (
						<motion.span
							layout
							transition={layoutT}
							style={{ display: "inline-block" }}
						>
							{prefix}
						</motion.span>
					)}
					<motion.span
						layout
						transition={layoutT}
						style={{ display: "inline-block", position: "relative" }}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							{Array.from(mid).map((char, i) => (
								<motion.span
									key={`${i}-${char}`}
									layout
									initial={{ opacity: 0, rotateX: -90 }}
									animate={{ opacity: 1, rotateX: 0 }}
									exit={{ opacity: 0, rotateX: 90 }}
									transition={{
										delay: i * STAGGER,
										duration: DURATION,
										ease: EASE,
									}}
									style={{
										display: "inline-block",
										transformOrigin: "center center",
										transformPerspective: 600,
									}}
								>
									{char}
								</motion.span>
							))}
						</AnimatePresence>
					</motion.span>
					{suffix && (
						<motion.span
							layout
							transition={layoutT}
							style={{ display: "inline-block" }}
						>
							{suffix}
						</motion.span>
					)}
				</span>
			</LayoutGroup>
		</>
	);
}
