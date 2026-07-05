import { useRef, type MouseEvent, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'motion/react'

type Props = {
  children: ReactNode
  href: string
  /** How strongly the link is pulled toward the cursor. 0 disables magnetism. */
  strength?: number
  /** Toggle the animated underline draw. */
  underline?: boolean
  className?: string
  target?: string
  rel?: string
}

const MotionLink = motion.create(Link)

/**
 * An inline link that (a) gently pulls toward the cursor and (b) draws an
 * animated underline on hover. Magnetic pull is spring-smoothed and disabled
 * under reduced-motion; the underline uses currentColor so it recolors with
 * the active theme.
 *
 * Internal links (href starting with `/`) use TanStack Router's <Link> so
 * navigation goes through router.navigate() and fires view transitions.
 * External links use a plain <a> with target="_blank".
 */
export function MagicLink({
  children,
  href,
  strength = 0.4,
  underline = true,
  className = '',
  target,
  rel,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 })

  const isInternal = href.startsWith('/')
  const sharedProps = {
    ref,
    style: { x: sx, y: sy },
    whileTap: reduce ? undefined : { scale: 0.97 },
    onMouseMove: (e: MouseEvent<HTMLAnchorElement>) => {
      if (reduce || !ref.current) return
      const r = ref.current.getBoundingClientRect()
      x.set((e.clientX - (r.left + r.width / 2)) * strength)
      y.set((e.clientY - (r.top + r.height / 2)) * strength)
    },
    onMouseLeave: () => {
      x.set(0)
      y.set(0)
    },
    className: `inline-block ${underline ? 'link-draw' : ''} ${className}`,
  }

  if (isInternal) {
    return (
      <MotionLink to={href} {...sharedProps}>
        {children}
      </MotionLink>
    )
  }

  return (
    <motion.a href={href} target={target} rel={rel} {...sharedProps}>
      {children}
    </motion.a>
  )
}
