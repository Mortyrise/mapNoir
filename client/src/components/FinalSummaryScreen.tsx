import { useState } from 'react'
import { Icon } from './icons/Icon'
import { useCountUp } from '../hooks/useCountUp'
import type { Difficulty, RoundSummaryEntry } from '../types'
import './FinalSummaryScreen.css'

interface FinalSummaryScreenProps {
  caseNumber: number
  caseName: string
  difficulty: Difficulty
  rounds: RoundSummaryEntry[]
  totalScore: number
  shareableText: string
  onPlayAgain: () => void
  theme: 'dark' | 'light'
  t: (key: string) => string
  loading: boolean
}

type Tier = 'good' | 'mid' | 'bad'

function conclusionTier(totalScore: number): Tier {
  if (totalScore >= 15000) return 'good'
  if (totalScore >= 8000) return 'mid'
  return 'bad'
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''))
}

function avgAccuracy(rounds: RoundSummaryEntry[]): number {
  if (rounds.length === 0) return 0
  // Simple heuristic: 100% at 0km, 0% at 2000km or more.
  const score = rounds.reduce((acc, r) => acc + Math.max(0, 1 - Math.min(1, r.distanceKm / 2000)), 0)
  return Math.round((score / rounds.length) * 100)
}

export function FinalSummaryScreen({
  caseNumber,
  caseName,
  difficulty,
  rounds,
  totalScore,
  shareableText,
  onPlayAgain,
  t,
  loading,
}: FinalSummaryScreenProps) {
  const [copied, setCopied] = useState(false)
  const animatedTotal = useCountUp(totalScore, 1500)
  const tier = conclusionTier(totalScore)

  const hits = rounds.filter((r) => r.distanceKm < 500).length
  const totalRounds = rounds.length
  const accuracy = avgAccuracy(rounds)

  const bestRound = rounds.reduce((a, b) => (a.distanceKm <= b.distanceKm ? a : b))
  const worstRound = rounds.reduce((a, b) => (a.distanceKm >= b.distanceKm ? a : b))

  const caseCode = caseNumber.toString().padStart(3, '0') + '-B'

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

  // Split the verdict title so the last word gets the italic accent treatment.
  const verdictRaw = t(`summary.verdict.${tier}`)
  const words = verdictRaw.trim().split(' ')
  const lastWord = words.pop() ?? ''
  const leadingWords = words.join(' ')

  return (
    <div className="final-summary-screen">
      <div className="gutter-left">
        <span className="gutter-top">MAP NOIR · LAST KNOWN LOCATION</span>
        <span className="gutter-bottom">{t('summary.verdictGutter')} · C-{caseCode}</span>
      </div>

      <div className="final-summary-layout">
        {/* LEFT — verdict */}
        <section className="final-summary-verdict">
          <header className="final-summary-verdict-head">
            <span>{t('summary.verdictHead').toUpperCase()}</span>
            <span>
              {rounds.length.toString().padStart(2, '0')} / {totalRounds.toString().padStart(2, '0')}{' '}
              {t('game.round').toUpperCase()}S
            </span>
          </header>

          <div>
            <div className="final-summary-hits">
              {hits}/{totalRounds} {t('summary.hits').toUpperCase()}
            </div>
            <h1 className="final-summary-title">
              {leadingWords}
              {leadingWords ? <br /> : null}
              <span className="final-summary-title-accent">{lastWord}</span>
            </h1>
            <p className="final-summary-recap">
              {t(`summary.conclusion.${tier}`)}
            </p>
          </div>

          <div className="final-summary-totals">
            <div className="final-summary-total">
              <span className="mono-label">{t('summary.totalScore').toUpperCase()}</span>
              <span className="final-summary-total-value accent">
                {animatedTotal.toLocaleString()}
              </span>
            </div>
            <div className="final-summary-total">
              <span className="mono-label">{t('summary.accuracy').toUpperCase()}</span>
              <span className="final-summary-total-value">
                {accuracy}
                <span className="final-summary-total-pct">%</span>
              </span>
            </div>
          </div>

          <div className="final-summary-actions">
            <button type="button" className="btn-cta" onClick={onPlayAgain} disabled={loading}>
              <span>{loading ? '…' : t('summary.playAgain')}</span>
              <Icon name="arrow" size={18} />
            </button>
            <button
              type="button"
              className="btn-ghost-mono"
              onClick={handleCopy}
              title={t('summary.share')}
            >
              {copied ? t('summary.copied') : t('summary.share')}
            </button>
          </div>
        </section>

        {/* RIGHT — ledger */}
        <section className="final-summary-ledger">
          <header className="final-summary-ledger-head">
            <span>{t('summary.ledger').toUpperCase()}</span>
            <span>
              {t('summary.round').toUpperCase()} · {t('summary.distance').toUpperCase()} · {t('summary.score').toUpperCase()}
            </span>
          </header>

          <div className="final-summary-ledger-rows">
            {rounds.map((r) => {
              const hit = r.distanceKm < 500
              const n = (r.roundIndex + 1).toString().padStart(2, '0')
              return (
                <div key={r.roundIndex} className={`ledger-row ${hit ? 'is-hit' : 'is-miss'}`}>
                  <div className="ledger-n">{n}</div>
                  <div className="ledger-city">
                    {r.actualLocation.lat.toFixed(2)}°, {r.actualLocation.lng.toFixed(2)}°
                  </div>
                  <div className="ledger-dist">
                    {r.distanceKm.toLocaleString()} km
                  </div>
                  <div className="ledger-pts">{r.score.toLocaleString()}</div>
                  <div className="ledger-icon">
                    <Icon
                      name={hit ? 'check' : 'x'}
                      size={14}
                      stroke="currentColor"
                      weight={1.5}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <footer className="final-summary-ledger-foot">
            <span>
              {interpolate(t('summary.bestRound'), {
                round: bestRound.roundIndex + 1,
                distance: bestRound.distanceKm.toLocaleString(),
              })}
            </span>
            <span>
              {interpolate(t('summary.worstRound'), {
                round: worstRound.roundIndex + 1,
                distance: worstRound.distanceKm.toLocaleString(),
              })}
            </span>
          </footer>

          <div className="final-summary-meta">
            <span className="mono-label">
              {t('session.case')} #{caseCode} · {caseName} · {t(`difficulty.${difficulty}`).toUpperCase()}
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
