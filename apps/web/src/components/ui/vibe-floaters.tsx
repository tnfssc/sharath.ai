import { useEffect, useRef, useState } from "react";

// Per-floater config: fractional start position, initial direction (dx,dy),
// a hue-rotate tint, and a speed multiplier (keeps the 4 out of sync so they
// don't hit corners simultaneously).
const SIZE = 104; // px — square (source is 220×220)
// px/sec — frame-rate-independent base velocity (~144px/s, leisurely DVD pace).
const BASE_SPEED = 144;
// Clamp dt so a backgrounded tab's first frame doesn't teleport the floaters
// across the screen.
const MAX_DT = 1 / 30; // s — at most 33ms of motion per frame
const FLOATERS = [
	{ x: 0.06, y: 0.16, dx: 1, dy: 1, hue: 0, sp: 1.0 },
	{ x: 0.78, y: 0.24, dx: -1, dy: 1, hue: 80, sp: 1.18 },
	{ x: 0.22, y: 0.74, dx: 1, dy: -1, hue: 175, sp: 0.88 },
	{ x: 0.76, y: 0.7, dx: -1, dy: -1, hue: 270, sp: 1.28 },
] as const;

/**
 * Four copies of the "no think, vibe only" gif that bounce around the viewport
 * like DVD logos — constant-velocity diagonal drift with edge reflection, each
 * tinted a different hue. Sits as a non-interactive overlay on top of content
 * (pointer-events disabled, clicks pass straight through). Honors
 * prefers-reduced-motion by rendering the floaters static at their start spots.
 */
export function VibeFloaters({ active }: { active: boolean }) {
	const rootRef = useRef<HTMLDivElement>(null);
	const elsRef = useRef<(HTMLDivElement | null)[]>([]);
	// Lazy-init stateRef so the floater positions seed from the fractional config
	// at first tick (avoids a (0,0) flash before the first RAF fires).
	const stateRef = useRef<
		{ px: number; py: number; vx: number; vy: number; init: boolean }[] | null
	>(null);

	const [reduced, setReduced] = useState(() =>
		typeof window !== "undefined"
			? window.matchMedia("(prefers-reduced-motion: reduce)").matches
			: false,
	);

	// Reactive to OS-level reduced-motion changes while the overlay is mounted.
	useEffect(() => {
		if (typeof window === "undefined") return;
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const onChange = () => setReduced(mq.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		if (!active) return;
		// Seed positions from the fractional config now that we can read the
		// container size; this is what paints on the very first frame.
		const root = rootRef.current;
		if (root) {
			const maxX = Math.max(0, root.clientWidth - SIZE);
			const maxY = Math.max(0, root.clientHeight - SIZE);
			stateRef.current = FLOATERS.map((f, _i) => ({
				px: f.x * maxX,
				py: f.y * maxY,
				vx: f.dx * BASE_SPEED * f.sp,
				vy: f.dy * BASE_SPEED * f.sp,
				init: true,
			}));
			const seeded = stateRef.current;
			FLOATERS.forEach((_, i) => {
				const el = elsRef.current[i];
				const s = seeded?.[i];
				if (el && s)
					el.style.transform = `translate3d(${s.px}px, ${s.py}px, 0)`;
			});
		}

		if (reduced) return;

		let raf = 0;
		let last = performance.now();
		const tick = (now: number) => {
			const r = rootRef.current;
			if (!r) {
				raf = requestAnimationFrame(tick);
				return;
			}
			const maxX = Math.max(0, r.clientWidth - SIZE);
			const maxY = Math.max(0, r.clientHeight - SIZE);
			const dt = Math.min((now - last) / 1000, MAX_DT);
			last = now;
			const states = stateRef.current;
			if (states) {
				for (let i = 0; i < states.length; i++) {
					const s = states[i];
					if (!s.init) {
						const f = FLOATERS[i];
						s.px = f.x * maxX;
						s.py = f.y * maxY;
						s.vx = f.dx * BASE_SPEED * f.sp;
						s.vy = f.dy * BASE_SPEED * f.sp;
						s.init = true;
					} else {
						s.px += s.vx * dt;
						s.py += s.vy * dt;
						if (s.px <= 0) {
							s.px = 0;
							s.vx = Math.abs(s.vx);
						} else if (s.px >= maxX) {
							s.px = maxX;
							s.vx = -Math.abs(s.vx);
						}
						if (s.py <= 0) {
							s.py = 0;
							s.vy = Math.abs(s.vy);
						} else if (s.py >= maxY) {
							s.py = maxY;
							s.vy = -Math.abs(s.vy);
						}
					}
					const el = elsRef.current[i];
					if (el) el.style.transform = `translate3d(${s.px}px, ${s.py}px, 0)`;
				}
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [active, reduced]);

	return (
		<div
			ref={rootRef}
			aria-hidden
			className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
			style={{
				opacity: active ? 1 : 0,
				transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
			}}
		>
			{FLOATERS.map((f, i) => (
				<div
					key={`${f.x}-${f.y}-${f.hue}`}
					ref={(el) => {
						elsRef.current[i] = el;
					}}
					// Gate will-change on the active state so inactive floaters don't
					// hold a compositor layer.
					className={`absolute left-0 top-0${active ? " will-change-transform" : ""}`}
					style={{
						width: SIZE,
						height: SIZE,
						filter: `hue-rotate(${f.hue}deg) saturate(1.25)`,
						opacity: 0.85,
					}}
				>
					<img
						src="/nothink-vibeonly.webp"
						alt=""
						draggable={false}
						className="h-full w-full select-none"
					/>
				</div>
			))}
		</div>
	);
}
