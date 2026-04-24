import { useEffect, useState } from 'react'
import { GlobeLoader } from './GlobeLoader'
import { Icon } from './icons/Icon'
import type { Difficulty } from '../types'
import './SplashScreen.css'

interface SplashScreenProps {
  difficulty: Difficulty
  onDifficultyChange: (d: Difficulty) => void
  onStart: () => void
  loading: boolean
  t: (key: string) => string
}

type Phase = 0 | 1 | 2 | 3
const LOAD_MS = 2200

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

export function SplashScreen({
  difficulty,
  onDifficultyChange,
  onStart,
  loading,
  t,
}: SplashScreenProps) {
  const [phase, setPhase] = useState<Phase>(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let p = 0
    const tickMs = 32
    const id = window.setInterval(() => {
      p += (1 / (LOAD_MS / 16)) * (0.5 + Math.random())
      if (p >= 1) {
        p = 1
        window.clearInterval(id)
        setPhase(1)
        window.setTimeout(() => setPhase(2), 600)
        window.setTimeout(() => setPhase(3), 1700)
      }
      setProgress(Math.min(1, p))
    }, tickMs)
    return () => window.clearInterval(id)
  }, [])

  const isDocked = phase >= 2

  return (
    <div className="splash-root">
      {/* Loader chrome (title + progress + kicker) — fades out once docked */}
      <div
        className={`splash-chrome ${isDocked ? 'is-hidden' : ''}`}
        aria-hidden={isDocked}
      >
        <div className="splash-kicker">▸ CASE FILE · 047-B · OPENING ◂</div>

        <div className="splash-title-block">
          <div className="splash-title">Map Noir</div>
          <div className="splash-subtitle">Last Known Location</div>
        </div>

        <div className="splash-progress">
          <div className="splash-progress-track">
            <div
              className="splash-progress-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="splash-progress-meta">
            <span>TRIANGULANDO COORDENADAS</span>
            <span>{Math.round(progress * 100).toString().padStart(3, '0')}%</span>
          </div>
        </div>
      </div>

      {/* Globe — animates from centered hero to small dock top-left.
          The SVG itself keeps its intrinsic 340px size throughout so the
          animation loop never restarts; the parent applies a CSS transform
          (scale + translate) for the shrink-to-corner motion. */}
      <div className={`splash-loader-slot ${isDocked ? 'is-docked' : ''}`}>
        <div className="splash-loader-inner">
          <GlobeLoader size={340} phase={isDocked ? 2 : 1} />
        </div>
      </div>

      {/* Home content — shows up under the docked globe */}
      <div
        className={`splash-home ${phase >= 2 ? 'is-visible' : ''}`}
        aria-hidden={phase < 2}
      >
        <header className="splash-home-header">
          <div className="splash-home-brand">
            <div className="splash-title splash-title-small">Map Noir</div>
            <div className="splash-subtitle splash-subtitle-small">Last Known Location</div>
          </div>
          <div className="splash-home-case">CASE FILE #047-B</div>
        </header>

        <div className="splash-home-body">
          <section className="splash-home-left">
            <div className="mono-label">▸ {t('idle.kicker')}</div>
            <h1 className="splash-home-hero">{t('idle.title')}</h1>
            <p className="splash-home-copy">{t('idle.description')}</p>
          </section>

          <section className="splash-home-right">
            <div className="splash-home-difficulty">
              <div className="mono-label">{t('idle.difficulty')}</div>
              <div className="difficulty-list">
                {DIFFICULTY_ORDER.map((d) => {
                  const active = d === difficulty
                  return (
                    <button
                      key={d}
                      type="button"
                      className={`difficulty-row ${active ? 'is-active' : ''}`}
                      onClick={() => onDifficultyChange(d)}
                    >
                      <div className="difficulty-row-main">
                        <div className="difficulty-row-name">{t(`difficulty.${d}`)}</div>
                        <div className="difficulty-row-detail">{t(`difficulty.${d}.detail`)}</div>
                      </div>
                      {active && <span className="difficulty-row-flag">● {t('idle.active')}</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              className="splash-cta"
              onClick={onStart}
              disabled={loading}
            >
              <span>{loading ? t('idle.loading') : t('idle.newCase')}</span>
              <Icon name="arrow" size={16} />
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
