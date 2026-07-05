import { Fragment } from 'react'
import { motion } from 'motion/react'

import { Reveal } from '#/components/reveal'

const EASE = [0.16, 1, 0.3, 1] as const

// rows preserve the original groupings; rendered as middot-separated prose, not a pill grid.
const skills = [
  ['TypeScript', 'React', 'Python', 'NextJS'],
  ['Docker', 'tRPC', 'Tailwind', 'PostgreSQL'],
  ['Redis', 'AWS', 'LangChain', 'MCP'],
  ['Elasticsearch', 'Stripe', 'NodeJS', 'Vite'],
  ['GitHub Actions', 'Cloudflare', 'Kubernetes', 'Bun'],
  ['Supabase', 'Pulumi', 'Convex', 'Prisma'],
]

export function Skills() {
  return (
    <section className="px-6 py-16 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h2 className="mb-6 text-2xl font-medium tracking-tight md:text-3xl">Tech Stack</h2>
        </Reveal>
        <div className="space-y-1.5 text-base leading-relaxed">
          {skills.map((row, i) => (
            <motion.p
              key={row.join()}
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: i * 0.05, duration: 0.45, ease: EASE }}
              viewport={{ margin: '-40px', once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {row.map((skill, j) => (
                <Fragment key={skill}>
                  <span className="text-base-content/80 transition-colors hover:text-primary">
                    {skill}
                  </span>
                  {j < row.length - 1 && <span className="px-1 text-base-content/50">·</span>}
                </Fragment>
              ))}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  )
}
