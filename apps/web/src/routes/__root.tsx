import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect, useState } from "react";
import DefaultCatchBoundary from "../components/DefaultCatchBoundary";
import Footer from "../components/Footer";
import Header from "../components/Header";
import NotFound from "../components/NotFound";
import PostHogProvider from "../integrations/posthog/provider";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import { seo } from "../lib/seo";
import { vtState } from "../lib/vt";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

// Set data-theme on <html> from localStorage before first paint to avoid FOUC.
// Defaults to 'halloween' on first visit.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(!t){t='halloween';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	errorComponent: DefaultCatchBoundary,
	notFoundComponent: NotFound,
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover",
			},
			{
				name: "theme-color",
				content: "#221b2a",
			},
			...seo({
				title: "sharath.ai",
				description:
					"Sharath — software engineer building AI agents, developer tools, and things that ship.",
			}),
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/icon.svg",
			},
			{
				rel: "icon",
				sizes: "256x256",
				type: "image/png",
				href: "/icon.png",
			},
			{
				rel: "apple-touch-icon",
				sizes: "256x256",
				href: "/icon.png",
			},
			{
				rel: "manifest",
				href: "/manifest.json",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	// Entrance animation on hard page load only. React state adds the
	// `content-enter` class on mount and removes it after 400ms — the class
	// is gone before any in-app navigation can fire, so the animation can
	// never restart. View transitions handle in-app nav separately.
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	useEffect(() => {
		const t = setTimeout(() => setIsInitialLoad(false), 400);
		return () => clearTimeout(t);
	}, []);
	// Smooth-scroll in-page `#` anchor links, gated by prefers-reduced-motion.
	useEffect(() => {
		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const behavior = reduce ? "auto" : "smooth";
		const onClick = (e: MouseEvent) => {
			// Bail on modifier keys — let the browser handle the click natively
			// (open-in-new-tab, middle-click, etc.).
			if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
			const a = (e.target as HTMLElement)?.closest(
				'a[href^="#"]',
			) as HTMLAnchorElement | null;
			if (!a) return;
			const hash = a.getAttribute("href");
			if (!hash || hash === "#") return;
			// getElementById + decodeURIComponent handles CSS-special chars in IDs
			// and percent-encoded fragments without throwing on selectors like "#how-to-use".
			const id = decodeURIComponent(hash.slice(1));
			const target = id ? document.getElementById(id) : null;
			if (!target) return;
			e.preventDefault();
			target.scrollIntoView({ behavior, block: "start" });
			// Update the URL hash for shareability without a native jump.
			history.pushState(null, "", hash);
		};
		document.addEventListener("click", onClick);
		return () => document.removeEventListener("click", onClick);
	}, []);
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased [overflow-wrap:anywhere]">
				<a
					href="#main"
					className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-base-100 focus:px-4 focus:py-2 focus:text-base-content focus:shadow-lg"
				>
					Skip to content
				</a>
				<PostHogProvider>
					<Header />
					<main
						id="main"
						className={isInitialLoad ? "content-enter" : undefined}
						style={{
							viewTransitionName: vtState.active ? "main-content" : undefined,
						}}
					>
						{children}
					</main>
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
					<Footer />
				</PostHogProvider>
				<Scripts />
			</body>
		</html>
	);
}
