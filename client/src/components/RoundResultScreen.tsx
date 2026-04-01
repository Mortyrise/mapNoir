import { GameMap } from './GameMap'
import { useCountUp } from '../hooks/useCountUp'
import type { LatLng } from '../types'
import './RoundResultScreen.css'

interface RoundResultScreenProps {
  roundIndex: number
  totalRounds: number
  score: number
  distanceKm: number
  guessLocation: LatLng
  actualLocation: LatLng
  isLastRound: boolean
  caseName: string
  onNextRound: () => void
  onViewSummary: () => void
  theme: 'dark' | 'light'
  t: (key: string) => string
  loading: boolean
}

function getAccuracyKey(km: number): string {
  if (km < 50) return 'handler.accuracy.excellent'
  if (km < 200) return 'handler.accuracy.good'
  if (km < 500) return 'handler.accuracy.decent'
  if (km < 1000) return 'handler.accuracy.poor'
  return 'handler.accuracy.cold'
}

export function RoundResultScreen({
  roundIndex,
  totalRounds,
  score,
  distanceKm,
  guessLocation,
  actualLocation,
  isLastRound,
  caseName,
  onNextRound,
  onViewSummary,
  theme,
  t,
  loading,
}: RoundResultScreenProps) {
  const animatedScore = useCountUp(score)
  const transition = t(`round.transition.${roundIndex + 1}`)
  const accuracy = t(getAccuracyKey(distanceKm))

  return (
    <div className="round-result-screen">
      <div className="round-result-header">
        <span className="round-result-case">{caseName}</span>
        <h2 className="round-result-title">
          {t('game.round')} {roundIndex + 1}/{totalRounds}
        </h2>
        <div className="round-result-stats">
          <div className="round-result-stat">
            <span className="round-result-stat-label">{t('result.score')}</span>
            <span className="round-result-stat-value">{animatedScore.toLocaleString()}</span>
          </div>
          <div className="round-result-stat">
            <span className="round-result-stat-label">{t('result.distance')}</span>
            <span className="round-result-stat-value">{distanceKm.toLocaleString()} km</span>
          </div>
        </div>
      </div>

      <div className="round-result-handler">
        <p className="handler-line">{transition}</p>
        <p className="handler-accuracy">{accuracy}</p>
      </div>

      <div className="round-result-map">
        <GameMap
          theme={theme}
          disabled
          resultMarkers={{ guess: guessLocation, actual: actualLocation }}
        />
      </div>

      <div className="round-result-actions">
        {isLastRound ? (
          <button className="btn btn-primary btn-lg" onClick={onViewSummary} disabled={loading}>
            {loading ? '...' : t('roundResult.viewSummary')}
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={onNextRound} disabled={loading}>
            {loading ? '...' : t('roundResult.nextRound')}
          </button>
        )}
      </div>
    </div>
  )
}
