import { useState } from 'react'
import { motion } from 'motion/react'

import { MagicLink } from '#/components/magic-link'
import { SocialIcons } from '#/components/social-icons'
import { HeroTagline } from '#/components/hero-tagline'
import { Magnetic } from '#/components/magnetic'
import { FlipWords } from '#/components/ui/flip-words'
import { VibeReveal } from '#/components/ui/vibe-reveal'
import { WaveText } from '#/components/ui/wave-text'
import { PointerHint } from '#/components/ui/pointer-hint'
import { DiscoLights } from '#/components/ui/disco-lights'
import { useVibeAudio } from '#/lib/use-vibe-audio'
import { vtState } from '#/lib/vt'

const EASE = [0.16, 1, 0.3, 1] as const

// Theme-adaptive gradient: color-mix with base-content ensures contrast
// in both light themes (darkens colors toward base-content) and dark themes
// (lightens toward base-content). Matches disco lights palette.
const GRADIENT = 'linear-gradient(135deg, color-mix(in oklab, var(--color-primary), var(--color-base-content) 20%), color-mix(in oklab, var(--color-secondary), var(--color-base-content) 20%), color-mix(in oklab, var(--color-accent), var(--color-base-content) 20%), color-mix(in oklab, var(--color-primary), var(--color-base-content) 20%))'

const roles: [string, ...string[]] = [
  'software engineer',
  'agent builder',
  'open-source contributor',
  'full-stack dev',
]
const links = [
  { href: '/blog', label: 'Blog', external: false },
]

export function Hero() {
  const [vibeHover, setVibeHover] = useState(false)
  const { preload, toggle, playing, clickCount } = useVibeAudio()
  const disco = playing
  return (
    <section className="relative flex min-h-[88dvh] flex-col items-center justify-center px-6 pt-16 text-center">
      <DiscoLights active={disco} />
      <motion.h1
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-6xl font-medium tracking-tight text-base-content md:text-8xl"
        initial={vtState.active ? false : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Magnetic strength={0.18}>
          <span className="relative inline-block">
            <motion.span
              animate={{ opacity: disco ? 0 : 1 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              Sharath
            </motion.span>
            {/* Blurred gradient copy behind — colored echo that matches the gradient */}
            <motion.span
              aria-hidden
              className="absolute inset-0 bg-clip-text text-transparent"
              style={{
                backgroundImage: GRADIENT,
                backgroundSize: '200% 100%',
                backgroundPosition: '0% 0%',
                filter: 'blur(24px)',
              }}
              animate={{
                opacity: disco ? 1 : 0,
                backgroundPosition: disco ? ['0% 0%', '200% 0%'] : '0% 0%',
              }}
              transition={{
                opacity: { duration: 0.45, ease: EASE },
                backgroundPosition: disco
                  ? { duration: 3, ease: 'linear', repeat: Infinity }
                  : { duration: 0.3, ease: EASE },
              }}
            >
              Sharath
            </motion.span>
            {/* Sharp gradient text on top */}
            <motion.span
              className="absolute inset-0 bg-clip-text text-transparent"
              style={{
                backgroundImage: GRADIENT,
                backgroundSize: '200% 100%',
                backgroundPosition: '0% 0%',
              }}
              animate={{
                opacity: disco ? 1 : 0,
                backgroundPosition: disco ? ['0% 0%', '200% 0%'] : '0% 0%',
              }}
              transition={{
                opacity: { duration: 0.45, ease: EASE },
                backgroundPosition: disco
                  ? { duration: 3, ease: 'linear', repeat: Infinity }
                  : { duration: 0.3, ease: EASE },
              }}
            >
              Sharath
            </motion.span>
          </span>
        </Magnetic>
      </motion.h1>

      <motion.div
        animate={{ opacity: 1 }}
        className="relative z-10 mt-5 text-xl font-semibold md:text-2xl"
        initial={vtState.active ? false : { opacity: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <VibeReveal
          reveal={<WaveText text="vibe coder" active={playing} />}
          className="text-primary"
          onHoverChange={(hovered) => { setVibeHover(hovered); if (hovered) preload() }}
          onRevealClick={toggle}
          forceReveal={playing}
          hint={<PointerHint visible={vibeHover || playing} clickedCounter={clickCount} playing={playing} />}
          hideCursor={vibeHover}
        >
          <FlipWords className="text-primary" duration={2800} words={roles} />
        </VibeReveal>
        <motion.p
          animate={{ opacity: 1 }}
          className="mt-6 max-w-md text-sm text-base-content/60 md:text-base"
          initial={vtState.active ? false : { opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <HeroTagline disco={disco} />
        </motion.p>
      </motion.div>

      <motion.div
        animate={{ opacity: 1 }}
        className="mt-8 flex flex-col items-center gap-5 text-sm font-medium"
        initial={vtState.active ? false : { opacity: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <SocialIcons iconClassName="size-5" navClassName="flex items-center gap-4" />
        {links.map((link) => (
          <MagicLink
            key={link.label}
            href={link.href}
            rel={link.external ? 'noreferrer' : undefined}
            target={link.external ? '_blank' : undefined}
            className="group font-medium transition-colors duration-200 hover:text-primary"
          >
            <span style={link.href === '/blog' ? { viewTransitionName: 'blog-heading' } : undefined}>{link.label}</span>
            {link.external && (
              <span className="ml-0.5 inline-block transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            )}
          </MagicLink>
        ))}
      </motion.div>
    </section>
  )
}
