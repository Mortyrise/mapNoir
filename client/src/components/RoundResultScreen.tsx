import { GameMap } from './GameMap'
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
  onNextRound: () => void
  onViewSummary: () => void
  theme: 'dark' | 'light'
  t: (key: string) => string
  loading: boolean
}

export function RoundResultScreen({
  roundIndex,
  totalRounds,
  score,
  distanceKm,
  guessLocation,
  actualLocation,
  isLastRound,
  onNextRound,
  onViewSummary,
  theme,
  t,
  loading,
}: RoundResultScreenProps) {
  return (
    <div className="round-result-screen">
      <div className="round-result-header">
        <h2 className="round-result-title">
          {t('game.round')} {roundIndex + 1}/{totalRounds}
        </h2>
        <div className="round-result-stats">
          <div className="round-result-stat">
            <span className="round-result-stat-label">{t('result.score')}</span>
            <span className="round-result-stat-value">{score.toLocaleString()}</span>
          </div>
          <div className="round-result-stat">
            <span className="round-result-stat-label">{t('result.distance')}</span>
            <span className="round-result-stat-value">{distanceKm.toLocaleString()} km</span>
          </div>
        </div>
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
