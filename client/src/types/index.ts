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

export interface GameRound {
  sceneData: SceneData
  initialClue: string
  difficulty: Difficulty
}

export interface GuessResult {
  score: number
  distanceKm: number
  actualLocation: LatLng
  guessLocation: LatLng
}
