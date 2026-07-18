import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Swatches = { bg: string; primary: string };

// Themes surfaced as primary quick-picks at the top of the menu.
const PRIMARY_THEMES = ["light", "halloween"];

// Every daisyUI theme enabled in styles.css, grouped by color-scheme.
// Grouping verified against daisyUI 5.6.13 `theme/*.css` `color-scheme:` values:
// valentine, nord, cyberpunk, retro, acid, lofi all resolve to `light`.
const THEME_GROUPS: { label: string; themes: string[] }[] = [
	{
		label: "Light",
		themes: [
			"light",
			"cupcake",
			"bumblebee",
			"emerald",
			"corporate",
			"garden",
			"pastel",
			"fantasy",
			"wireframe",
			"cmyk",
			"autumn",
			"lemonade",
			"winter",
			"caramellatte",
			"silk",
			"valentine",
			"cyberpunk",
			"retro",
			"acid",
			"lofi",
			"nord",
		],
	},
	{
		label: "Dark",
		themes: [
			"dark",
			"synthwave",
			"halloween",
			"forest",
			"aqua",
			"black",
			"luxury",
			"dracula",
			"business",
			"night",
			"coffee",
			"dim",
			"sunset",
			"abyss",
		],
	},
];

// Module-level cache: each theme's CSS tokens are read once via getComputedStyle,
// never recomputed. Swatches are stable per theme for the lifetime of the page.
const swatchCache = new Map<string, Swatches | null>();

/**
 * Read a daisyUI theme's color tokens from the live CSS cascade.
 * Creates a temporary element, sets data-theme, reads computed colors, removes it.
 * Results are memoized per theme in `swatchCache`.
 */
function themeSwatches(theme: string): Swatches | null {
	if (typeof document === "undefined") return null;
	const cached = swatchCache.get(theme);
	if (cached !== undefined) return cached;
	const el = document.createElement("div");
	el.setAttribute("data-theme", theme);
	el.style.cssText =
		"position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;visibility:hidden";
	document.body.appendChild(el);
	const cs = getComputedStyle(el);
	const sw: Swatches = {
		bg: cs.getPropertyValue("--color-base-100").trim(),
		primary: cs.getPropertyValue("--color-primary").trim(),
	};
	document.body.removeChild(el);
	const result = sw.bg || sw.primary ? sw : null;
	swatchCache.set(theme, result);
	return result;
}

function Swatch({ theme }: { theme: string }) {
	const [colors, setColors] = useState<Swatches | null>(null);

	useEffect(() => {
		// Defer to next frame to avoid layout thrash on initial render
		const id = requestAnimationFrame(() => setColors(themeSwatches(theme)));
		return () => cancelAnimationFrame(id);
	}, [theme]);

	if (!colors) {
		return (
			<span className="inline-flex h-4 w-6 shrink-0 rounded-sm bg-base-300" />
		);
	}

	return (
		<span
			className="inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-sm ring-1 ring-base-content/10"
			style={{ background: colors.bg }}
		>
			<span
				className="ml-auto h-full w-1/2"
				style={{ background: colors.primary }}
			/>
		</span>
	);
}

