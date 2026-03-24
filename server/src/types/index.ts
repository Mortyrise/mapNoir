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
  boundingBox: {
    north: number
    south: number
    east: number
    west: number
  }
}

export type Difficulty = 'easy' | 'medium' | 'hard'

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
