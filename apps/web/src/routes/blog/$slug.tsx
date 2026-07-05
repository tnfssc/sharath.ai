import { createFileRoute, Link, notFound } from '@tanstack/react-router'

import { getPost } from '#/lib/blog'
import { renderMarkdown } from '#/lib/markdown'
import { seo } from '#/lib/seo'

export const Route = createFileRoute('/blog/$slug')({
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          ...seo({
            title: `${loaderData.post.title} — sharath.ai`,
            description: loaderData.post.description,
          }),
        ]
      : [{ title: 'Not found — sharath.ai' }],
  }),
  loader: ({ params }) => {
    const post = getPost(params.slug)
    if (!post) throw notFound()
    return { post, html: renderMarkdown(post.content) }
  },
  component: BlogPost,
})

function BlogPost() {
  const { post, html } = Route.useLoaderData()
  const { slug } = Route.useParams()
  return (
    <article className="px-6 py-20 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/blog"
          resetScroll={false}
          className="text-sm text-base-content/60 transition-colors hover:text-primary"
        >
          ← Back to blog
        </Link>

        <h1 className="mt-6 text-3xl font-medium tracking-tight text-balance md:text-4xl">
          <span style={{ viewTransitionName: `post-title-${slug}` }}>
            {post.title}
          </span>
        </h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-base-content/70">
          {post.author.image && (
            <img
              src={post.author.image}
              alt={post.author.name}
              className="size-5 rounded-full"
              referrerPolicy="no-referrer"
              style={{ viewTransitionName: `post-avatar-${slug}` }}
            />
          )}
          <time>{post.date.toISOString().slice(0, 10)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.author.name}</span>
        </div>

        {post.tags.length > 0 && (
          <p className="mt-2 text-xs text-base-content/60">{post.tags.join(' · ')}</p>
        )}

        {post.heroImage && (
          <img
            src={post.heroImage}
            alt=""
            className="mt-8 aspect-video w-full rounded-lg object-cover"
            referrerPolicy="no-referrer"
            style={{ viewTransitionName: `post-hero-${slug}` }}
          />
        )}

        <div
          className="prose prose-lg mt-10 max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </article>
  )
}