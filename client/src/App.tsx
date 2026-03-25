import { useState, useCallback, useRef } from 'react'
import { GameMap } from './components/GameMap'
import { SceneViewer } from './components/SceneViewer'
import { ThemeToggle } from './components/ThemeToggle'
import { Timer } from './components/Timer'
import { ResourceBar } from './components/ResourceBar'
import { CluePanel } from './components/CluePanel'
import { LanguageSelector } from './components/LanguageSelector'
import { useTheme } from './hooks/useTheme'
import { useLanguage } from './hooks/useLanguage'
import { useTranslation } from './hooks/useTranslation'
import { api } from './services/api'
import './components/GameMap.css'
import './components/SceneViewer.css'
import './components/Timer.css'
import './components/ResourceBar.css'
import './components/CluePanel.css'
import './App.css'
import type { LatLng, Difficulty, GameAction, ScoreBreakdown } from './types'

type GameState = 'idle' | 'briefing' | 'playing' | 'result'

interface GameData {
  gameId: string
  imageId: string
  provider: 'mapillary' | 'google'
  searchLat?: number
  searchLng?: number
  initialClue: string
  energy: number
  maxEnergy: number
  timeLimit: number
  difficulty: Difficulty
}

interface ResourceState {
  energy: number
  movementUnlocked: boolean
  hasBet: boolean
  revealedClues: string[]
  cluesAvailable: number
}

interface ResultData {
  score: number
  distanceKm: number
  actualLocation: LatLng
  guessLocation: LatLng
  breakdown: ScoreBreakdown
}

const MAPILLARY_TOKEN = import.meta.env.MAPILLARY_TOKEN || ''
const GOOGLE_API_KEY = import.meta.env.GOOGLE_MAPS_API_KEY || ''

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

