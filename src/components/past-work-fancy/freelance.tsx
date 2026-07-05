import { motion } from 'motion/react'

import { Reveal } from '#/components/reveal'
import { Magnetic } from '#/components/magnetic'

const EASE = [0.16, 1, 0.3, 1] as const

interface Freelance {
  company: string
  href: string
  period: string
  role: string
  description: string
  tags: string[]
}

const items: Freelance[] = [
  {
    company: 'Kortix AI',
    href: 'https://kortix.ai/',
    period: 'May 2025 – Aug 2025',
    role: 'Software Engineer',
    description:
      'Made the app stable and scalable. Built the Kortix AI SDK for Python. Set up full CI/CD on Hetzner. Migrated to AWS.',
    tags: [
      'Python',
      'TypeScript',
      'Docker',
      'Daytona',
      'Supabase',
      'AWS',
      'Pulumi',
      'GitHub Actions',
      'Redis',
      'Stripe',
    ],
  },
  {
    company: 'htOS',
    href: 'https://htos-demo.sharath.uk/',
    period: 'Apr 2022 – Jul 2022',
    role: 'Lead Developer',
    description:
      'Hostel room management system for IIT Hyderabad. E2E type-safe, designed for long-term maintenance.',
    tags: ['Blitz.js', 'TypeScript', 'PostgreSQL', 'NextAuth', 'Prisma'],
  },
  {
    company: 'covid19tracker',
    href: 'https://c19-react.pages.dev/',
    period: 'Sep 2021 – Dec 2021',
    role: 'Deployment Engineer',
    description:
      'Scaled to 3TB traffic/month. Spearheaded development from initiation to deployment.',
    tags: ['NodeJS', 'CDN', 'Cloudflare', 'GitHub Actions', 'Docker', 'PostgreSQL'],
  },
  {
    company: 'Office of Career Services',
    href: 'https://ocs.iith.ac.in/',
    period: 'Feb 2020 – Apr 2021',
    role: 'Web Developer',
    description:
      'IITH placement platform. Moved from paper-based to digital, reducing friction for companies, staff, and students.',
    tags: ['React', 'JavaScript', 'NodeJS', 'Express', 'MySQL'],
  },
  {
    company: 'StoryXpress',
    href: 'https://storyxpress.co/',
    period: 'Jul 2020 – Sep 2020',
    role: 'Full-Stack Developer Intern',
    description:
      'Built internal dashboard and a Google Drive-like feature. Learnt to resolve merge conflicts.',
    tags: ['React', 'Webpack', 'NodeJS', 'ExpressJS'],
  },
]

export function Freelance() {
  return (
    <section className="px-6 py-16 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h2 className="mb-6 text-2xl font-medium tracking-tight md:text-3xl">Freelance</h2>
        </Reveal>

        <div className="divide-y divide-base-300">
          {items.map((item, i) => (
            <motion.a
              key={item.company}
              className="group block py-5 first:pt-0 last:pb-0"
              href={item.href}
              initial={{ opacity: 0, y: 16 }}
              rel="noreferrer"
              target="_blank"
              transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
              viewport={{ margin: '-60px', once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <Magnetic>
                  <span className="font-display text-lg font-medium link-draw group-hover:text-primary">
                    {item.company}
                  </span>
                </Magnetic>
                <span className="text-xs text-base-content/65 transition-colors group-hover:text-base-content/85">{item.period}</span>
              </div>
              <p className="text-xs text-base-content/65 transition-colors group-hover:text-base-content/85">{item.role}</p>
              <p className="mt-1.5 text-sm text-base-content/70 transition-colors group-hover:text-base-content">{item.description}</p>
              <p className="mt-2 text-xs text-base-content/60 transition-colors group-hover:text-base-content/90">{item.tags.join(' · ')}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
