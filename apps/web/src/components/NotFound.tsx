import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const NOT_FOUND_TITLE = "Page not found — sharath.ai";

export default function NotFound() {
	const headingRef = useRef<HTMLHeadingElement>(null);

	useEffect(() => {
		headingRef.current?.focus();
	}, []);

	useEffect(() => {
		const prevTitle = document.title;
		document.title = NOT_FOUND_TITLE;
		return () => {
			document.title = prevTitle;
		};
	}, []);

	return (
		<div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
			<p
				aria-hidden="true"
				className="font-display text-6xl font-medium text-base-content/70"
			>
				404
			</p>
			<div>
				<h1
					ref={headingRef}
					tabIndex={-1}
					className="font-display text-2xl font-medium outline-none"
				>
					Page not found
				</h1>
				<p className="mt-2 text-sm text-base-content/70">
					The page you're looking for doesn't exist.
				</p>
			</div>
			<Link
				to="/"
				className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-content transition-opacity hover:opacity-90"
			>
				Go home
			</Link>
		</div>
	);
}
