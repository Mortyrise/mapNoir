import { useEffect, useMemo, useRef, useState } from 'react'
import { GameMap } from './GameMap'
import { SceneViewer } from './SceneViewer'
import { Icon } from './icons/Icon'
import type { IconName } from './icons/Icon'
import type { Difficulty, GameAction, LatLng } from '../types'

interface HudViewProps {
  // Scene
  provider: 'mapillary' | 'google'
  imageId?: string
  mapillaryToken?: string
  gameId: string
  searchLat?: number
  searchLng?: number
  googleApiKey?: string
  movementUnlocked: boolean

  // Timer
  timeLimit: number
  remainingSeconds: number
  onTimeUp: () => void

  // Energy + round meta
  energy: number
  maxEnergy: number
  caseNumber: number
  roundIndex: number
  totalRounds: number
  difficulty: Difficulty

  // Clue
  initialClue: string
  revealedClues: string[]

  // Actions & map
  hasBet: boolean
  cluesAvailable: number
  onAction: (a: GameAction) => void
  onLocationSelect: (loc: LatLng) => void
  onConfirm: () => void
  selectedLocation: LatLng | null
  loading: boolean
  theme: 'dark' | 'light'
  t: (key: string) => string
}

function formatTimer(total: number): string {
  const s = Math.max(0, Math.ceil(total))
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function formatCase(n: number, roundIndex: number): string {
  const cc = n.toString().padStart(3, '0') + '-B'
  const rr = (roundIndex + 1).toString().padStart(2, '0')
  return `C-${cc} / R-${rr}`
}

function formatCoord(lat: number, lng: number): string {
  const latStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`
  const lngStr = `${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`
  return `${latStr} / ${lngStr}`
}

interface ActionDef {
  action: GameAction
  icon: IconName
  labelKey: string
  costKey: string
  descKey: string
  disabled: boolean
  onClick: () => void
}

export function HudView(props: HudViewProps) {
  const {
    provider,
    imageId,
    mapillaryToken,
    gameId,
    searchLat,
    searchLng,
    googleApiKey,
    movementUnlocked,
    timeLimit,
    remainingSeconds,
    energy,
    maxEnergy,
    caseNumber,
    roundIndex,
    totalRounds,
    initialClue,
    revealedClues,
    hasBet,
    cluesAvailable,
    onAction,
    onLocationSelect,
    onConfirm,
    selectedLocation,
    loading,
    theme,
    t,
  } = props

  const [expanded, setExpanded] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const clockIntervalRef = useRef<number | null>(null)

  // Live clock for the LIVE badge
  useEffect(() => {
    clockIntervalRef.current = window.setInterval(() => setNow(new Date()), 1000)
    return () => {
      if (clockIntervalRef.current != null) window.clearInterval(clockIntervalRef.current)
    }
  }, [])

  const clockStr = useMemo(() => {
    const hh = now.getHours().toString().padStart(2, '0')
    const mm = now.getMinutes().toString().padStart(2, '0')
    const ss = now.getSeconds().toString().padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }, [now])

  const noEnergy = energy <= 0
  const isUrgent = remainingSeconds <= 10
  const progress = Math.max(0, Math.min(1, remainingSeconds / timeLimit))

  const energyBars = Array.from({ length: maxEnergy }, (_, i) => i < energy)

  const activeClue = revealedClues.length > 0 ? revealedClues[revealedClues.length - 1] : initialClue
  const clueIntelIndex = (revealedClues.length + 1).toString().padStart(2, '0')

  const actions: ActionDef[] = [
    {
      action: 'clue',
      icon: 'clue',
      labelKey: 'action.clue.label',
      costKey: 'action.clue.cost',
      descKey: 'action.clue.desc',
      disabled: noEnergy || cluesAvailable <= 0,
      onClick: () => onAction('clue'),
    },
    {
      action: 'move',
      icon: 'move',
      labelKey: 'action.move.label',
      costKey: 'action.move.cost',
      descKey: 'action.move.desc',
      disabled: noEnergy || movementUnlocked,
      onClick: () => onAction('move'),
    },
    {
      action: 'bet',
      icon: 'bet',
      labelKey: 'action.bet.label',
      costKey: 'action.bet.cost',
      descKey: 'action.bet.desc',
      disabled: noEnergy || hasBet,
      onClick: () => onAction('bet'),
    },
  ]

  return (
    <div className="game-shell">
      <div className="gutter-left">
        <span className="gutter-top">MAP NOIR · LAST KNOWN LOCATION</span>
        <span className="gutter-bottom">{formatCase(caseNumber, roundIndex)}</span>
      </div>

      <main className="hud-main">
        <div className="hud-top-rail">
          <div className={`hud-timer ${isUrgent ? 'is-urgent' : ''}`}>
            <Icon name="time" size={14} stroke="currentColor" />
            <span className="hud-timer-value">{formatTimer(remainingSeconds)}</span>
            <span className="hud-timer-label">{t('hud.remaining')}</span>
          </div>

          <div className="hud-progress" aria-hidden="true">
            <div className="hud-progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>

          <div className="hud-energy">
            <Icon name="energy" size={14} stroke="currentColor" />
            <div className="hud-energy-bars">
              {energyBars.map((filled, i) => (
                <span
                  key={i}
                  className={`hud-energy-bar ${filled ? 'is-filled' : 'is-empty'}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="hud-energy-count">
              {energy}/{maxEnergy}
            </span>
            <span className="hud-round-badge" style={{ marginLeft: 18 }}>
              R {roundIndex + 1}/{totalRounds}
            </span>
          </div>
        </div>

        <div className="hud-stage">
          <div className="hud-scene">
            <SceneViewer
              provider={provider}
              imageId={imageId}
              mapillaryToken={mapillaryToken}
              gameId={gameId}
              lat={searchLat}
              lng={searchLng}
              googleApiKey={googleApiKey}
              interactive={movementUnlocked}
              t={t}
            />

            <div className="hud-scene-live" aria-hidden="true">
              <span className="hud-scene-live-dot" />
              LIVE · {clockStr}
            </div>

            <div className="hud-scene-clue">
              <div className="hud-scene-clue-meta">
                {t('clue.intel')} · {clueIntelIndex}
              </div>
              <p className="hud-scene-clue-text">
                <span className="hud-scene-clue-text-open">“</span>
                {activeClue}
              </p>
              {revealedClues.length > 0 && revealedClues.length < cluesAvailable + revealedClues.length && (
                <div className="hud-scene-clue-more">
                  {t('clue.revealed')} {revealedClues.length}
                </div>
              )}
            </div>
          </div>

          <div className="hud-map">
            <div className="hud-map-label">
              <Icon name="pin" size={12} stroke="currentColor" />
              {t('hud.mapPrompt')}
            </div>

            <div className="hud-map-surface">
              <GameMap
                key={`hud-map-${roundIndex}`}
                onLocationSelect={onLocationSelect}
                theme={theme}
              />
              {selectedLocation && (
                <div className="hud-map-coord">
                  {formatCoord(selectedLocation.lat, selectedLocation.lng)}
                </div>
              )}
            </div>

            <button
              type="button"
              className="hud-map-confirm"
              onClick={onConfirm}
              disabled={!selectedLocation || loading}
            >
              <span>{loading ? t('game.submitting') : t('game.confirmLocation')}</span>
              <Icon name="arrow" size={18} stroke="currentColor" />
            </button>
          </div>
        </div>
      </main>

      <aside
        className={`gutter-right ${expanded ? 'is-expanded' : ''}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
      >
        <div className="gutter-right-title">{t('hud.actionsAvailable')}</div>
        {actions.map((a) => (
          <button
            key={a.action}
            type="button"
            className="gutter-right-action"
            onClick={a.onClick}
            disabled={a.disabled}
            title={t(a.labelKey)}
          >
            <div className="gutter-right-action-icon">
              <Icon name={a.icon} size={18} stroke="currentColor" />
            </div>
            <div className="gutter-right-action-content">
              <div className="gutter-right-action-name">{t(a.labelKey)}</div>
              <div className="gutter-right-action-cost">{t(a.costKey)}</div>
              <div className="gutter-right-action-desc">{t(a.descKey)}</div>
            </div>
          </button>
        ))}

        <div className="gutter-right-hint">
          <span>{t('hud.hoverActions')}</span>
        </div>
      </aside>
    </div>
  )
}
