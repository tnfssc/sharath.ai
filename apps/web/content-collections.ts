import { defineCollection, defineConfig } from '@content-collections/core'
import { z } from 'zod'

const blog = defineCollection({
  name: 'blog',
  directory: 'content/blog',
  include: '*.md',
  // Default parser is "frontmatter", which parses YAML frontmatter AND yields
  // the markdown body as `content`.
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    author: z.object({
      name: z.string(),
      image: z.string().optional(),
    }),
    heroImage: z.string().url().optional(),
    slug: z.string().optional(),
  }),
})

export default defineConfig({ collections: [blog] })