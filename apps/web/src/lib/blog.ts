import { allBlogs } from "content-collections";

export type BlogPost = (typeof allBlogs)[number];

/**
 * Resolve a post's URL slug from frontmatter, falling back to the file path
 * stem (`_meta.path`). The result is sanitized to URL-safe characters so an
 * author-supplied slug or a nested file path can never produce an invalid
 * URL segment. `slugOf` is the single source of truth used by both the index
 * route (to build hrefs) and `getPost` (to look one up), so the round trip is
 * stable regardless of encoding.
 */
export function slugOf(post: BlogPost): string {
	const raw = post.slug ?? post._meta.path;
	return raw.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "");
}

/** All posts, newest first. Sorted once at module load and reused. */
const ALL_POSTS: BlogPost[] = [...allBlogs].sort(
	(a, b) => b.date.getTime() - a.date.getTime(),
);

export function getAllPosts(): BlogPost[] {
	return ALL_POSTS;
}

export function getPost(slug: string): BlogPost | undefined {
	return ALL_POSTS.find((post) => slugOf(post) === slug);
}
