import { useCallback, useRef, useState } from 'react'
import { SplashScreen } from './components/SplashScreen'
import { BriefingScreen } from './components/BriefingScreen'
import { HudView } from './components/HudView'
import { RoundResultScreen } from './components/RoundResultScreen'
import { FinalSummaryScreen } from './components/FinalSummaryScreen'
import { ThemeToggle } from './components/ThemeToggle'
import { MuteToggle } from './components/MuteToggle'
import { LanguageSelector } from './components/LanguageSelector'
import { useTheme } from './hooks/useTheme'
import { useLanguage } from './hooks/useLanguage'
import { useTranslation } from './hooks/useTranslation'
import { useSounds } from './hooks/useSounds'
import { useCountdown } from './hooks/useCountdown'
import { api } from './services/api'
import './components/GameMap.css'
import './components/SceneViewer.css'
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

const TOTAL_ROUNDS = 5

function App() {
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const t = useTranslation(language)
  const { play, muted, toggleMute } = useSounds()

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

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [caseNumber, setCaseNumber] = useState<number>(0)
  const [caseName, setCaseName] = useState<string>('')
  const [currentRound, setCurrentRound] = useState<number>(0)
  const [maxEnergy, setMaxEnergy] = useState<number>(7)
  const [briefResult, setBriefResult] = useState<BriefRoundResult | null>(null)
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null)
  const [caseIntro, setCaseIntro] = useState<string>('')

  const gameIdRef = useRef<string | null>(null)
  const selectedLocationRef = useRef<LatLng | null>(null)
  selectedLocationRef.current = selectedLocation

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
    setResources(prev => ({
      energy: sessionEnergy ?? prev.energy,
      movementUnlocked: false,
      hasBet: false,
      revealedClues: [],
      cluesAvailable: 3,
    }))
  }, [])

  const startSession = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.newSession(difficulty, language)
      setSessionId(data.sessionId)
      setCaseNumber(data.caseNumber)
      setCaseName(data.caseName)
      setCurrentRound(data.currentRound)
      setBriefResult(null)
      setSessionSummary(null)
      setMaxEnergy(data.maxEnergy)

      const introCount = parseInt(t('briefing.caseIntro.count'), 10) || 10
      const introIndex = Math.floor(Math.random() * introCount) + 1
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
    const currentSessionId = sessionId
    if (!currentSessionId) return
    gameIdRef.current = null

    setLoading(true)
    setError(null)
    try {
      const loc = guessLocation || { lat: 0, lng: 0 }
      play('guess-submit')
      const result = await api.submitSessionGuess(currentSessionId, loc.lat, loc.lng)

      play(result.distanceKm < 500 ? 'result-good' : 'result-bad')

      setBriefResult({
        ...result,
        guessLocation: loc,
      })

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

  const handleNextRound = useCallback(async () => {
    if (!sessionId) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.nextRound(sessionId)
      setCurrentRound(data.currentRound)
      setupRound(data.game)

      await api.startTimer(data.game.gameId)
      setGameState('playing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start next round')
    } finally {
      setLoading(false)
    }
  }, [sessionId, setupRound])

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

  // Countdown is active only while playing. Reset via key (currentRound).
  const remainingSeconds = useCountdown({
    timeLimit: gameData?.timeLimit ?? 60,
    onTimeUp: handleTimeUp,
    onUrgentTick: handleTimerTick,
    enabled: gameState === 'playing',
    paused: gameState !== 'playing',
  })

  return (
    <div className="app">
      <div className="app-floating-controls">
        <LanguageSelector language={language} onChange={setLanguage} />
        <MuteToggle muted={muted} onToggle={toggleMute} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <main className="app-main">
        {error && (
          <div className="error-banner" role="alert">
            <p>{error}</p>
            <button className="btn-outline" onClick={() => setError(null)}>
              {t('error.dismiss')}
            </button>
          </div>
        )}

        {gameState === 'idle' && (
          <SplashScreen
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onStart={startSession}
            loading={loading}
            t={t}
          />
        )}

        {gameState === 'briefing' && gameData && (
          <BriefingScreen
            caseNumber={caseNumber}
            caseName={caseName}
            caseIntro={caseIntro}
            clueText={gameData.initialClue}
            roundNumber={currentRound + 1}
            totalRounds={TOTAL_ROUNDS}
            timeLimit={gameData.timeLimit}
            energy={gameData.energy}
            cluesAvailable={resources.cluesAvailable}
            difficulty={gameData.difficulty}
            onStart={startInvestigation}
            t={t}
          />
        )}

        {gameState === 'playing' && gameData && (
          <HudView
            provider={gameData.provider}
            imageId={gameData.imageId}
            mapillaryToken={MAPILLARY_TOKEN}
            gameId={gameData.gameId}
            searchLat={gameData.searchLat}
            searchLng={gameData.searchLng}
            googleApiKey={GOOGLE_API_KEY}
            movementUnlocked={resources.movementUnlocked}
            timeLimit={gameData.timeLimit}
            remainingSeconds={remainingSeconds}
            onTimeUp={handleTimeUp}
            energy={resources.energy}
            maxEnergy={maxEnergy}
            caseNumber={caseNumber}
            roundIndex={currentRound}
            totalRounds={TOTAL_ROUNDS}
            difficulty={gameData.difficulty}
            initialClue={gameData.initialClue}
            revealedClues={resources.revealedClues}
            hasBet={resources.hasBet}
            cluesAvailable={resources.cluesAvailable}
            onAction={handleAction}
            onLocationSelect={handleLocationSelect}
            onConfirm={confirmGuess}
            selectedLocation={selectedLocation}
            loading={loading}
            theme={theme}
            t={t}
          />
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
            caseName={caseName}
            caseNumber={caseNumber}
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
            caseName={sessionSummary.caseName}
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
