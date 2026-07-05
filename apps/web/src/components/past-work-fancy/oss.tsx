import { Code } from 'lucide-react'

import { MagicLink } from '#/components/magic-link'
import { Reveal } from '#/components/reveal'
import { Stars } from '#/components/ui/oss-stars'

const oss = [
  {
    repo: 'kortix-ai/suna',
    stars: 19915,
    href: 'https://github.com/kortix-ai/suna/pulls?q=is%3Apr+author%3Atnfssc+is%3Aclosed',
  },
  {
    repo: 'langchain-ai/langchainjs',
    stars: 17889,
    href: 'https://github.com/langchain-ai/langchainjs/pull/5637',
  },
  {
    repo: 'facebook/react',
    stars: 246230,
    href: 'https://github.com/facebook/react/pull/30123',
  },
  {
    repo: 'kortix-ai/resumable-stream-python',
    stars: 8,
    href: 'https://github.com/kortix-ai/resumable-stream-python',
  },
]

export function OpenSource() {
  return (
    <section className="px-6 py-16 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h2 className="mb-6 text-2xl font-medium tracking-tight md:text-3xl">Open Source</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="space-y-3">
            {oss.map((item) => (
              <li key={item.repo} className="group flex items-baseline gap-3">
                <Code className="mt-0.5 inline size-4 shrink-0 text-base-content/50 group-hover:text-primary" />
                <MagicLink
                  href={item.href}
                  rel="noreferrer"
                  target="_blank"
                  strength={0.3}
                  className="font-medium text-base-content hover:text-primary"
                >
                  {item.repo}
                  <Stars count={item.stars} />
                </MagicLink>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}