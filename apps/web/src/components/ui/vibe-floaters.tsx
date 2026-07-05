import { useEffect, useRef, useState } from 'react'

// Per-floater config: fractional start position, initial direction (dx,dy),
// a hue-rotate tint, and a speed multiplier (keeps the 4 out of sync so they
// don't hit corners simultaneously).
const SIZE = 104 // px — square (source is 220×220)
const BASE_SPEED = 2.4 // px/frame @60fps ≈ 144px/s (leisurely DVD pace)
const FLOATERS = [
  { x: 0.06, y: 0.16, dx: 1, dy: 1, hue: 0, sp: 1.0 },
  { x: 0.78, y: 0.24, dx: -1, dy: 1, hue: 80, sp: 1.18 },
  { x: 0.22, y: 0.74, dx: 1, dy: -1, hue: 175, sp: 0.88 },
  { x: 0.76, y: 0.7, dx: -1, dy: -1, hue: 270, sp: 1.28 },
] as const

/**
 * Four copies of the "no think, vibe only" gif that bounce around the viewport
 * like DVD logos — constant-velocity diagonal drift with edge reflection, each
 * tinted a different hue. Sits as a non-interactive overlay on top of content
 * (pointer-events disabled, clicks pass straight through). Honors
 * prefers-reduced-motion by rendering the floaters static at their start spots.
 */
export function VibeFloaters({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const elsRef = useRef<(HTMLDivElement | null)[]>([])
  const stateRef = useRef(
    FLOATERS.map(() => ({ px: 0, py: 0, vx: 0, vy: 0, init: false })),
  )
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = () => {
      const root = rootRef.current
      if (!root) {
        if (!reduced) raf = requestAnimationFrame(tick)
        return
      }
      const maxX = Math.max(0, root.clientWidth - SIZE)
      const maxY = Math.max(0, root.clientHeight - SIZE)
      stateRef.current.forEach((s, i) => {
        const f = FLOATERS[i]
        if (!s.init) {
          s.px = f.x * maxX
          s.py = f.y * maxY
          s.vx = f.dx * BASE_SPEED * f.sp
          s.vy = f.dy * BASE_SPEED * f.sp
          s.init = true
        } else if (!reduced) {
          s.px += s.vx
          s.py += s.vy
          if (s.px <= 0) {
            s.px = 0
            s.vx = Math.abs(s.vx)
          } else if (s.px >= maxX) {
            s.px = maxX
            s.vx = -Math.abs(s.vx)
          }
          if (s.py <= 0) {
            s.py = 0
            s.vy = Math.abs(s.vy)
          } else if (s.py >= maxY) {
            s.py = maxY
            s.vy = -Math.abs(s.vy)
          }
        }
        const el = elsRef.current[i]
        if (el) el.style.transform = `translate3d(${s.px}px, ${s.py}px, 0)`
      })
      if (!reduced) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, reduced])

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      style={{
        opacity: active ? 1 : 0,
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {FLOATERS.map((f, i) => (
        <div
          key={i}
          ref={(el) => {
            elsRef.current[i] = el
          }}
          className="absolute left-0 top-0 will-change-transform"
          style={{
            width: SIZE,
            height: SIZE,
            filter: `hue-rotate(${f.hue}deg) saturate(1.25)`,
            opacity: 0.85,
          }}
        >
          <img
            src="/nothink-vibeonly.webp"
            alt=""
            draggable={false}
            className="h-full w-full select-none"
          />
        </div>
      ))}
    </div>
  )
}
