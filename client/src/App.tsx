import { useState, useCallback, useRef } from 'react'
import { GameMap } from './components/GameMap'
import { SceneViewer } from './components/SceneViewer'
import { ThemeToggle } from './components/ThemeToggle'
import { MuteToggle } from './components/MuteToggle'
import { Timer } from './components/Timer'
import { ResourceBar } from './components/ResourceBar'
import { CluePanel } from './components/CluePanel'
import { LanguageSelector } from './components/LanguageSelector'
import { RoundResultScreen } from './components/RoundResultScreen'
import { FinalSummaryScreen } from './components/FinalSummaryScreen'
import { useTheme } from './hooks/useTheme'
import { useLanguage } from './hooks/useLanguage'
import { useTranslation } from './hooks/useTranslation'
import { useSounds } from './hooks/useSounds'
import { api } from './services/api'
import './components/GameMap.css'
import './components/SceneViewer.css'
import './components/Timer.css'
import './components/ResourceBar.css'
import './components/CluePanel.css'
import './components/RoundResultScreen.css'
import './components/FinalSummaryScreen.css'
import './App.css'
import type { LatLng, Difficulty, GameAction, BriefRoundResult, SessionSummary } from './types'

type GameState = 'idle' | 'briefing' | 'playing' | 'roundResult' | 'finalSummary'

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

const MAPILLARY_TOKEN = import.meta.env.MAPILLARY_TOKEN || ''
const GOOGLE_API_KEY = import.meta.env.GOOGLE_MAPS_API_KEY || ''

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const TOTAL_ROUNDS = 5

