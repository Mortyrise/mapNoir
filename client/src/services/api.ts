import type { Difficulty, GameAction, NewGameResponse, ActionResponse, GuessResponse, SessionResponse, BriefRoundResult, NextRoundResponse, SessionSummary, ReviewLocation, ReviewStats, ReviewVote } from '../types'
import type { Language } from '../i18n/translations'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const error: { error?: { message?: string } } = await response.json()
    throw new Error(error.error?.message || 'Request failed')
  }

  const json: { data: T } = await response.json()
  return json.data
}

export const api = {
  healthCheck: () => request<{ status: string }>('/health'),

  newGame: (difficulty: Difficulty = 'medium', language: Language = 'en') =>
    request<NewGameResponse>('/game/new', {
      method: 'POST',
      body: JSON.stringify({ difficulty, language }),
    }),

  reportPanoLocation: (gameId: string, lat: number, lng: number) =>
    request<{ ok: boolean }>('/game/report-pano', {
      method: 'POST',
      body: JSON.stringify({ gameId, lat, lng }),
    }),

  startTimer: (gameId: string) =>
    request<{ startTime: number; timeLimit: number }>(`/game/${gameId}/start`, {
      method: 'POST',
    }),

  performAction: (gameId: string, action: GameAction) =>
    request<ActionResponse>(`/game/${gameId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  submitGuess: (gameId: string, lat: number, lng: number) =>
    request<GuessResponse>('/game/guess', {
      method: 'POST',
      body: JSON.stringify({ gameId, lat, lng }),
    }),

  newSession: (difficulty: string, language: string) =>
    request<SessionResponse>('/session/new', {
      method: 'POST',
      body: JSON.stringify({ difficulty, language }),
    }),

  submitSessionGuess: (sessionId: string, lat: number, lng: number) =>
    request<BriefRoundResult>('/session/' + sessionId + '/guess', {
      method: 'POST',
      body: JSON.stringify({ lat, lng }),
    }),

  nextRound: (sessionId: string) =>
    request<NextRoundResponse>('/session/' + sessionId + '/next', {
      method: 'POST',
    }),

  getSessionSummary: (sessionId: string) =>
    request<SessionSummary>('/session/' + sessionId + '/summary', {
      method: 'GET',
    }),

  // Review
  getReviewLocations: (country?: string, status?: string) => {
    const params = new URLSearchParams()
    if (country) params.set('country', country)
    if (status) params.set('status', status)
    return request<ReviewLocation[]>(`/review/locations?${params}`)
  },

  submitReview: (imageId: string, vote: ReviewVote, note?: string) =>
    request<{ ok: boolean }>('/review/vote', {
      method: 'POST',
      body: JSON.stringify({ imageId, vote, note }),
    }),

  deleteLocation: (imageId: string) =>
    request<{ ok: boolean }>(`/review/location/${imageId}`, {
      method: 'DELETE',
    }),

  getReviewStats: () => request<ReviewStats>('/review/stats'),

  getReviewCountries: () => request<string[]>('/review/countries'),
}
