import { Link } from "@tanstack/react-router";
import {
	motion,
	useMotionValue,
	useReducedMotion,
	useSpring,
} from "motion/react";
import {
	type AnchorHTMLAttributes,
	type MouseEvent,
	type ReactNode,
	useRef,
} from "react";

type Props = {
	children: ReactNode;
	href: string;
	/** How strongly the link is pulled toward the cursor. 0 disables magnetism. */
	strength?: number;
	/** Toggle the animated underline draw. */
	underline?: boolean;
	className?: string;
} & Omit<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	| "href"
	| "children"
	// These overlap with motion's own event handlers, which have
	// incompatible signatures (motion passes a PanInfo second arg).
	| "onDrag"
	| "onDragStart"
	| "onDragEnd"
	| "onAnimationStart"
	| "onAnimationEnd"
	| "onAnimationIteration"
>;

const MotionLink = motion.create(Link);

/**
 * An inline link that (a) gently pulls toward the cursor and (b) draws an
 * animated underline on hover. Magnetic pull is spring-smoothed and disabled
 * under reduced-motion; the underline uses currentColor so it recolors with
 * the active theme.
 *
 * Internal links (href starting with `/`) use TanStack Router's <Link>
 * (wrapped via motion.create) so navigation goes through router.navigate()
 * and fires view transitions. External links use motion.a; `target` is
 * caller-supplied (defaults to noopener+noreferrer when target="_blank").
 */
export function MagicLink({
	children,
	href,
	strength = 0.4,
	underline = true,
	className = "",
	target,
	rel,
	...rest
}: Props) {
	const ref = useRef<HTMLAnchorElement>(null);
	const reduce = useReducedMotion();
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const sx = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 });
	const sy = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 });

	const isInternal = href.startsWith("/");
	// Default to noopener+noreferrer for new-tab links if caller didn't override.
	const resolvedRel =
		target === "_blank" ? (rel ?? "noopener noreferrer") : rel;

	const sharedProps = {
		...rest,
		ref,
		style: { x: sx, y: sy },
		whileTap: reduce ? undefined : { scale: 0.97 },
		onMouseMove: (e: MouseEvent<HTMLAnchorElement>) => {
			if (reduce || !ref.current) return;
			const r = ref.current.getBoundingClientRect();
			x.set((e.clientX - (r.left + r.width / 2)) * strength);
			y.set((e.clientY - (r.top + r.height / 2)) * strength);
		},
		onMouseLeave: () => {
			x.set(0);
			y.set(0);
		},
		className: `inline-block ${underline ? "link-draw" : ""} ${className}`,
	};

	if (isInternal) {
		return (
			<MotionLink to={href} {...sharedProps}>
				{children}
			</MotionLink>
		);
	}

	return (
		<motion.a href={href} target={target} rel={resolvedRel} {...sharedProps}>
			{children}
		</motion.a>
	);
}
