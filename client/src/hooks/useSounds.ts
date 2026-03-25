import { useState, useCallback, useRef } from 'react'

type SoundType = 'guess-submit' | 'timer-tick' | 'result-good' | 'result-bad' | 'session-complete'

const SOUND_PATHS: Record<SoundType, string> = {
  'guess-submit': '/sounds/guess-submit.wav',
  'timer-tick': '/sounds/timer-tick.wav',
  'result-good': '/sounds/result-good.wav',
  'result-bad': '/sounds/result-bad.wav',
  'session-complete': '/sounds/session-complete.wav',
}

const SOUND_VOLUMES: Record<SoundType, number> = {
  'guess-submit': 0.4,
  'timer-tick': 0.2,
  'result-good': 0.5,
  'result-bad': 0.4,
  'session-complete': 0.5,
}

const STORAGE_KEY = 'mapnoir-muted'

export function useSounds() {
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })
  const audioCache = useRef<Map<SoundType, HTMLAudioElement>>(new Map())

  const play = useCallback((sound: SoundType) => {
    if (muted) return

    let audio = audioCache.current.get(sound)
    if (!audio) {
      audio = new Audio(SOUND_PATHS[sound])
      audioCache.current.set(sound, audio)
    }

    audio.volume = SOUND_VOLUMES[sound]
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [muted])

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  return { play, muted, toggleMute }
}
