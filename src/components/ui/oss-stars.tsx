import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'motion/react'
import { Star } from 'lucide-react'

const POP: Variants = {
  hidden: { scale: 0, rotate: -45, opacity: 0 },
  shown: { scale: 1, rotate: 0, opacity: 1 },
}

/** Format a star count for display: 8 → "8", 19915 → "19.9k", 246230 → "246k". */
function formatStars(n: number): string {
  if (n < 1000) return String(n)
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`
  return `${Math.round(n / 1000)}k`
}

/**
 * A repo's star count as a microinteraction: the star icon pops in (scale +
 * rotate spring) when scrolled into view, and on hover of an ancestor `.group`
 * it scales up, tilts, and tints to the theme primary. Reduced-motion: static.
 * The count itself still ticks up from 0 on view.
 */
export function Stars({ count }: { count: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setVal(count)
      return
    }
    let raf = 0
    const start = performance.now()
    const duration = 1.4
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(count * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setVal(count)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, count, reduce])

  return (
    <span
      ref={ref}
      className="ml-1 inline-flex items-center gap-0.5 text-xs text-base-content/65 transition-colors duration-300 group-hover:text-primary"
    >
      <motion.span
        aria-hidden
        className="inline-flex"
        variants={POP}
        animate={reduce ? 'shown' : inView ? 'shown' : 'hidden'}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 14 }}
        whileHover={reduce ? undefined : { scale: 1.35, rotate: 18 }}
      >
        <Star className="size-3" />
      </motion.span>
      <span>{formatStars(Math.round(val))}</span>
    </span>
  )
}
