import { Icon } from './icons/Icon'
import type { Difficulty } from '../types'

interface BriefingScreenProps {
  caseNumber: number
  caseName: string
  caseIntro: string
  clueText: string
  roundNumber: number
  totalRounds: number
  timeLimit: number
  energy: number
  cluesAvailable: number
  difficulty: Difficulty
  onStart: () => void
  t: (key: string) => string
}

function formatCaseNumber(n: number): string {
  return n.toString().padStart(3, '0') + '-B'
}

function formatRound(n: number, total: number): string {
  const nn = n.toString().padStart(2, '0')
  const tt = total.toString().padStart(2, '0')
  return `${nn} / ${tt}`
}

export function BriefingScreen({
  caseNumber,
  caseName,
  caseIntro,
  clueText,
  roundNumber,
  totalRounds,
  timeLimit,
  energy,
  cluesAvailable,
  onStart,
  t,
}: BriefingScreenProps) {
  const caseCode = formatCaseNumber(caseNumber)
  const roundTwoDigit = roundNumber.toString().padStart(2, '0')

  return (
    <div className="briefing-overlay" role="dialog" aria-modal="true">
      <div className="gutter-left">
        <span className="gutter-top">MAP NOIR · LAST KNOWN LOCATION</span>
        <span className="gutter-bottom">
          {t('briefing.gutter').toUpperCase()} · R-{roundTwoDigit}
        </span>
      </div>

      <div className="briefing-layout">
        <div className="briefing-stamp">
          <div className="briefing-stamp-left">
            <span className="briefing-stamp-dossier">{t('briefing.dossier').toUpperCase()}</span>
            <span className="briefing-stamp-case">
              {t('session.case')} {caseCode}
            </span>
          </div>
          <div className="briefing-stamp-right">
            <span>{t('briefing.classified').toUpperCase()}</span>
            <span className="briefing-stamp-dot" aria-hidden="true" />
          </div>
        </div>

        <div className="briefing-title-block">
          <div className="briefing-round-label">
            {t('game.round').toUpperCase()} {roundTwoDigit} · {t('briefing.gutter').toUpperCase()}
          </div>
          <h1 className="briefing-title">{caseName}</h1>
          <p className="briefing-subtitle">{caseIntro}</p>
        </div>

        <div className="briefing-clue">
          <div className="briefing-clue-quote" aria-hidden="true">“</div>
          <div>
            <div className="briefing-clue-intel">
              {t('clue.intel')} · 01 · {t('briefing.source').toUpperCase()}
            </div>
            <p className="briefing-clue-text">{clueText}</p>
          </div>
        </div>

        <div className="briefing-meta">
          <div className="briefing-meta-item">
            <span className="briefing-meta-label">
              <Icon name="time" size={12} stroke="currentColor" />
              {t('briefing.timeLimit')}
            </span>
            <span className="briefing-meta-value">
              {timeLimit}
              {t('briefing.seconds')}
            </span>
          </div>
          <div className="briefing-meta-item">
            <span className="briefing-meta-label">
              <Icon name="energy" size={12} stroke="currentColor" />
              {t('briefing.energy')}
            </span>
            <span className="briefing-meta-value">{energy}</span>
          </div>
          <div className="briefing-meta-item">
            <span className="briefing-meta-label">
              <Icon name="clue" size={12} stroke="currentColor" />
              {t('briefing.clues')}
            </span>
            <span className="briefing-meta-value">{cluesAvailable}</span>
          </div>
          <div className="briefing-meta-item">
            <span className="briefing-meta-label">
              <Icon name="pin" size={12} stroke="currentColor" />
              {t('game.round')}
            </span>
            <span className="briefing-meta-value">{formatRound(roundNumber, totalRounds)}</span>
          </div>
        </div>

        <div className="briefing-actions">
          <button type="button" className="btn-cta" onClick={onStart}>
            <span>{t('briefing.start')}</span>
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
