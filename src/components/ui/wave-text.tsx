import { motion, useReducedMotion } from 'motion/react'

/**
 * Splits text into individual characters, each on a staggered sine wave.
 * While `active` is true, chars bob up and down infinitely. When `active`
 * becomes false, the wave smoothly settles back to y=0 (each char eases
 * to its rest position rather than unmounting abruptly).
 *
 * Reduced-motion: renders plain text without animation.
 */
export function WaveText({
  text,
  active,
  className = '',
}: {
  text: string
  active: boolean
  className?: string
}) {
  const reduce = useReducedMotion()

  if (reduce) return <span className={className}>{text}</span>

  return (
    <span className={`inline-block ${className}`} aria-label={text}>
      {Array.from(text).map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          animate={active ? { y: [0, -4, 0] } : { y: 0 }}
          transition={
            active
              ? { duration: 0.8, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' }
              : { duration: 0.45, delay: i * 0.025, ease: 'easeOut' }
          }
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}