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
  cities: { name: string; lat: number; lng: number }[]
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export type ReviewVote = 'approve' | 'reject'

export interface LocationReview {
  imageId: string
  countryCode: string
  vote: ReviewVote
  note?: string
  reviewedAt: string
}

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

export interface SessionRoundResult {
  roundIndex: number
  score: number
  distanceKm: number
  actualLocation: Location
  guessLocation: Location
  breakdown: {
    baseScore: number
    cluePenalty: number
    afterClues: number
    timeBonus: number
    afterTime: number
    betMultiplier: number
  }
}
