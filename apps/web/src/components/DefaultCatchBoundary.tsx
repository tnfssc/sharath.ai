import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

export default function DefaultCatchBoundary({
	error,
	reset,
}: ErrorComponentProps) {
	const isDev = import.meta.env.DEV;
	const message = isDev ? error.message : undefined;
	const stack = isDev && error.stack ? error.stack : undefined;

	return (
		<div
			role="alert"
			className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center"
		>
			<AlertCircle className="size-10 text-base-content/40" />
			<div>
				<h1 className="font-display text-2xl font-medium">
					Something went wrong
				</h1>
				<p className="mt-2 text-sm text-base-content/80">
					An unexpected error occurred.
				</p>
				{message ? (
					<pre className="mt-4 overflow-x-auto rounded-lg bg-base-300/50 p-3 text-left font-mono text-xs text-base-content/80">
						{message}
					</pre>
				) : null}
				{stack ? (
					<pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-base-300/50 p-3 text-left font-mono text-xs text-base-content/60">
						{stack}
					</pre>
				) : null}
			</div>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					onClick={reset}
					className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-content transition-opacity hover:opacity-90"
				>
					Try again
				</button>
				<Link
					to="/"
					className="rounded-lg border border-base-300 px-4 py-2 text-sm font-medium text-base-content transition-opacity hover:opacity-90"
				>
					Go home
				</Link>
			</div>
		</div>
	);
}
