import type { GameAction } from '../types'

interface ResourceBarProps {
  energy: number
  maxEnergy: number
  movementUnlocked: boolean
  hasBet: boolean
  cluesAvailable: boolean
  onAction: (action: GameAction) => void
  disabled?: boolean
  t: (key: string) => string
}

export function ResourceBar({
  energy,
  maxEnergy,
  movementUnlocked,
  hasBet,
  cluesAvailable,
  onAction,
  disabled = false,
  t,
}: ResourceBarProps) {
  const noEnergy = energy <= 0

  return (
    <div className="resource-bar">
      <div className="energy-display">
        <span className="energy-label">{t('resource.energy')}</span>
        <div className="energy-pips">
          {Array.from({ length: maxEnergy }, (_, i) => (
            <span
              key={i}
              className={`energy-pip ${i < energy ? 'energy-pip-active' : 'energy-pip-spent'}`}
            />
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-secondary btn-sm action-btn"
          onClick={() => onAction('move')}
          disabled={disabled || noEnergy || movementUnlocked}
          title={movementUnlocked ? t('resource.move.done') : t('resource.move.title')}
        >
          <span className="action-icon">&#x27A4;</span>
          <span className="action-text">
            {movementUnlocked ? t('resource.moving') : t('resource.move')}
          </span>
          {!movementUnlocked && <span className="action-cost">1</span>}
        </button>

        <button
          className="btn btn-secondary btn-sm action-btn"
          onClick={() => onAction('clue')}
          disabled={disabled || noEnergy || !cluesAvailable}
          title={!cluesAvailable ? t('resource.clue.none') : t('resource.clue.title')}
        >
          <span className="action-icon">?</span>
          <span className="action-text">{t('resource.clue')}</span>
          <span className="action-cost">1</span>
        </button>

        <button
          className={`btn btn-sm action-btn ${hasBet ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onAction('bet')}
          disabled={disabled || noEnergy || hasBet}
          title={hasBet ? t('resource.bet.done') : t('resource.bet.title')}
        >
          <span className="action-icon">x2</span>
          <span className="action-text">
            {hasBet ? t('resource.betOn') : t('resource.bet')}
          </span>
          {!hasBet && <span className="action-cost">1</span>}
        </button>
      </div>
    </div>
  )
}
