/** Canonical origin of the site. Single source of truth for absolute URLs (RSS, sitemap, canonical tags). */
export const SITE_URL = 'https://sharath.ai'

type SeoOptions = {
	/** Per-page canonical URL; emitted as og:url. For the `<link rel="canonical">` tag, add it to head().links (see canonicalLink). */
	canonical?: string
	description?: string
	image?: string
	keywords?: string
	title: string
	/** Open Graph object type; defaults to 'website', blog posts pass 'article'. */
	type?: string
	/** Per-page URL; emitted as og:url (same as canonical when only one is given). */
	url?: string
}

/**
 * Build the meta-tag array for a route's `head().meta`.
 *
 * - Skips `description`/`keywords` entries when the value is falsy (avoids
 *   emitting empty `<meta name="description" content="undefined">` tags that
 *   duplicate or overwrite parent-route entries).
 * - Emits `og:image` / `twitter:image` / `twitter:card=summary_large_image`
 *   only when an image is supplied.
 * - Emits `og:type` (default `website`; pass `article` for blog posts).
 * - Emits `og:url` when a `url` is supplied.
 *
 * Canonical `<link rel="canonical">` cannot live in `meta[]` (TanStack renders
 * the meta array exclusively as `<meta>`/`<title>` tags); add it to
 * `head().links` via `canonicalLink()`.
 *
 * The return type is intentionally inferred: annotating with TanStack's
 * `MetaDescriptor` widens the union to include the `script:ld+json` variant,
 * which is not assignable to `head().meta`'s expected `React.MetaHTMLAttributes`
 * array and breaks every caller's type check.
 */
export const seo = ({
	canonical,
	description,
	image,
	keywords,
	title,
	type = 'website',
	url,
}: SeoOptions) => {
	const resolvedUrl = url ?? canonical
	return [
		{ title },
		...(description ? [{ name: 'description', content: description }] : []),
		...(keywords ? [{ name: 'keywords', content: keywords }] : []),
		{ name: 'twitter:title', content: title },
		...(description
			? [{ name: 'twitter:description', content: description }]
			: []),
		{ name: 'twitter:creator', content: '@tnfssc' },
		{ name: 'twitter:site', content: '@tnfssc' },
		{ name: 'og:type', content: type },
		{ name: 'og:title', content: title },
		...(description ? [{ name: 'og:description', content: description }] : []),
		...(resolvedUrl ? [{ name: 'og:url', content: resolvedUrl }] : []),
		...(image
			? [
					{ name: 'twitter:image', content: image },
					{ name: 'twitter:card', content: 'summary_large_image' },
					{ name: 'og:image', content: image },
				]
			: []),
	]
}

/**
 * A `<link rel="canonical">` entry for `head().links`. Kept separate from
 * `seo()` because TanStack renders the `meta[]` array as `<meta>`/`<title>`
 * tags only — canonical must be a link tag.
 */
export const canonicalLink = (href: string) => ({ rel: 'canonical', href })