function App() {
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const t = useTranslation(language)
  const { play, muted, toggleMute } = useSounds()

  // Core UI state
  const [gameState, setGameState] = useState<GameState>('idle')
  const [gameData, setGameData] = useState<GameData | null>(null)
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

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [caseNumber, setCaseNumber] = useState<number>(0)
  const [currentRound, setCurrentRound] = useState<number>(0)
  const [maxEnergy, setMaxEnergy] = useState<number>(7)
  const [briefResult, setBriefResult] = useState<BriefRoundResult | null>(null)
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null)
  const [caseIntro, setCaseIntro] = useState<string>('')

  const gameIdRef = useRef<string | null>(null)
  const selectedLocationRef = useRef<LatLng | null>(null)
  selectedLocationRef.current = selectedLocation

  // Helper to set up a round's game data from server response
  // Energy is NOT reset — it's shared across the session
  const setupRound = useCallback((game: {
    gameId: string
    imageId: string
    provider: 'mapillary' | 'google'
    searchLat?: number
    searchLng?: number
    initialClue: string
    energy: number
    timeLimit: number
    difficulty: Difficulty
  }, sessionEnergy?: number) => {
    const energy = sessionEnergy ?? game.energy
    const gd: GameData = {
      gameId: game.gameId,
      imageId: game.imageId,
      provider: game.provider,
      searchLat: game.searchLat,
      searchLng: game.searchLng,
      initialClue: game.initialClue,
      energy,
      maxEnergy: energy,
      timeLimit: game.timeLimit,
      difficulty: game.difficulty,
    }
    setGameData(gd)
    gameIdRef.current = game.gameId
    setSelectedLocation(null)
    selectedLocationRef.current = null
    // Reset per-round state but preserve energy from session
    setResources(prev => ({
      energy: sessionEnergy ?? prev.energy,
      movementUnlocked: false,
      hasBet: false,
      revealedClues: [],
      cluesAvailable: 3,
    }))
  }, [])

  // Start a new 5-round session
  const startSession = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.newSession(difficulty, language)
      setSessionId(data.sessionId)
      setCaseNumber(data.caseNumber)
      setCurrentRound(data.currentRound)
      setBriefResult(null)
      setSessionSummary(null)

      setMaxEnergy(data.maxEnergy)

      // Pick a random briefing intro
      const introIndex = Math.floor(Math.random() * 3) + 1
      setCaseIntro(t(`briefing.caseIntro.${introIndex}`))

      setupRound(data.game, data.energy)
      setGameState('briefing')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start session'
      setError(msg.includes('street-level') ? t('error.noScene') : msg)
    } finally {
      setLoading(false)
    }
  }, [difficulty, language, t, setupRound])

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

  // Submit guess for current round
  const submitGuess = useCallback(async (guessLocation: LatLng | null) => {
    const currentSessionId = sessionId
    if (!currentSessionId) return
    gameIdRef.current = null

    setLoading(true)
    setError(null)
    try {
      const loc = guessLocation || { lat: 0, lng: 0 }
      play('guess-submit')
      const result = await api.submitSessionGuess(currentSessionId, loc.lat, loc.lng)

      // Play result sound
      play(result.distanceKm < 500 ? 'result-good' : 'result-bad')

      setBriefResult({
        ...result,
        guessLocation: loc,
      })

      // Update shared energy from server
      if (result.energyRemaining !== undefined) {
        setResources(prev => ({ ...prev, energy: result.energyRemaining }))
      }

      if (result.isLastRound && result.sessionSummary) {
        setSessionSummary(result.sessionSummary)
      }

      setCurrentRound(result.roundIndex)
      setGameState('roundResult')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit guess')
    } finally {
      setLoading(false)
    }
  }, [sessionId, play])

  const confirmGuess = useCallback(async () => {
    await submitGuess(selectedLocation)
  }, [selectedLocation, submitGuess])

  const handleTimeUp = useCallback(() => {
    submitGuess(selectedLocationRef.current)
  }, [submitGuess])

  // Advance to next round
  const handleNextRound = useCallback(async () => {
    if (!sessionId) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.nextRound(sessionId)
      setCurrentRound(data.currentRound)
      // Pass current energy — setupRound will preserve it (shared across session)
      setupRound(data.game)

      // Start timer immediately (no briefing for rounds 2-5)
      await api.startTimer(data.game.gameId)
      setGameState('playing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start next round')
    } finally {
      setLoading(false)
    }
  }, [sessionId, setupRound])

  // Show final summary
  const handleViewSummary = useCallback(() => {
    play('session-complete')
    setGameState('finalSummary')
  }, [play])

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

  const handleTimerTick = useCallback(() => {
    play('timer-tick')
  }, [play])

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
            <MuteToggle muted={muted} onToggle={toggleMute} />
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
                onClick={startSession}
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
              <h2 className="briefing-title">
                {t('session.case')} #{caseNumber}
              </h2>
              <p className="briefing-subtitle">{caseIntro}</p>

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
                <div className="round-indicator">
                  {t('game.round')} {currentRound + 1}/{TOTAL_ROUNDS}
                </div>
                <Timer
                  key={currentRound}
                  timeLimit={gameData.timeLimit}
                  onTimeUp={handleTimeUp}
                  onUrgentTick={handleTimerTick}
                />
                <ResourceBar
                  energy={resources.energy}
                  maxEnergy={maxEnergy}
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
                key={`map-${currentRound}`}
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

        {gameState === 'roundResult' && briefResult && (
          <RoundResultScreen
            roundIndex={briefResult.roundIndex}
            totalRounds={TOTAL_ROUNDS}
            score={briefResult.score}
            distanceKm={briefResult.distanceKm}
            guessLocation={briefResult.guessLocation}
            actualLocation={briefResult.actualLocation}
            isLastRound={briefResult.isLastRound}
            onNextRound={handleNextRound}
            onViewSummary={handleViewSummary}
            theme={theme}
            t={t}
            loading={loading}
          />
        )}

        {gameState === 'finalSummary' && sessionSummary && (
          <FinalSummaryScreen
            caseNumber={sessionSummary.caseNumber}
            difficulty={sessionSummary.difficulty}
            rounds={sessionSummary.rounds}
            totalScore={sessionSummary.totalScore}
            shareableText={sessionSummary.shareableText}
            onPlayAgain={startSession}
            theme={theme}
            t={t}
            loading={loading}
          />
        )}
      </main>
    </div>
  )
}

export default App
