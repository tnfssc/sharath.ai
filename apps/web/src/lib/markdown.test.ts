import { describe, expect, it } from "vitest";

import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
	it("creates anchors for Unicode headings while preserving inline formatting", () => {
		const html = renderMarkdown("## Héllo **世界**!");

		expect(html).toContain(
			'<h2 id="héllo-世界">Héllo <strong>世界</strong>!</h2>',
		);
	});

	it("highlights code when the language includes extra fence metadata", () => {
		const html = renderMarkdown("```ts nohighlight\nconst answer = 42;\n```");

		expect(html).toContain('class="hljs language-ts"');
		expect(html).toContain('class="hljs-keyword"');
	});

	it("escapes code for unknown languages instead of treating it as HTML", () => {
		const html = renderMarkdown(
			"```unknown-language\n<script>alert('hello')</script>\n```",
		);

		expect(html).toContain('class="hljs language-plaintext"');
		expect(html).toContain("&lt;script&gt;");
		expect(html).not.toContain("<script>");
	});

	it("escapes image attributes and retains lazy loading and referrer privacy", () => {
		const html = renderMarkdown(
			`![A "quote" & <tag>](https://example.com/image.png 'A "quote" & <tag>')`,
		);

		expect(html).toContain('src="https://example.com/image.png"');
		expect(html).toContain('alt="A &quot;quote&quot; &amp; &lt;tag&gt;"');
		expect(html).toContain('title="A &quot;quote&quot; &amp; &lt;tag&gt;"');
		expect(html).toContain('referrerpolicy="no-referrer" loading="lazy"');
	});
});
