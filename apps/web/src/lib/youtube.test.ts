import { describe, expect, it } from "vitest";

import { parseFeed } from "./youtube";

const entry = (id: string, title: string, link: string, published: string) => `
 <entry>
  <id>yt:video:${id}</id>
  <yt:videoId>${id}</yt:videoId>
  <title>${title}</title>
  <link rel="alternate" href="${link}"/>
  <published>${published}</published>
  <media:group>
   <media:title>${title}</media:title>
  </media:group>
 </entry>`;

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">
 <title>sharath</title>
 <published>2015-02-28T09:05:02+00:00</published>
${entry("aaa", "Vibe Coding Story music video [AI Generated Content]", "https://www.youtube.com/watch?v=aaa", "2026-11-03T07:50:35+00:00")}
${entry("bbb", "Virtual DOM Delusion (Lyrics) [AI Generated Content]", "https://www.youtube.com/watch?v=bbb", "2026-01-03T09:26:26+00:00")}
${entry("ccc", "sharath&apos;s work experience [Lyrics] [AI generated content]", "https://www.youtube.com/shorts/ccc", "2025-01-23T06:29:07+00:00")}
${entry("ddd", "Tom &amp; Jerry &#128512;", "https://www.youtube.com/watch?v=ddd", "2024-12-31T23:30:00-05:00")}
</feed>`;

describe("parseFeed", () => {
	it("ignores the channel-level title and reads each entry", () => {
		const videos = parseFeed(feed, 10);

		expect(videos.map((v) => v.id)).toEqual(["aaa", "bbb", "ccc", "ddd"]);
		expect(videos[0]).toMatchObject({
			href: "https://www.youtube.com/watch?v=aaa",
			thumbnail: "https://i.ytimg.com/vi/aaa/mqdefault.jpg",
			published: "2026-11-03T07:50:35.000Z",
			date: "Nov 2026",
		});
	});

	it("moves bracketed tags out of the title and into the kind", () => {
		const videos = parseFeed(feed, 10);

		expect(videos.map((v) => [v.title, v.kind])).toEqual([
			["Vibe Coding Story", "Music video"],
			["Virtual DOM Delusion", "Lyric video"],
			["sharath's work experience", "Short"],
			["Tom & Jerry 😀", "Video"],
		]);
	});

	it("formats dates in UTC so server and client agree", () => {
		expect(parseFeed(feed, 10)[3]?.date).toBe("Jan 2025");
	});

	it("stops at the limit and survives junk input", () => {
		expect(parseFeed(feed, 2)).toHaveLength(2);
		expect(parseFeed("<html>not a feed</html>", 4)).toEqual([]);
	});
});
