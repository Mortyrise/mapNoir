export interface Location {
  lat: number
  lng: number
}

export interface CountryData {
  code: string
  name: string
  languages: string[]
  driving: 'left' | 'right'
  climate: string[]
  currency: string
  region: string
  subregion: string
  capital: string
  mapillaryCoverage: 'high' | 'medium' | 'low'
  boundingBox: {
    north: number
    south: number
    east: number
    west: number
  }
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export type ClueType = 'auditory' | 'contextual' | 'geopolitical' | 'narrative' | 'negative'

export interface CountryClues {
  auditory: string[]
  contextual: string[]
  geopolitical: string[]
  narrative: string[]
  negative: string[]
}

export interface GeneratedClues {
  initial: string
  purchasable: string[]
}

export type GameAction = 'move' | 'clue' | 'bet'

export type Language = 'en' | 'es'

export interface ActiveGameState {
  id: string
  difficulty: Difficulty
  energy: number
  energyUsed: number
  cluesRevealed: number
  hasBet: boolean
  startTime: number
  timeLimit: number
  movementUnlocked: boolean
  initialClue: string
  revealedClues: string[]
  purchasableClues: string[]
}

export interface GameResult {
  id: string
  location: Location
  guess: Location
  distanceKm: number
  score: number
  difficulty: Difficulty
  playedAt: string
}

export interface ApiSuccessResponse<T = unknown> {
  data: T
  meta: {
    timestamp: string
  }
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
  }
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse
