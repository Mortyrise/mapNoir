import { useState, useCallback } from 'react'
import { GameMap } from './components/GameMap'
import { SceneViewer } from './components/SceneViewer'
import { ThemeToggle } from './components/ThemeToggle'
import { useTheme } from './hooks/useTheme'
import { api } from './services/api'
import './components/GameMap.css'
import './components/SceneViewer.css'
import './App.css'
import type { LatLng } from './types'

type GameState = 'idle' | 'playing' | 'result'

interface GameData {
  gameId: string
  imageId: string
  provider: 'mapillary' | 'google'
  searchLat?: number
  searchLng?: number
}

interface ResultData {
  score: number
  distanceKm: number
  actualLocation: LatLng
  guessLocation: LatLng
}

const MAPILLARY_TOKEN = import.meta.env.MAPILLARY_TOKEN || ''
const GOOGLE_API_KEY = import.meta.env.GOOGLE_MAPS_API_KEY || ''

function App() {
  const { theme, toggleTheme } = useTheme()
  const [gameState, setGameState] = useState<GameState>('idle')
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [resultData, setResultData] = useState<ResultData | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startGame = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.newGame()
      setGameData({
        gameId: data.gameId,
        imageId: data.imageId,
        provider: data.provider,
        searchLat: data.searchLat,
        searchLng: data.searchLng,
      })
      setSelectedLocation(null)
      setResultData(null)
      setGameState('playing')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start game'
      setError(msg.includes('street-level')
        ? 'Could not find a scene. Try again!'
        : msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmGuess = useCallback(async () => {
    if (!gameData || !selectedLocation) return
    setLoading(true)
    setError(null)
    try {
      const result = await api.submitGuess(
        gameData.gameId,
        selectedLocation.lat,
        selectedLocation.lng
      )
      setResultData({
        ...result,
        guessLocation: selectedLocation,
      })
      setGameState('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit guess')
    } finally {
      setLoading(false)
    }
  }, [gameData, selectedLocation])

  const handleLocationSelect = useCallback((location: LatLng) => {
    setSelectedLocation(location)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-brand">
            <h1 className="app-title">Map Noir</h1>
            <p className="app-subtitle">Last Known Location</p>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button className="btn btn-ghost btn-sm" onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {gameState === 'idle' && (
          <div className="idle-screen">
            <div className="idle-content">
              <h2 className="idle-title">Last Known Location</h2>
              <p className="idle-description">
                A suspect has been spotted. Analyze the scene and mark their last known position on the map.
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={startGame}
                disabled={loading}
              >
                {loading ? 'Opening case...' : 'New Case'}
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && gameData && (
          <div className="game-layout">
            <div className="scene-panel">
              <SceneViewer
                provider={gameData.provider}
                imageId={gameData.imageId}
                mapillaryToken={MAPILLARY_TOKEN}
                gameId={gameData.gameId}
                lat={gameData.searchLat}
                lng={gameData.searchLng}
                googleApiKey={GOOGLE_API_KEY}
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
                  {loading ? 'Submitting...' : 'Confirm Location'}
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'result' && resultData && (
          <div className="result-screen">
            <div className="result-header">
              <h2 className="result-title">Case Report</h2>
              <div className="result-stats">
                <div className="result-stat">
                  <span className="result-stat-label">Score</span>
                  <span className="result-stat-value">{resultData.score.toLocaleString()}</span>
                  <span className="result-stat-max">/ 5,000</span>
                </div>
                <div className="result-stat">
                  <span className="result-stat-label">Distance</span>
                  <span className="result-stat-value">{resultData.distanceKm.toLocaleString()} km</span>
                </div>
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
                {loading ? 'Opening case...' : 'New Case'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
