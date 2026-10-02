import {
	motion,
	useMotionTemplate,
	useMotionValue,
	useSpring,
} from "motion/react";
import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";
import { useReducedMotion } from "#/lib/use-reduced-motion";

/**
 * Stacks two content layers. On hover, a radial mask follows the cursor and
 * reveals the hidden "reveal" layer underneath — the base layer masks away
 * in the same circle so they don't overlap. On leave, the mask snaps shut.
 *
 * Both layers must have identical layout/structure so positions match.
 * Reduced-motion: instant opacity crossfade, no mask.
 *
 * The reveal layer (masked) is sized to `reveal` content (shrink-to-fit), so
 * the mask tracks cursor within "vibe coder" bounds, not the wider base layer.
 * The `hint` slot (optional) is rendered in an UNMASKED sibling layer sized
 * via an invisible duplicate of `reveal` — so the hint's tracking bounds match
 * the reveal text. A button over the reveal bounds handles both pointer and
 * keyboard activation, with the optional hint nested inside it.
 */
export function VibeReveal({
	children,
	reveal,
	className = "",
	onHoverChange,
	onRevealClick,
	hint,
	hideCursor,
	forceReveal,
}: {
	/** Base layer — visible by default. */
	children: ReactNode;
	/** Reveal layer — visible through the radial mask on hover. */
	reveal: ReactNode;
	className?: string;
	/** Called when hover state changes (for driving external crossfades). */
	onHoverChange?: (hovered: boolean) => void;
	/** Called when the reveal layer is clicked. */
	onRevealClick?: () => void;
	/** Optional unmasked hint (e.g. a pointer-following play badge). */
	hint?: ReactNode;
	/** Hide the system cursor inside the container (e.g. while hint is shown). */
	hideCursor?: boolean;
	/** Force the reveal layer visible (e.g. while audio plays, even without hover). */
	forceReveal?: boolean;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const reduce = useReducedMotion();

	// Mouse position relative to the element, as a percentage.
	const mouseX = useMotionValue(50);
	const mouseY = useMotionValue(50);

	// Mask size: 0 when not hovered → 100% on hover, slow spring for subtlety.
	const maskSize = useSpring(0, { stiffness: 80, damping: 30, mass: 0.6 });

	const mask = useMotionTemplate`radial-gradient(circle at ${mouseX}% ${mouseY}%, black ${maskSize}%, transparent ${maskSize}%)`;
	const inverseMask = useMotionTemplate`radial-gradient(circle at ${mouseX}% ${mouseY}%, transparent ${maskSize}%, black ${maskSize}%)`;

	function onMouseMove(e: MouseEvent<HTMLSpanElement>) {
		if (reduce || !ref.current) return;
		const r = ref.current.getBoundingClientRect();
		mouseX.set(((e.clientX - r.left) / r.width) * 100);
		mouseY.set(((e.clientY - r.top) / r.height) * 100);
	}

	function onMouseEnter() {
		if (!reduce) maskSize.set(100);
		onHoverChange?.(true);
	}

	function onMouseLeave() {
		if (ref.current?.matches(":focus-within")) return;
		if (!reduce && !forceReveal) maskSize.set(0);
		onHoverChange?.(false);
	}

	// Force reveal open when forceReveal is true (e.g. audio playing without hover)
	useEffect(() => {
		if (forceReveal && !reduce) maskSize.set(100);
		else if (!forceReveal && !reduce && ref.current) {
			// Keep the reveal visible while the pointer or keyboard is in its bounds.
			const engaged = ref.current.matches(":hover, :focus-within");
			if (!engaged) maskSize.set(0);
		}
	}, [forceReveal, reduce, maskSize]);

	if (reduce) {
		return (
			<span ref={ref} className={`group relative inline-block ${className}`}>
				<span className="transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0">
					{children}
				</span>
				<button
					type="button"
					aria-label="Toggle vibe audio"
					disabled={!onRevealClick}
					className="absolute left-1/2 top-0 inline-flex -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
					onClick={onRevealClick}
				>
					{reveal}
				</button>
			</span>
		);
	}
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: Hover only drives a decorative mask; the button below handles activation.
		<span
			ref={ref}
			className={`relative inline-block min-w-[270px] ${hideCursor ? "cursor-none [&_*]:cursor-none" : "cursor-auto"} ${className}`}
			onMouseMove={onMouseMove}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			{/* Base layer — masked away on hover where reveal shows */}
			<motion.span
				className="relative z-10"
				style={{ mask: inverseMask, WebkitMask: inverseMask }}
			>
				{children}
			</motion.span>
			{/* Reveal layer — masked, centered within container so it stays put
          as FlipWords' width changes (container is text-center'd by parent) */}
			<motion.span
				aria-hidden
				className="absolute left-1/2 top-0 z-20 inline-flex -translate-x-1/2 cursor-pointer"
				style={{ mask, WebkitMask: mask }}
			>
				{reveal}
			</motion.span>
			{/* Audio control — unmasked, sized to reveal via invisible duplicate */}
			{(hint || onRevealClick) && (
				<button
					type="button"
					aria-label="Toggle vibe audio"
					disabled={!onRevealClick}
					className="absolute left-1/2 top-0 z-30 inline-flex -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
					onClick={onRevealClick}
					onFocus={onMouseEnter}
					onBlur={onMouseLeave}
				>
					{/* Invisible duplicate of `reveal` that sizes this layer to the
              reveal text bounds so the hint tracks the cursor correctly.
              Cost: mounts WaveText twice (doubling its animations). Kept
              because CSS-only sizing of masked motion content is fragile. */}
					<span className="invisible" aria-hidden>
						{reveal}
					</span>
					{hint}
				</button>
			)}
		</span>
	);
}
