import hljs from "highlight.js";
import { marked } from "marked";

// marked v15 does not export its internal escape()/cleanUrl() helpers
// (src/helpers.ts), so we replicate them here to keep the image renderer
// XSS-safe. Behavior mirrors marked's own defaults: escape2(s, true) uses the
// full escapeTest set (& < > " '), and cleanUrl normalizes via encodeURI.
const HTML_ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

/** Escape HTML special characters for safe interpolation into attribute values. */
function escapeHtml(input: string): string {
	return /[&<>"']/.test(input)
		? input.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch)
		: input;
}

/** Validate + normalize a URL for safe use in `src`. Returns null on invalid input. */
function cleanUrl(href: string): string | null {
	try {
		return encodeURI(href).replace(/%25/g, "%");
	} catch {
		return null;
	}
}

// Syntax-highlight fenced code blocks with highlight.js.
marked.use({
	renderer: {
		code({ text, lang }) {
			// Trim to the first whitespace-free token so trailing info strings
			// (e.g. `ts nohighlight`) don't leak into the hljs language lookup.
			const language = (lang?.match(/^\S*/)?.[0] ?? "") || "";
			const hlLang =
				language && hljs.getLanguage(language) ? language : "plaintext";
			const highlighted = hljs.highlight(text, { language: hlLang }).value;
			return `<pre><code class="hljs language-${hlLang}">${highlighted}</code></pre>`;
		},
		image({ href, title, text }) {
			const alt = escapeHtml(text ?? "");
			const cleanHref = cleanUrl(href ?? "");
			if (cleanHref === null) {
				return alt;
			}
			const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
			return `<img src="${cleanHref}" alt="${alt}"${titleAttr} referrerpolicy="no-referrer" loading="lazy" />`;
		},
		heading({ tokens, depth }) {
			const inner = this.parser.parseInline(tokens);
			// Slug from the plain-text rendering (strip tags) for shareable URLs
			// and in-page anchor smooth-scroll (# anchor links emitted by markdown).
			// Use /u + \p{L}\p{N} so non-ASCII headings get non-empty slugs.
			const plain = inner.replace(/<[^>]+>/g, "").trim();
			const slug = plain
				.toLowerCase()
				.replace(/[^\p{L}\p{N}\s-]/gu, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.replace(/^-|-$/g, "");
			return `<h${depth} id="${slug}">${inner}</h${depth}>\n`;
		},
	},
});

/** Render a markdown string to HTML with syntax-highlighted code blocks. */
export function renderMarkdown(md: string): string {
	return marked.parse(md, { async: false }) as string;
}
