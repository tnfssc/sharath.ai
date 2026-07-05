import { allBlogs } from 'content-collections'

export type BlogPost = (typeof allBlogs)[number]

/** Resolve a post's URL slug from frontmatter, falling back to the file name. */
export function slugOf(post: BlogPost): string {
  return post.slug ?? post._meta.fileName.replace(/\.[^.]+$/, '')
}

/** All posts, newest first. */
export function getAllPosts(): BlogPost[] {
  return [...allBlogs].sort((a, b) => b.date.getTime() - a.date.getTime())
}

export function getPost(slug: string): BlogPost | undefined {
  return allBlogs.find((post) => slugOf(post) === slug)
}