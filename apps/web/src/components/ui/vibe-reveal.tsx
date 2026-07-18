import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useMotionTemplate,
} from 'motion/react'

/**
 * Stacks two content layers. On hover, a radial mask follows the cursor and
 * reveals the hidden "reveal" layer underneath — the base layer masks away
 * in the same circle so they don't overlap. On leave, the mask snaps shut.
 *
 * Both layers must have identical layout/structure so positions match.
 * Reduced-motion: instant opacity crossfade, no mask.
 *
 * The reveal layer (masked) is sized to `reveal` content (shrink-to-fit), so
 * the mask tracks cursor within "vibe coder" bounds, not the wider base layer.
 * The `hint` slot (optional) is rendered in an UNMASKED sibling layer sized
 * via an invisible duplicate of `reveal` — so the hint's tracking bounds match
 * the reveal text. Click hits the hint layer (topmost) and bubbles to the
 * onClick attached to the masked reveal layer below it; if no hint is
 * provided, the reveal layer itself receives clicks.
 */
export function VibeReveal({
  children,
  reveal,
  className = '',
  onHoverChange,
  onRevealClick,
  hint,
  hideCursor,
  forceReveal,
}: {
  /** Base layer — visible by default. */
  children: ReactNode
  /** Reveal layer — visible through the radial mask on hover. */
  reveal: ReactNode
  className?: string
  /** Called when hover state changes (for driving external crossfades). */
  onHoverChange?: (hovered: boolean) => void
  /** Called when the reveal layer is clicked. */
  onRevealClick?: () => void
  /** Optional unmasked hint (e.g. a pointer-following play badge). */
  hint?: ReactNode
  /** Hide the system cursor inside the container (e.g. while hint is shown). */
  hideCursor?: boolean
  /** Force the reveal layer visible (e.g. while audio plays, even without hover). */
  forceReveal?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()

  // Mouse position relative to the element, as a percentage.
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)

  // Mask size: 0 when not hovered → 100% on hover, slow spring for subtlety.
  const maskSize = useSpring(0, { stiffness: 80, damping: 30, mass: 0.6 })

  const mask = useMotionTemplate`radial-gradient(circle at ${mouseX}% ${mouseY}%, black ${maskSize}%, transparent ${maskSize}%)`
  const inverseMask = useMotionTemplate`radial-gradient(circle at ${mouseX}% ${mouseY}%, transparent ${maskSize}%, black ${maskSize}%)`

  function onMouseMove(e: MouseEvent<HTMLSpanElement>) {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mouseX.set(((e.clientX - r.left) / r.width) * 100)
    mouseY.set(((e.clientY - r.top) / r.height) * 100)
  }

  function onMouseEnter() {
    if (!reduce) maskSize.set(100)
    onHoverChange?.(true)
  }

  function onMouseLeave() {
    if (!reduce && !forceReveal) maskSize.set(0)
    onHoverChange?.(false)
  }

  // Force reveal open when forceReveal is true (e.g. audio playing without hover)
  useEffect(() => {
    if (forceReveal && !reduce) maskSize.set(100)
    else if (!forceReveal && !reduce && ref.current) {
      // Only close if not currently hovered (check via element matches)
      const hovered = ref.current.matches(':hover')
      if (!hovered) maskSize.set(0)
    }
  }, [forceReveal, reduce, maskSize])

  if (reduce) {
    return (
      <span ref={ref} className={`group relative inline-block ${className}`}>
        <span className="transition-opacity duration-300 group-hover:opacity-0">{children}</span>
        <span
          className="absolute left-1/2 top-0 inline-flex -translate-x-1/2 cursor-pointer opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          onClick={onRevealClick}
        >
          {reveal}
        </span>
        {/* Keyboard-accessible, AT-exposed trigger. The clickable layers above
            are decorative (visual only); this sr-only button carries the
            action for keyboard and screen-reader users. */}
        {onRevealClick && (
          <button type="button" className="sr-only" onClick={onRevealClick}>
            Toggle vibe audio
          </button>
        )}
      </span>
    )
  }
  return (
    <span
      ref={ref}
      className={`relative inline-block min-w-[270px] ${hideCursor ? 'cursor-none [&_*]:cursor-none' : 'cursor-auto'} ${className}`}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Base layer — masked away on hover where reveal shows */}
      <motion.span
        className="relative z-10"
        style={{ mask: inverseMask, WebkitMask: inverseMask }}
      >
        {children}
      </motion.span>
      {/* Reveal layer — masked, centered within container so it stays put
          as FlipWords' width changes (container is text-center'd by parent) */}
      <motion.span
        aria-hidden
        className="absolute left-1/2 top-0 z-20 inline-flex -translate-x-1/2 cursor-pointer"
        style={{ mask, WebkitMask: mask }}
        onClick={hint ? undefined : onRevealClick}
      >
        {reveal}
      </motion.span>
      {/* Hint interaction zone — unmasked, sized to reveal via invisible duplicate */}
      {hint && (
        <span
          className="absolute left-1/2 top-0 z-30 inline-flex -translate-x-1/2 cursor-pointer"
          onClick={onRevealClick}
        >
          {/* Invisible duplicate of `reveal` that sizes this layer to the
              reveal text bounds so the hint tracks the cursor correctly.
              Cost: mounts WaveText twice (doubling its animations). Kept
              because CSS-only sizing of masked motion content is fragile. */}
          <span className="invisible" aria-hidden>{reveal}</span>
          {hint}
        </span>
      )}
      {/* Keyboard-accessible, AT-exposed trigger. The masked/hint layers above
          handle mouse clicks but are aria-hidden (decorative); this sr-only
          button carries the action for keyboard and screen-reader users. */}
      {onRevealClick && (
        <button type="button" className="sr-only" onClick={onRevealClick}>
          Toggle vibe audio
        </button>
      )}
    </span>
  )
}