export default function ThemeToggle() {
	const [current, setCurrent] = useState<string>("");
	const [open, setOpen] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);
	const [query, setQuery] = useState("");

	const containerRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		setCurrent(
			document.documentElement.getAttribute("data-theme") ?? "halloween",
		);
	}, []);

	// Close on outside click or Escape (Escape also restores focus to the trigger).
	useEffect(() => {
		if (!open) return;
		const click = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
				setMoreOpen(false);
			}
		};
		const esc = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpen(false);
				setMoreOpen(false);
				triggerRef.current?.focus();
			}
		};
		document.addEventListener("mousedown", click);
		window.addEventListener("keydown", esc);
		return () => {
			document.removeEventListener("mousedown", click);
			window.removeEventListener("keydown", esc);
		};
	}, [open]);

	// Move focus into the menu when it opens (active theme, else first item).
	useEffect(() => {
		if (!open) return;
		const id = requestAnimationFrame(() => {
			const items =
				containerRef.current?.querySelectorAll<HTMLElement>(
					'[role="menuitem"]',
				);
			if (!items || items.length === 0) return;
			const active = Array.from(items).find(
				(el) => el.getAttribute("aria-current") === "true",
			);
			(active ?? items[0]).focus();
		});
		return () => cancelAnimationFrame(id);
	}, [open]);

	function setTheme(theme: string) {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
		setCurrent(theme);
		setOpen(false);
		setMoreOpen(false);
		triggerRef.current?.focus();
	}

	const moreThemes = useMemo(() => {
		const all = THEME_GROUPS.flatMap((g) => g.themes).filter(
			(t) => !PRIMARY_THEMES.includes(t),
		);
		if (!query.trim()) {
			return THEME_GROUPS.map((group) => ({
				...group,
				themes: group.themes.filter((t) => !PRIMARY_THEMES.includes(t)),
			})).filter((g) => g.themes.length > 0);
		}
		const q = query.toLowerCase();
		return all
			.filter((t) => t.includes(q))
			.map((t) => ({
				label: THEME_GROUPS.find((g) => g.themes.includes(t))!.label,
				themes: [t],
			}))
			.reduce((acc: { label: string; themes: string[] }[], item) => {
				const existing = acc.find((g) => g.label === item.label);
				if (existing) existing.themes.push(...item.themes);
				else acc.push(item);
				return acc;
			}, []);
	}, [query]);

	// Arrow-key navigation across menuitems within the menu.
	function handleMenuKeyDown(e: React.KeyboardEvent) {
		const target = e.target as HTMLElement;
		// Let the search input handle its own keys.
		if (target.tagName === "INPUT") return;
		const items = Array.from(
			containerRef.current?.querySelectorAll<HTMLElement>(
				'[role="menuitem"]:not([disabled])',
			) ?? [],
		);
		if (items.length === 0) return;
		const i = items.indexOf(target);
		if (i === -1) return;
		let next = -1;
		switch (e.key) {
			case "ArrowDown":
				next = (i + 1) % items.length;
				break;
			case "ArrowUp":
				next = (i - 1 + items.length) % items.length;
				break;
			case "Home":
				next = 0;
				break;
			case "End":
				next = items.length - 1;
				break;
			default:
				return;
		}
		e.preventDefault();
		items[next]?.focus();
	}

	return (
		<div className="relative" ref={containerRef}>
			<button
				ref={triggerRef}
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex items-center gap-1.5 rounded-md p-1.5 transition-colors hover:bg-base-200"
				aria-label={`Theme: ${current || "halloween"}`}
				aria-expanded={open}
				aria-haspopup="menu"
			>
				<SwatchLazy theme={current || "halloween"} />
				<ChevronDown
					className={`size-3 opacity-50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{open && (
				<div
					role="menu"
					aria-label="Theme selection"
					onKeyDown={handleMenuKeyDown}
					className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-xl"
				>
					{/* Primary themes: Light + Halloween */}
					<div className="p-1">
						{PRIMARY_THEMES.map((theme) => (
							<button
								key={theme}
								type="button"
								role="menuitem"
								aria-current={current === theme ? "true" : undefined}
								onClick={() => setTheme(theme)}
								className="flex w-full items-center gap-2.5 rounded-base px-2 py-1.5 text-sm transition-colors hover:bg-base-200"
							>
								<Swatch theme={theme} />
								<span
									className={`capitalize ${current === theme ? "font-medium text-primary" : ""}`}
								>
									{theme === "halloween" ? "Halloween" : "Light"}
								</span>
								{current === theme && (
									<Check className="ml-auto size-3.5 shrink-0 text-primary" />
								)}
							</button>
						))}
					</div>

					{/* More Themes toggle */}
					<div className="border-t border-base-300">
						<button
							type="button"
							role="menuitem"
							aria-expanded={moreOpen}
							onClick={() => setMoreOpen((v) => !v)}
							className="flex w-full items-center gap-2.5 px-3 py-1.5 text-sm text-base-content/70 transition-colors hover:bg-base-200"
						>
							<span className={moreOpen ? "text-primary" : ""}>
								More Themes
							</span>
							<ChevronDown
								className={`ml-auto size-3.5 opacity-50 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
							/>
						</button>
					</div>

					{/* Expandable scrollable list */}
					{moreOpen && (
						<div className="border-t border-base-300">
							{/* Search */}
							<div className="flex items-center gap-2 border-b border-base-300 px-3 py-2">
								<Search className="size-3.5 shrink-0 text-base-content/50" />
								<input
									type="text"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search themes..."
									aria-label="Search themes"
									className="w-full bg-transparent text-sm outline-none placeholder:text-base-content/40"
									autoFocus
								/>
								{query && (
									<button
										type="button"
										onClick={() => setQuery("")}
										className="shrink-0 text-base-content/40 hover:text-base-content/70"
										aria-label="Clear search"
									>
										<X className="size-3.5" />
									</button>
								)}
							</div>

							{/* Scrollable theme list */}
							{moreThemes.length > 0 ? (
								<div className="max-h-64 overflow-y-auto p-1">
									{moreThemes.map((group) => (
										<div key={group.label} className="mb-1 last:mb-0">
											<div className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-base-content/40">
												{group.label}
												<span className="ml-1.5 text-base-content/30">
													({group.themes.length})
												</span>
											</div>
											{group.themes.map((theme) => (
												<button
													key={theme}
													type="button"
													role="menuitem"
													aria-current={
														current === theme ? "true" : undefined
													}
													onClick={() => setTheme(theme)}
													className="flex w-full items-center gap-2.5 rounded-base px-2 py-1.5 text-sm transition-colors hover:bg-base-200"
												>
													<Swatch theme={theme} />
													<span
														className={`capitalize ${current === theme ? "font-medium text-primary" : ""}`}
													>
														{theme}
													</span>
													{current === theme && (
														<Check className="ml-auto size-3.5 shrink-0 text-primary" />
													)}
												</button>
											))}
										</div>
									))}
								</div>
							) : (
								<div className="px-3 py-6 text-center text-sm text-base-content/50">
									No themes found for "{query}"
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

/**
 * Non-animated swatch for the trigger button — reads once on mount, no rAF.
 */
function SwatchLazy({ theme }: { theme: string }) {
	const [colors, setColors] = useState<Swatches | null>(null);

	useEffect(() => {
		setColors(themeSwatches(theme));
	}, [theme]);

	if (!colors) {
		return (
			<span className="inline-block h-5 w-7 shrink-0 rounded-sm bg-base-300" />
		);
	}

	return (
		<span
			className="inline-flex h-5 w-7 shrink-0 overflow-hidden rounded-sm ring-1 ring-base-content/10"
			style={{ background: colors.bg }}
		>
			<span
				className="ml-auto h-full w-1/2"
				style={{ background: colors.primary }}
			/>
		</span>
	);
}
