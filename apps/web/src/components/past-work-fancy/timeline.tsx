import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'

import { Reveal } from '#/components/reveal'
import { MagicLink } from '#/components/magic-link'

const EASE = [0.16, 1, 0.3, 1] as const

interface Job {
  company: string
  href: string
  period: string
  role: string
  items: { title: string; description: string; tags: string[] }[]
}

const jobs: Job[] = [
  {
    company: 'Writer',
    href: 'https://writer.com/',
    period: 'Aug 2025 – now',
    role: 'Software Engineer',
    items: [
      {
        title: 'Writer Agent',
        description: 'Building next-gen AI agent platform',
        tags: ['TypeScript', 'Python', 'Docker', 'Postgres', 'Restate', 'React'],
      },
    ],
  },
  {
    company: 'Veritus',
    href: 'https://www.veritus.ai/',
    period: 'Aug 2024 – Jul 2025',
    role: 'Contract Senior SDE',
    items: [
      {
        title: 'Literature Review',
        description:
          '220M+ records, 3TB+ data, 3x more relevant than Google Scholar',
        tags: ['Elasticsearch', 'Bun', 'Python'],
      },
      {
        title: 'Custom AI models',
        description: 'Up to 100x cheaper than Cohere',
        tags: ['Docker', 'Python', 'AWS Lambda', 'ECR', 'GitHub Actions'],
      },
      {
        title: 'Payment system',
        description: 'One-time + recurring with credit tracking',
        tags: ['Stripe', 'Webhooks', 'NextJS'],
      },
      {
        title: 'Rearchitecture',
        description: 'Multi-repo MERN to monorepo with tRPC + TypeScript',
        tags: ['NextJS', 'tRPC', 'Mongoose', 'Tailwind', 'Redis'],
      },
    ],
  },
  {
    company: 'SaaS Labs',
    href: 'https://www.saaslabs.co/',
    period: 'Jun 2022 – Aug 2024',
    role: 'SDE II',
    items: [
      {
        title: 'Apex',
        description: 'Rewrote JustCall codebase away from PHP stack',
        tags: ['React', 'Remix', 'NestJS', 'TypeScript', 'Tailwind'],
      },
      {
        title: 'Search',
        description: 'Full-text search for JustCall product family',
        tags: [
          'Microfrontend',
          'React',
          'Vite',
          'Shadow DOM',
          'Algolia',
          'Docker',
        ],
      },
      {
        title: 'AI Notetaker',
        description: 'Bot that joins meetings, records, generates highlights',
        tags: [
          'Puppeteer',
          'NodeJS',
          'Docker',
          'Kubernetes',
          'FFmpeg',
          'Redis',
        ],
      },
    ],
  },
]
export function Timeline() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 60%', 'end 60%'],
  })
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <section className="px-6 py-24 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h2 className="mb-10 text-2xl font-medium tracking-tight md:text-3xl">Employment</h2>
        </Reveal>

        <ol ref={ref} className="relative">
          {/* scroll-following beam */}
          <motion.span
            aria-hidden
            className="absolute top-2 left-[5px] w-px origin-top bg-primary"
            style={{ scaleY, height: 'calc(100% - 16px)' }}
          />
          {jobs.map((job, i) => (
            <motion.li
              key={job.company}
              className="relative mb-12 pl-8 last:mb-0"
              initial={{ opacity: 0, x: -16 }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: EASE }}
              viewport={{ margin: '-60px', once: true }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <span
                aria-hidden
                className="absolute top-1.5 left-0 size-2.5 rounded-full bg-primary ring-4 ring-base-100"
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <MagicLink
                  href={job.href}
                  rel="noreferrer"
                  target="_blank"
                  className="text-lg font-medium hover:text-primary"
                >
                  {job.company}
                </MagicLink>
                <span className="text-xs text-base-content/65">{job.period}</span>
              </div>
              <p className="mb-3 text-sm text-base-content/70">{job.role}</p>
              <ul className="space-y-2">
                {job.items.map((item) => (
                  <li key={item.title} className="text-sm">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-base-content/60">: {item.description}</span>
                    <p className="mt-0.5 text-xs text-base-content/60">
                      {item.tags.join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
