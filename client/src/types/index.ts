import type { SceneData } from '../adapters/ImageProviderAdapter'

export interface LatLng {
  lat: number
  lng: number
}

export interface MapConfig {
  center: LatLng
  zoom: number
  minZoom?: number
  maxZoom?: number
}

export interface MarkerOptions {
  color?: string
  draggable?: boolean
  label?: string
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export type GameAction = 'move' | 'clue' | 'bet'

export interface GameRound {
  sceneData: SceneData
  initialClue: string
  difficulty: Difficulty
}

export interface NewGameResponse {
  gameId: string
  imageId: string
  thumbUrl: string
  provider: 'mapillary' | 'google'
  searchLat?: number
  searchLng?: number
  initialClue: string
  energy: number
  timeLimit: number
  difficulty: Difficulty
}

export interface ActionResponse {
  success: boolean
  energy: number
  clue?: string
  movementUnlocked?: boolean
  hasBet?: boolean
}

export interface ScoreBreakdown {
  baseScore: number
  cluePenalty: number
  afterClues: number
  timeBonus: number
  afterTime: number
  betMultiplier: number
}

export interface GuessResponse {
  score: number
  distanceKm: number
  actualLocation: LatLng
  breakdown: ScoreBreakdown
}

export interface GuessResult {
  score: number
  distanceKm: number
  actualLocation: LatLng
  guessLocation: LatLng
  breakdown: ScoreBreakdown
}

export interface SessionResponse {
  sessionId: string
  caseNumber: number
  difficulty: Difficulty
  totalRounds: number
  currentRound: number
  energy: number
  maxEnergy: number
  game: {
    gameId: string
    imageId: string
    provider: 'mapillary' | 'google'
    searchLat?: number
    searchLng?: number
    initialClue: string
    energy: number
    timeLimit: number
    difficulty: Difficulty
  }
}

export interface BriefRoundResult {
  roundIndex: number
  score: number
  distanceKm: number
  actualLocation: LatLng
  guessLocation: LatLng
  breakdown: ScoreBreakdown
  isLastRound: boolean
  energyRemaining: number
  sessionSummary?: SessionSummary
}

export interface SessionSummary {
  caseNumber: number
  difficulty: Difficulty
  rounds: RoundSummaryEntry[]
  totalScore: number
  shareableText: string
}

export interface RoundSummaryEntry {
  roundIndex: number
  score: number
  distanceKm: number
  actualLocation: LatLng
  guessLocation: LatLng
}

export interface NextRoundResponse {
  currentRound: number
  game: {
    gameId: string
    imageId: string
    provider: 'mapillary' | 'google'
    searchLat?: number
    searchLng?: number
    initialClue: string
    energy: number
    timeLimit: number
    difficulty: Difficulty
  }
}
