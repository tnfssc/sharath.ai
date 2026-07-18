import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

const DEFAULT_DURATION = 3000;
const MIN_DURATION = 500;

function resolveDuration(duration?: number): number {
	if (
		typeof duration !== "number" ||
		!Number.isFinite(duration) ||
		duration <= 0
	) {
		return DEFAULT_DURATION;
	}
	return Math.max(duration, MIN_DURATION);
}

export function FlipWords({
	className,
	duration = DEFAULT_DURATION,
	words,
}: {
	className?: string;
	duration?: number;
	words: [string, ...string[]];
}) {
	const reduce = useReducedMotion();
	const [index, setIndex] = useState(0);
	const ms = resolveDuration(duration);

	useEffect(() => {
		if (typeof document === "undefined") return;
		let id: number | undefined;
		const start = () => {
			if (id !== undefined) return;
			if (document.hidden) return;
			id = window.setInterval(
				() => setIndex((i) => (i + 1) % words.length),
				ms,
			);
		};
		const stop = () => {
			if (id === undefined) return;
			window.clearInterval(id);
			id = undefined;
		};
		const onVisibility = () => {
			if (document.hidden) stop();
			else start();
		};
		start();
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			stop();
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [ms, words.length]);

	if (reduce) {
		return (
			<span className={`relative inline-block ${className ?? ""}`}>
				<span aria-hidden="true" className="inline-block">
					{words[index]}
				</span>
				<span className="sr-only">{words[index]}</span>
			</span>
		);
	}

	return (
		<span className={`relative inline-block ${className ?? ""}`}>
			<AnimatePresence mode="wait" initial={false}>
				<motion.span
					key={`${words[index]}-${index}`}
					animate={{ opacity: 1, y: 0 }}
					aria-hidden="true"
					className="inline-block"
					exit={{ opacity: 0, y: -8 }}
					initial={{ opacity: 0, y: 8 }}
					transition={{ duration: 0.35, ease: EASE }}
				>
					{words[index]}
				</motion.span>
			</AnimatePresence>
			<span className="sr-only">{words[index]}</span>
		</span>
	);
}
