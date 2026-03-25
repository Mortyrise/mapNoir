import { useEffect, useRef, useState, useCallback } from 'react'

interface TimerProps {
  timeLimit: number // seconds
  onTimeUp: () => void
  onUrgentTick?: () => void
  paused?: boolean
}

export function Timer({ timeLimit, onTimeUp, onUrgentTick, paused = false }: TimerProps) {
  const [remaining, setRemaining] = useState(timeLimit)
  const startTimeRef = useRef(Date.now())
  const onTimeUpRef = useRef(onTimeUp)
  const onUrgentTickRef = useRef(onUrgentTick)
  const firedRef = useRef(false)
  const lastTickSecRef = useRef(-1)

  onTimeUpRef.current = onTimeUp
  onUrgentTickRef.current = onUrgentTick

  useEffect(() => {
    startTimeRef.current = Date.now()
    setRemaining(timeLimit)
    firedRef.current = false
  }, [timeLimit])

  useEffect(() => {
    if (paused) return

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const left = Math.max(0, timeLimit - elapsed)
      setRemaining(left)

      // Play tick sound each second when urgent
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
  }, [timeLimit, paused])

  const seconds = Math.ceil(remaining)
  const fraction = remaining / timeLimit
  const isUrgent = remaining <= 10

  const formatTime = useCallback((s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return (
    <div className={`timer ${isUrgent ? 'timer-urgent' : ''}`}>
      <div className="timer-bar-track">
        <div
          className="timer-bar-fill"
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <span className="timer-text">{formatTime(seconds)}</span>
    </div>
  )
}
