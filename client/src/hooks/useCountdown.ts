import { useEffect, useRef, useState } from 'react'

interface Options {
  timeLimit: number
  paused?: boolean
  onTimeUp: () => void
  onUrgentTick?: () => void
  /** Only active once flagged — use to delay until briefing is dismissed. */
  enabled?: boolean
}

/** Countdown timer hook. Returns remaining seconds as a continuous value. */
export function useCountdown({ timeLimit, paused = false, onTimeUp, onUrgentTick, enabled = true }: Options) {
  const [remaining, setRemaining] = useState(timeLimit)
  const startRef = useRef(Date.now())
  const onTimeUpRef = useRef(onTimeUp)
  const onUrgentTickRef = useRef(onUrgentTick)
  const firedRef = useRef(false)
  const lastTickSecRef = useRef(-1)

  onTimeUpRef.current = onTimeUp
  onUrgentTickRef.current = onUrgentTick

  useEffect(() => {
    startRef.current = Date.now()
    setRemaining(timeLimit)
    firedRef.current = false
    lastTickSecRef.current = -1
  }, [timeLimit, enabled])

  useEffect(() => {
    if (paused || !enabled) return

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000
      const left = Math.max(0, timeLimit - elapsed)
      setRemaining(left)

      const sec = Math.ceil(left)
      if (left > 0 && left <= 10 && sec !== lastTickSecRef.current) {
        lastTickSecRef.current = sec
        onUrgentTickRef.current?.()
      }

      if (left <= 0 && !firedRef.current) {
        firedRef.current = true
        clearInterval(interval)
        onTimeUpRef.current()
      }
    }, 100)

    return () => clearInterval(interval)
  }, [timeLimit, paused, enabled])

  return remaining
}
