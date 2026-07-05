import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

type Direction = 'up' | 'down' | 'left' | 'right'

const DIST = 24
const vec: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: DIST },
  down: { x: 0, y: -DIST },
  left: { x: DIST, y: 0 },
  right: { x: -DIST, y: 0 },
}

/**
 * Scroll-reveal wrapper: a directional spring entrance (once, on view).
 * Reduced-motion users get the content immediately with no transform.
 */
export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className,
}: {
  children: ReactNode
  delay?: number
  direction?: Direction
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  const o = vec[direction]
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: o.x, y: o.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
