import { useState } from 'react'
import { GameMap } from './GameMap'
import { useCountUp } from '../hooks/useCountUp'
import type { Difficulty, RoundSummaryEntry } from '../types'
import './FinalSummaryScreen.css'

interface FinalSummaryScreenProps {
  caseNumber: number
  difficulty: Difficulty
  rounds: RoundSummaryEntry[]
  totalScore: number
  shareableText: string
  onPlayAgain: () => void
  theme: 'dark' | 'light'
  t: (key: string) => string
  loading: boolean
}

function distanceColor(km: number): string {
  if (km < 200) return 'var(--color-round-good)'
  if (km < 1000) return 'var(--color-round-mid)'
  return 'var(--color-round-bad)'
}

function distanceClass(km: number): string {
  if (km < 200) return 'round-good'
  if (km < 1000) return 'round-mid'
  return 'round-bad'
}

function conclusionTier(totalScore: number): 'good' | 'mid' | 'bad' {
  if (totalScore >= 15000) return 'good'
  if (totalScore >= 8000) return 'mid'
  return 'bad'
}

export function FinalSummaryScreen({
  caseNumber,
  difficulty,
  rounds,
  totalScore,
  shareableText,
  onPlayAgain,
  theme,
  t,
  loading,
}: FinalSummaryScreenProps) {
  const [copied, setCopied] = useState(false)
  const animatedTotal = useCountUp(totalScore, 1500)
  const tier = conclusionTier(totalScore)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = shareableText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const multiResultMarkers = rounds.map((r) => ({
    guess: r.guessLocation,
    actual: r.actualLocation,
    roundIndex: r.roundIndex,
  }))

  return (
    <div className="final-summary-screen">
      <div className="final-summary-header">
        <h2 className="final-summary-title">{t('summary.title')}</h2>
        <p className="final-summary-case">
          {t('session.case')} #{caseNumber} — {t(`difficulty.${difficulty}`)}
        </p>

        <div className="final-summary-total">
          <span className="final-summary-total-value">{animatedTotal.toLocaleString()}</span>
          <span className="final-summary-total-label">{t('summary.totalScore')}</span>
        </div>

        <p className={`final-summary-conclusion conclusion-${tier}`}>
          {t(`summary.conclusion.${tier}`)}
        </p>

        <div className="round-dots">
          {rounds.map((round) => (
            <div
              key={round.roundIndex}
              className={`round-dot ${distanceClass(round.distanceKm)}`}
              title={`${t('summary.round')} ${round.roundIndex + 1}: ${round.score.toLocaleString()} pts — ${round.distanceKm.toLocaleString()} km`}
            />
          ))}
        </div>
      </div>

      <div className="final-summary-body">
        <div className="final-summary-map">
          <GameMap
            theme={theme}
            disabled
            multiResultMarkers={multiResultMarkers}
          />
        </div>

        <div className="final-summary-sidebar">
          <div className="final-summary-table">
            {rounds.map((round) => (
              <div
                key={round.roundIndex}
                className={`summary-table-row ${distanceClass(round.distanceKm)}`}
              >
                <span className="summary-table-round">{round.roundIndex + 1}</span>
                <span
                  className="summary-table-indicator"
                  style={{ backgroundColor: distanceColor(round.distanceKm) }}
                />
                <span className="summary-table-distance">{round.distanceKm.toLocaleString()} km</span>
                <span className="summary-table-score">{round.score.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="final-summary-share">
            <pre className="share-text">{shareableText}</pre>
            <button
              className={`btn btn-sm ${copied ? 'btn-primary' : 'btn-ghost'}`}
              onClick={handleCopy}
            >
              {copied ? t('summary.copied') : t('summary.share')}
            </button>
          </div>

          <div className="final-summary-actions">
            <button className="btn btn-primary btn-lg" onClick={onPlayAgain} disabled={loading}>
              {loading ? '...' : t('summary.playAgain')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
