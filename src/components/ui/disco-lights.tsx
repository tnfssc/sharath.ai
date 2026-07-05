import { motion } from 'motion/react'

const EASE = [0.16, 1, 0.3, 1] as const

const orbs = [
  {
    color: 'var(--color-primary)',
    size: '35rem',
    startX: '5%', startY: '15%',
    endX: '25%', endY: '60%',
    duration: 8,
    delay: 0,
  },
  {
    color: 'var(--color-secondary)',
    size: '30rem',
    startX: '80%', startY: '20%',
    endX: '60%', endY: '70%',
    duration: 10,
    delay: -2,
  },
  {
    color: 'var(--color-accent)',
    size: '28rem',
    startX: '40%', startY: '70%',
    endX: '70%', endY: '30%',
    duration: 9,
    delay: -4,
  },
  {
    color: 'var(--color-primary)',
    size: '24rem',
    startX: '70%', startY: '60%',
    endX: '20%', endY: '40%',
    duration: 11,
    delay: -1,
  },
  {
    color: 'var(--color-secondary)',
    size: '22rem',
    startX: '15%', startY: '50%',
    endX: '85%', endY: '15%',
    duration: 12,
    delay: -5,
  },
  {
    color: 'var(--color-accent)',
    size: '26rem',
    startX: '50%', startY: '10%',
    endX: '30%', endY: '75%',
    duration: 10,
    delay: -3,
  },
]

/**
 * Animated blurred color orbs that drift around the hero section — using
 * live theme tokens so colors swap with the active daisyUI theme. Sits
 * absolutely behind content with pointer-events disabled.
 */
export function DiscoLights({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.startX,
            top: orb.startY,
            backgroundImage: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            opacity: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{
            left: [orb.startX, orb.endX, orb.startX],
            top: [orb.startY, orb.endY, orb.startY],
            opacity: active ? 0.35 : 0,
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            opacity: { duration: 0.6, ease: EASE },
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}