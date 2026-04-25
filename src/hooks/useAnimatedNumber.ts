import { useEffect, useRef, useState } from 'react'

// Tweens a number from its previous rendered value to the new target.
// Skips animation on the very first render so we don't always count up from 0.
export function useAnimatedNumber(target: number, duration = 600): number {
  const [value, setValue] = useState(target)
  const previousRef = useRef(target)
  const frameRef = useRef<number | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      previousRef.current = target
      setValue(target)
      return
    }

    const start = previousRef.current
    const change = target - start
    if (change === 0) return

    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      const current = start + change * eased
      setValue(current)
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        previousRef.current = target
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration])

  return value
}
