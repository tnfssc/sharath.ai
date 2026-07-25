import { createFileRoute } from "@tanstack/react-router";

// Loads the module augmentation that adds `server.handlers` to file routes.
import "@tanstack/react-start";

import { getAllPosts, slugOf } from "#/lib/blog";
import { SITE_URL } from "#/lib/seo";

/** Escape text for XML element/attribute content. */
function esc(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function rss(): string {
	const posts = getAllPosts();
	const items = posts
		.map((post) => {
			const url = `${SITE_URL}/blog/${slugOf(post)}`;
			return [
				"<item>",
				`<title>${esc(post.title)}</title>`,
				`<link>${esc(url)}</link>`,
				`<guid isPermaLink="true">${esc(url)}</guid>`,
				`<description>${esc(post.description)}</description>`,
				`<pubDate>${post.date.toUTCString()}</pubDate>`,
				`<author>${esc(post.author.name)}</author>`,
				...post.tags.map((tag) => `<category>${esc(tag)}</category>`),
				"</item>",
			].join("\n");
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>sharath.ai</title>
<link>${SITE_URL}/blog</link>
<description>Blog posts from sharath.ai</description>
<language>en</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>
`;
}

export const Route = createFileRoute("/rss.xml")({
	server: {
		handlers: {
			GET: () =>
				new Response(rss(), {
					headers: {
						"Content-Type": "application/rss+xml; charset=utf-8",
						"Cache-Control": "public, max-age=3600",
					},
				}),
		},
	},
});
