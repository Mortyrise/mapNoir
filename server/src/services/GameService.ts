import { v4 as uuidv4 } from 'uuid'
import { readFile } from 'fs/promises'
import path from 'path'
import { GameRepository } from '../repositories/GameRepository'
import { MapillaryAdapter } from '../adapters/MapillaryAdapter'
import { Location } from '../types'

interface ActiveGame {
  id: string
  actualLocation: Location // NEVER sent to client before guess
  countryCode: string
  imageId: string
  thumbUrl: string
  provider: 'mapillary' | 'google'
  createdAt: number
}

interface PoolEntry {
  imageId: string
  lat: number
  lng: number
  thumbUrl: string
  countryCode: string
}

// In-memory store for active games
const activeGames = new Map<string, ActiveGame>()

const GAME_TTL = 15 * 60 * 1000 // 15 minutes
const POOL_PATH = path.join(__dirname, '..', 'data', 'location-pool.json')

export class GameService {
  private pool: PoolEntry[] | null = null
  private poolLoadAttempted = false

  constructor(
    private readonly repo: GameRepository,
    private readonly mapillary: MapillaryAdapter | null // null if no token
  ) {}

  private cleanupExpiredGames(): void {
    const now = Date.now()
    for (const [id, game] of activeGames) {
      if (now - game.createdAt > GAME_TTL) {
        activeGames.delete(id)
      }
    }
  }

  private async loadPool(): Promise<PoolEntry[]> {
    if (this.pool) return this.pool
    if (this.poolLoadAttempted) return []

    this.poolLoadAttempted = true
    try {
      const raw = await readFile(POOL_PATH, 'utf-8')
      this.pool = JSON.parse(raw)
      console.log(`[game] Loaded location pool: ${this.pool!.length} locations`)
      return this.pool!
    } catch {
      console.log('[game] No location pool found, using live Mapillary search')
      return []
    }
  }

  private get sceneProvider(): 'mapillary' | 'google' {
    const provider = process.env.SCENE_PROVIDER || 'mapillary'
    return provider === 'google' ? 'google' : 'mapillary'
  }

  async createGame(): Promise<{
    gameId: string
    imageId: string
    thumbUrl: string
    provider: 'mapillary' | 'google'
    searchLat?: number
    searchLng?: number
  }> {
    this.cleanupExpiredGames()

    // Google Street View provider: pick a random location and let the client find the nearest panorama
    if (this.sceneProvider === 'google') {
      const location = await this.repo.getRandomLocation()
      const game: ActiveGame = {
        id: uuidv4(),
        actualLocation: location,
        countryCode: '',
        imageId: 'google',
        thumbUrl: '',
        provider: 'google',
        createdAt: Date.now(),
      }
      activeGames.set(game.id, game)
      return {
        gameId: game.id,
        imageId: game.imageId,
        thumbUrl: game.thumbUrl,
        provider: 'google',
        searchLat: location.lat,
        searchLng: location.lng,
      }
    }

    // Mapillary provider
    if (!this.mapillary) {
      const location = await this.repo.getRandomLocation()
      const game: ActiveGame = {
        id: uuidv4(),
        actualLocation: location,
        countryCode: '',
        imageId: 'placeholder',
        thumbUrl: '',
        provider: 'mapillary',
        createdAt: Date.now(),
      }
      activeGames.set(game.id, game)
      return { gameId: game.id, imageId: game.imageId, thumbUrl: game.thumbUrl, provider: 'mapillary' }
    }

    // Strategy 1: Use pre-generated pool (instant, reliable)
    const pool = await this.loadPool()
    if (pool.length > 0) {
      const entry = pool[Math.floor(Math.random() * pool.length)]
      const game: ActiveGame = {
        id: uuidv4(),
        actualLocation: { lat: entry.lat, lng: entry.lng },
        countryCode: entry.countryCode,
        imageId: entry.imageId,
        thumbUrl: entry.thumbUrl,
        provider: 'mapillary',
        createdAt: Date.now(),
      }
      activeGames.set(game.id, game)
      return { gameId: game.id, imageId: game.imageId, thumbUrl: game.thumbUrl, provider: 'mapillary' }
    }

    // Strategy 2: Live search (slow fallback)
    const MAX_ROUNDS = 4
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const locations = await Promise.all([
        this.repo.getRandomLocation(),
        this.repo.getRandomLocation(),
        this.repo.getRandomLocation(),
        this.repo.getRandomLocation(),
        this.repo.getRandomLocation(),
      ])

      const results = await Promise.all(
        locations.map((loc) => this.mapillary!.findImageNear(loc.lat, loc.lng, true))
      )

      const idx = results.findIndex((r) => r !== null)
      if (idx !== -1) {
        const image = results[idx]!
        const game: ActiveGame = {
          id: uuidv4(),
          actualLocation: {
            lat: image.geometry.coordinates[1],
            lng: image.geometry.coordinates[0],
          },
          countryCode: '',
          imageId: String(image.id),
          thumbUrl: image.thumb_2048_url,
          provider: 'mapillary',
          createdAt: Date.now(),
        }
        activeGames.set(game.id, game)
        return { gameId: game.id, imageId: game.imageId, thumbUrl: game.thumbUrl, provider: 'mapillary' }
      }
    }

    throw new Error('Could not find a location with street-level imagery')
  }

  updateActualLocation(gameId: string, location: Location): void {
    const game = activeGames.get(gameId)
    if (game) {
      game.actualLocation = location
    }
  }

  submitGuess(
    gameId: string,
    guess: Location
  ): {
    score: number
    distanceKm: number
    actualLocation: Location
  } {
    this.cleanupExpiredGames()

    const game = activeGames.get(gameId)
    if (!game) {
      throw new Error('Game not found or expired')
    }

    const distanceKm = haversineDistance(game.actualLocation, guess)
    const score = calculateScore(distanceKm)

    // Remove game from active (one guess per game)
    activeGames.delete(gameId)

    return {
      score,
      distanceKm: Math.round(distanceKm * 10) / 10,
      actualLocation: game.actualLocation, // NOW we reveal it
    }
  }
}

// Haversine formula
function haversineDistance(a: Location, b: Location): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const calc =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng
  return R * 2 * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc))
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Score: 5000 max, decreases with distance (factor 2 = 0 points at 2500km)
function calculateScore(distanceKm: number): number {
  return Math.max(0, Math.round(5000 - distanceKm * 2))
}
