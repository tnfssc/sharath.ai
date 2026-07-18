import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

const orbs = [
	{
		color: "var(--color-primary)",
		size: "35rem",
		left: "5%",
		top: "15%",
		dx: "20vw",
		dy: "45vh",
		duration: 8,
		delay: 0,
	},
	{
		color: "var(--color-secondary)",
		size: "30rem",
		left: "80%",
		top: "20%",
		dx: "-20vw",
		dy: "50vh",
		duration: 10,
		delay: -2,
	},
	{
		color: "var(--color-accent)",
		size: "28rem",
		left: "40%",
		top: "70%",
		dx: "30vw",
		dy: "-40vh",
		duration: 9,
		delay: -4,
	},
	{
		color: "var(--color-primary)",
		size: "24rem",
		left: "70%",
		top: "60%",
		dx: "-50vw",
		dy: "-20vh",
		duration: 11,
		delay: -1,
	},
	{
		color: "var(--color-secondary)",
		size: "22rem",
		left: "15%",
		top: "50%",
		dx: "70vw",
		dy: "-35vh",
		duration: 12,
		delay: -5,
	},
	{
		color: "var(--color-accent)",
		size: "26rem",
		left: "50%",
		top: "10%",
		dx: "-20vw",
		dy: "65vh",
		duration: 10,
		delay: -3,
	},
];

/**
 * Animated blurred color orbs that drift around the hero section — using
 * live theme tokens so colors swap with the active daisyUI theme. Sits
 * absolutely behind content with pointer-events disabled.
 */
export function DiscoLights({ active }: { active: boolean }) {
	const reduce = useReducedMotion();
	// Respect reduced-motion: no animation at all.
	if (reduce) return null;

	return (
		<div
			aria-hidden
			className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
		>
			{orbs.map((orb, i) => (
				<motion.div
					key={i}
					className="absolute rounded-full"
					style={{
						width: orb.size,
						height: orb.size,
						left: orb.left,
						top: orb.top,
						backgroundImage: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
						filter: "blur(60px)",
						// Only hint the compositor while the orbs are actually animating.
						willChange: active ? "transform" : "auto",
					}}
					initial={{ opacity: 0, x: 0, y: 0 }}
					// Animate transforms (x/y), not layout props (left/top), and only run
					// the infinite drift loop when active — invisible orbs stay idle.
					animate={
						active
							? {
									x: [0, orb.dx, 0],
									y: [0, orb.dy, 0],
									opacity: 0.35,
								}
							: { opacity: 0 }
					}
					transition={{
						duration: orb.duration,
						delay: orb.delay,
						opacity: { duration: 0.6, ease: EASE },
						repeat: active ? Infinity : 0,
						ease: "easeInOut",
					}}
				/>
			))}
		</div>
	);
}