function App() {
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const t = useTranslation(language)

  const [gameState, setGameState] = useState<GameState>('idle')
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [resultData, setResultData] = useState<ResultData | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resources, setResources] = useState<ResourceState>({
    energy: 3,
    movementUnlocked: false,
    hasBet: false,
    revealedClues: [],
    cluesAvailable: 3,
  })

  const gameIdRef = useRef<string | null>(null)
  const selectedLocationRef = useRef<LatLng | null>(null)
  selectedLocationRef.current = selectedLocation

  const startGame = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.newGame(difficulty, language)
      const gd: GameData = {
        gameId: data.gameId,
        imageId: data.imageId,
        provider: data.provider,
        searchLat: data.searchLat,
        searchLng: data.searchLng,
        initialClue: data.initialClue,
        energy: data.energy,
        maxEnergy: data.energy,
        timeLimit: data.timeLimit,
        difficulty: data.difficulty,
      }
      setGameData(gd)
      gameIdRef.current = data.gameId
      setSelectedLocation(null)
      selectedLocationRef.current = null
      setResultData(null)
      setResources({
        energy: data.energy,
        movementUnlocked: false,
        hasBet: false,
        revealedClues: [],
        cluesAvailable: 3,
      })
      // Go to briefing instead of playing — timer not started yet
      setGameState('briefing')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start game'
      setError(msg.includes('street-level') ? t('error.noScene') : msg)
    } finally {
      setLoading(false)
    }
  }, [difficulty, language, t])

  // Player finished reading the briefing, start the timer and show the scene
  const startInvestigation = useCallback(async () => {
    if (!gameData) return
    try {
      await api.startTimer(gameData.gameId)
      setGameState('playing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start timer')
    }
  }, [gameData])

  const submitGuess = useCallback(async (guessLocation: LatLng | null) => {
    const currentGameId = gameIdRef.current
    if (!currentGameId) return
    gameIdRef.current = null

    setLoading(true)
    setError(null)
    try {
      const loc = guessLocation || { lat: 0, lng: 0 }
      const result = await api.submitGuess(currentGameId, loc.lat, loc.lng)
      setResultData({
        score: result.score,
        distanceKm: result.distanceKm,
        actualLocation: result.actualLocation,
        guessLocation: loc,
        breakdown: result.breakdown,
      })
      setGameState('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit guess')
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmGuess = useCallback(async () => {
    await submitGuess(selectedLocation)
  }, [selectedLocation, submitGuess])

  const handleTimeUp = useCallback(() => {
    submitGuess(selectedLocationRef.current)
  }, [submitGuess])

  const handleAction = useCallback(async (action: GameAction) => {
    if (!gameData) return
    setError(null)
    try {
      const result = await api.performAction(gameData.gameId, action)
      setResources(prev => ({
        ...prev,
        energy: result.energy,
        movementUnlocked: result.movementUnlocked ?? prev.movementUnlocked,
        hasBet: result.hasBet ?? prev.hasBet,
        revealedClues: result.clue
          ? [...prev.revealedClues, result.clue]
          : prev.revealedClues,
        cluesAvailable: result.clue
          ? prev.cluesAvailable - 1
          : prev.cluesAvailable,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    }
  }, [gameData])

  const handleLocationSelect = useCallback((location: LatLng) => {
    setSelectedLocation(location)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-brand">
            <h1 className="app-title">{t('app.title')}</h1>
            <p className="app-subtitle">{t('app.subtitle')}</p>
          </div>
          <div className="app-header-controls">
            <LanguageSelector language={language} onChange={setLanguage} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button className="btn btn-ghost btn-sm" onClick={() => setError(null)}>
              {t('error.dismiss')}
            </button>
          </div>
        )}

        {gameState === 'idle' && (
          <div className="idle-screen">
            <div className="idle-content">
              <h2 className="idle-title">{t('idle.title')}</h2>
              <p className="idle-description">{t('idle.description')}</p>

              <div className="difficulty-selector">
                <span className="difficulty-label">{t('idle.difficulty')}</span>
                <div className="difficulty-options">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      className={`btn btn-sm ${d === difficulty ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setDifficulty(d)}
                    >
                      <span>{t(`difficulty.${d}`)}</span>
                      <span className="difficulty-detail">{t(`difficulty.${d}.detail`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={startGame}
                disabled={loading}
              >
                {loading ? t('idle.loading') : t('idle.newCase')}
              </button>
            </div>
          </div>
        )}

        {gameState === 'briefing' && gameData && (
          <div className="briefing-screen">
            <div className="briefing-content">
              <h2 className="briefing-title">{t('briefing.title')}</h2>
              <p className="briefing-subtitle">{t('briefing.subtitle')}</p>

              <div className="briefing-clue">
                <span className="clue-tag">{t('clue.intel')}</span>
                <p className="briefing-clue-text">{gameData.initialClue}</p>
              </div>

              <div className="briefing-meta">
                <div className="briefing-meta-item">
                  <span className="briefing-meta-label">{t('briefing.difficulty')}</span>
                  <span className="briefing-meta-value">{t(`difficulty.${gameData.difficulty}`)}</span>
                </div>
                <div className="briefing-meta-item">
                  <span className="briefing-meta-label">{t('briefing.timeLimit')}</span>
                  <span className="briefing-meta-value">{gameData.timeLimit}{t('briefing.seconds')}</span>
                </div>
                <div className="briefing-meta-item">
                  <span className="briefing-meta-label">{t('briefing.energy')}</span>
                  <span className="briefing-meta-value">{gameData.energy}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg briefing-start-btn"
                onClick={startInvestigation}
              >
                {t('briefing.start')}
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && gameData && (
          <div className="game-layout">
            <div className="scene-panel">
              <div className="scene-hud">
                <Timer
                  timeLimit={gameData.timeLimit}
                  onTimeUp={handleTimeUp}
                />
                <ResourceBar
                  energy={resources.energy}
                  maxEnergy={gameData.maxEnergy}
                  movementUnlocked={resources.movementUnlocked}
                  hasBet={resources.hasBet}
                  cluesAvailable={resources.cluesAvailable > 0}
                  onAction={handleAction}
                  t={t}
                />
              </div>
              <SceneViewer
                provider={gameData.provider}
                imageId={gameData.imageId}
                mapillaryToken={MAPILLARY_TOKEN}
                gameId={gameData.gameId}
                lat={gameData.searchLat}
                lng={gameData.searchLng}
                googleApiKey={GOOGLE_API_KEY}
                interactive={resources.movementUnlocked}
                t={t}
              />
              <CluePanel
                initialClue={gameData.initialClue}
                revealedClues={resources.revealedClues}
                t={t}
              />
            </div>
            <div className="map-panel">
              <GameMap
                onLocationSelect={handleLocationSelect}
                theme={theme}
              />
              <div className="map-actions">
                <button
                  className="btn btn-primary"
                  onClick={confirmGuess}
                  disabled={!selectedLocation || loading}
                >
                  {loading ? t('game.submitting') : t('game.confirmLocation')}
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'result' && resultData && (
          <div className="result-screen">
            <div className="result-header">
              <h2 className="result-title">{t('result.title')}</h2>
              <div className="result-stats">
                <div className="result-stat">
                  <span className="result-stat-label">{t('result.score')}</span>
                  <span className="result-stat-value">{resultData.score.toLocaleString()}</span>
                </div>
                <div className="result-stat">
                  <span className="result-stat-label">{t('result.distance')}</span>
                  <span className="result-stat-value">{resultData.distanceKm.toLocaleString()} km</span>
                </div>
              </div>

              <div className="result-breakdown">
                <div className="breakdown-row">
                  <span className="breakdown-label">{t('result.baseScore')}</span>
                  <span className="breakdown-value">
                    {resultData.breakdown.baseScore.toLocaleString()}
                    <span className="breakdown-max"> / 5,000</span>
                  </span>
                </div>
                {resultData.breakdown.cluePenalty > 0 && (
                  <div className="breakdown-row breakdown-penalty">
                    <span className="breakdown-label">{t('result.cluePenalty')} (-{resultData.breakdown.cluePenalty}%)</span>
                    <span className="breakdown-value">-{(resultData.breakdown.baseScore - resultData.breakdown.afterClues).toLocaleString()}</span>
                  </div>
                )}
                {resultData.breakdown.timeBonus > 0 && (
                  <div className="breakdown-row breakdown-bonus">
                    <span className="breakdown-label">{t('result.timeBonus')} (+{resultData.breakdown.timeBonus}%)</span>
                    <span className="breakdown-value">+{(resultData.breakdown.afterTime - resultData.breakdown.afterClues).toLocaleString()}</span>
                  </div>
                )}
                {resultData.breakdown.betMultiplier > 1 && (
                  <div className="breakdown-row breakdown-bet">
                    <span className="breakdown-label">{t('result.betMultiplier')} (x{resultData.breakdown.betMultiplier})</span>
                    <span className="breakdown-value">+{(resultData.score - resultData.breakdown.afterTime).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="result-map">
              <GameMap
                theme={theme}
                disabled
                resultMarkers={{
                  guess: resultData.guessLocation,
                  actual: resultData.actualLocation,
                }}
              />
            </div>
            <div className="result-actions">
              <button className="btn btn-primary btn-lg" onClick={startGame} disabled={loading}>
                {loading ? t('idle.loading') : t('result.newCase')}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
