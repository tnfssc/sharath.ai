import { useCallback, useRef, useState } from 'react'

const CLIPS = [
  '/audio/vibe-1.mp3',
  '/audio/vibe-2.mp3',
  '/audio/vibe-3.mp3',
  '/audio/vibe-4.mp3',
]

/**
 * Manages 4 audio clips for the "vibe coder" click interaction.
 *
 * - `preload()`: called on hover — creates Audio elements with
 *   `preload="auto"` so the browser starts fetching immediately.
 *   No-op if already preloaded.
 * - `toggle()`: called on click — if a clip is playing, stops it;
 *   otherwise picks a random clip (avoiding immediate repeats) and plays.
 * - `playing`: true while a clip is actively playing (drives wave animation).
 * - `clickCount`: increments on each click (retriggers PointerHint pulse).
 */
export function useVibeAudio() {
  const audios = useRef<HTMLAudioElement[]>([])
  const lastIdx = useRef(-1)
  const preloaded = useRef(false)
  const playingRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  const setPlayingState = useCallback((v: boolean) => {
    playingRef.current = v
    setPlaying(v)
  }, [])

  const preload = useCallback(() => {
    if (preloaded.current) return
    preloaded.current = true
    audios.current = CLIPS.map((src) => {
      const a = new Audio(src)
      a.preload = 'auto'
      a.addEventListener('ended', () => setPlayingState(false))
      a.addEventListener('pause', () => setPlayingState(false))
      return a
    })
  }, [setPlayingState])

  const toggle = useCallback(() => {
    if (!preloaded.current) preload()
    setClickCount((c) => c + 1)

    if (playingRef.current) {
      // Stop playing — don't replay
      for (const a of audios.current) {
        a.pause()
        a.currentTime = 0
      }
      setPlayingState(false)
      return
    }

    // Stop any lingering (safety)
    for (const a of audios.current) {
      a.pause()
      a.currentTime = 0
    }

    // Pick a random index, avoiding immediate repeat
    let idx = lastIdx.current
    while (idx === lastIdx.current && audios.current.length > 1) {
      idx = Math.floor(Math.random() * audios.current.length)
    }
    lastIdx.current = idx

    const clip = audios.current[idx]
    if (clip) {
      clip.currentTime = 0
      clip.play().then(() => setPlayingState(true)).catch(() => {})
    }
  }, [preload, setPlayingState])

  return { preload, toggle, playing, clickCount }
}