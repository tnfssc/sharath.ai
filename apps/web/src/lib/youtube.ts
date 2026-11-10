import { createServerFn } from "@tanstack/react-start";

/**
 * Latest uploads from the YouTube channel, read from the public per-channel
 * Atom feed. No API key: the feed gives id, title, link and publish date for
 * the newest 15 uploads, which is all the home page shows.
 */

const CHANNEL_ID = "UCuB3HpVwVpNyaVxjr8k5Geg";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

/** Uploads are rare (a few a year), so an hour of staleness costs nothing. */
const CACHE_SECONDS = 3600;

/** The home page waits on this during SSR; a slow feed must not hold it up. */
const TIMEOUT_MS = 2500;

export const CHANNEL_URL = "https://www.youtube.com/@tnfssc";

export interface Video {
	id: string;
	title: string;
	href: string;
	/** Short label for the meta line: "Music video", "Lyric video", "Short", "Video". */
	kind: string;
	/** ISO timestamp, for `<time dateTime>`. */
	published: string;
	/** Display date, formatted here (UTC) so server and client render the same text. */
	date: string;
	thumbnail: string;
}

const ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
};

function decodeXml(text: string): string {
	return text.replace(/&(#x?[0-9a-f]+|\w+);/gi, (match, code: string) => {
		if (code.startsWith("#")) {
			const hex = code[1] === "x" || code[1] === "X";
			const point = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
			return Number.isNaN(point) ? match : String.fromCodePoint(point);
		}
		return ENTITIES[code.toLowerCase()] ?? match;
	});
}

/**
 * Upload titles carry bracketed YouTube-side tags ("[AI Generated Content]",
 * "(Lyrics)") that read as noise in a list. Drop them from the title and keep
 * what they say about the format as the row's kind instead.
 */
function describe(
	rawTitle: string,
	href: string,
): { title: string; kind: string } {
	const lyrics = /[[(]\s*lyrics\s*[\])]/i.test(rawTitle);
	let title = rawTitle.replace(/\s*[[(][^\])]*[\])]/g, "").trim();
	const musicVideo = /\s+music video$/i.test(title);
	if (musicVideo) title = title.replace(/\s+music video$/i, "");

	let kind = "Video";
	if (href.includes("/shorts/")) kind = "Short";
	else if (musicVideo) kind = "Music video";
	else if (lyrics) kind = "Lyric video";

	return { title: title || rawTitle.trim(), kind };
}

const dateFormat = new Intl.DateTimeFormat("en", {
	month: "short",
	year: "numeric",
	timeZone: "UTC",
});

export function parseFeed(xml: string, limit: number): Video[] {
	const videos: Video[] = [];
	for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
		if (videos.length >= limit) break;
		const id = entry?.match(/<yt:videoId>([^<]+)</)?.[1];
		const rawTitle = entry?.match(/<title>([^<]*)</)?.[1];
		const published = entry?.match(/<published>([^<]+)</)?.[1];
		if (!id || !rawTitle || !published) continue;
		const time = new Date(published);
		if (Number.isNaN(time.getTime())) continue;

		const href =
			entry?.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ??
			`https://www.youtube.com/watch?v=${id}`;
		videos.push({
			id,
			href: decodeXml(href),
			...describe(decodeXml(rawTitle), href),
			published: time.toISOString(),
			date: dateFormat.format(time),
			// mqdefault is the one 16:9 size that exists for every upload.
			thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
		});
	}
	return videos;
}

/**
 * Newest uploads for the home page. Any failure (YouTube down, timeout, feed
 * shape change) yields an empty list, and the section hides itself: a missing
 * extra is better than a broken home page.
 */
export const getLatestVideos = createServerFn({ method: "GET" }).handler(
	async (): Promise<Video[]> => {
		try {
			const res = await fetch(FEED_URL, {
				signal: AbortSignal.timeout(TIMEOUT_MS),
				// Cloudflare edge cache for the subrequest; ignored outside Workers.
				cf: { cacheEverything: true, cacheTtl: CACHE_SECONDS },
			} as RequestInit);
			if (!res.ok) {
				console.error(`YouTube feed responded ${res.status}`);
				return [];
			}
			return parseFeed(await res.text(), 4);
		} catch (error) {
			console.error("YouTube feed fetch failed", error);
			return [];
		}
	},
);
