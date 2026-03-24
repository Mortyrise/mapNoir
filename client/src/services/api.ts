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

  newGame: () =>
    request<{
      gameId: string
      imageId: string
      thumbUrl: string
      provider: 'mapillary' | 'google'
      searchLat?: number
      searchLng?: number
    }>('/game/new', {
      method: 'POST',
    }),

  reportPanoLocation: (gameId: string, lat: number, lng: number) =>
    request<{ ok: boolean }>('/game/report-pano', {
      method: 'POST',
      body: JSON.stringify({ gameId, lat, lng }),
    }),

  submitGuess: (gameId: string, lat: number, lng: number) =>
    request<{ score: number; distanceKm: number; actualLocation: { lat: number; lng: number } }>(
      '/game/guess',
      {
        method: 'POST',
        body: JSON.stringify({ gameId, lat, lng }),
      }
    ),
}
