import { GameMap } from './GameMap'
import { Icon } from './icons/Icon'
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
  caseNumber: number
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
  caseNumber,
  onNextRound,
  onViewSummary,
  theme,
  t,
  loading,
}: RoundResultScreenProps) {
  const animatedScore = useCountUp(score)
  const transition = t(`round.transition.${roundIndex + 1}`)
  const accuracy = t(getAccuracyKey(distanceKm))
  const isHit = distanceKm < 500
  const caseCode = caseNumber.toString().padStart(3, '0') + '-B'
  const roundTwo = (roundIndex + 1).toString().padStart(2, '0')
  const totalTwo = totalRounds.toString().padStart(2, '0')

  return (
    <div className="round-result-screen">
      <div className="gutter-left">
        <span className="gutter-top">MAP NOIR · LAST KNOWN LOCATION</span>
        <span className="gutter-bottom">C-{caseCode} / R-{roundTwo}</span>
      </div>

      <div className="round-result-layout">
        <header className="round-result-header">
          <div className="round-result-stamp">
            <span className="round-result-stamp-label">
              {t('roundResult.report').toUpperCase()} · {t('game.round').toUpperCase()} {roundTwo}
            </span>
            <span className="round-result-stamp-case">{caseName}</span>
          </div>
          <div className="round-result-stamp-right">
            {roundTwo} / {totalTwo}
          </div>
        </header>

        <div className="round-result-stage">
          <section className="round-result-left">
            <div className={`round-result-verdict ${isHit ? 'is-hit' : 'is-miss'}`}>
              <span className="mono-label">
                {isHit ? t('roundResult.hit') : t('roundResult.miss')}
              </span>
              <Icon name={isHit ? 'check' : 'x'} size={36} stroke="currentColor" weight={1.4} />
            </div>

            <div className="round-result-stats">
              <div className="round-result-stat">
                <span className="mono-label">{t('result.score')}</span>
                <span className="round-result-stat-value">
                  {animatedScore.toLocaleString()}
                </span>
              </div>
              <div className="round-result-stat">
                <span className="mono-label">{t('result.distance')}</span>
                <span className="round-result-stat-value round-result-stat-sub">
                  {distanceKm.toLocaleString()}
                  <span className="round-result-stat-unit"> km</span>
                </span>
              </div>
            </div>

            <blockquote className="round-result-handler">
              <p className="round-result-handler-line">“{transition}”</p>
              <p className="round-result-handler-accuracy">{accuracy}</p>
            </blockquote>

            <div className="round-result-actions">
              {isLastRound ? (
                <button type="button" className="btn-cta" onClick={onViewSummary} disabled={loading}>
                  <span>{loading ? '…' : t('roundResult.viewSummary')}</span>
                  <Icon name="arrow" size={18} />
                </button>
              ) : (
                <button type="button" className="btn-cta" onClick={onNextRound} disabled={loading}>
                  <span>{loading ? '…' : t('roundResult.nextRound')}</span>
                  <Icon name="arrow" size={18} />
                </button>
              )}
            </div>
          </section>

          <section className="round-result-right">
            <div className="mono-label round-result-map-header">{t('roundResult.trajectory')}</div>
            <div className="round-result-map">
              <GameMap
                theme={theme}
                disabled
                resultMarkers={{ guess: guessLocation, actual: actualLocation }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
