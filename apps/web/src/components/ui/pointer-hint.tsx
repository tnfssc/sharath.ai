import { useRef, type MouseEvent, type ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from 'motion/react'
import { Play, Square } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * A small badge with a play icon that follows the cursor inside its parent
 * (the parent bounds define the tracking zone). Spring-smoothed for fluid
 * trailing. On click (signalled via `clickedCounter` increment), the badge
 * pulses outward to confirm the action. Hidden by default, shown only while
 * `visible` is true.
 *
 * NOTE: Must be mounted inside an element sized to the area you want it to
 * track (e.g. the "vibe coder" text bounds, NOT the wider FlipWords area).
 * The outer tracking span has `pointer-events: auto` so onMouseMove fires;
 * the inner badge has `pointer-events: none` so clicks pass through to the
 * parent's onClick handler.
 */
export function PointerHint({
  visible,
  clickedCounter,
  playing,
  children,
}: {
  visible: boolean
  clickedCounter: number
  playing: boolean
  children?: ReactNode
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()

  // Track cursor position relative to container (in px).
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 })

  function onMouseMove(e: MouseEvent<HTMLSpanElement>) {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set(e.clientX - r.left)
    y.set(e.clientY - r.top)
  }

  return (
    <span ref={ref} className="absolute inset-0 z-30" onMouseMove={onMouseMove}>
      <AnimatePresence>
        {visible && (
          <motion.span
            className="pointer-events-none absolute flex items-center justify-center"
            style={{ left: sx, top: sy, x: '-50%', y: '-50%' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <Badge clicked={clickedCounter > 0} clickKey={clickedCounter} playing={playing}>
              {children}
            </Badge>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

function Badge({
  clicked,
  clickKey,
  playing,
  children,
}: {
  clicked: boolean
  clickKey: number
  playing: boolean
  children?: ReactNode
}) {
  return (
    <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-content shadow-sm">
      <AnimatePresence mode="wait" initial={false}>
        {playing ? (
          <motion.span
            key="stop"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: EASE }}
          >
            <Square className="size-3 fill-current" />
          </motion.span>
        ) : (
          <motion.span
            key="play"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: EASE }}
          >
            <Play className="size-3 fill-current" />
          </motion.span>
        )}
      </AnimatePresence>
      {clicked && (
        <motion.span
          key={clickKey}
          className="absolute inset-0 rounded-full ring-2 ring-primary"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      )}
      {children}
    </span>
  )
}