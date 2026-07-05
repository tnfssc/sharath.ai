import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

export function FlipWords({
  className,
  duration = 3000,
  words,
}: {
  className?: string
  duration?: number
  words: [string, ...string[]]
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      duration,
    )
    return () => window.clearInterval(id)
  }, [duration, words.length])

  return (
    <span className={`relative inline-block ${className ?? ''}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
