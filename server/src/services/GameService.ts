import { v4 as uuidv4 } from 'uuid'
import { GameRepository } from '../repositories/GameRepository'
import { MapillaryAdapter } from '../adapters/MapillaryAdapter'
import { Location, Difficulty } from '../types'

interface ActiveGame {
  id: string
  actualLocation: Location // NEVER sent to client before guess
  countryCode: string
  imageId: string
  thumbUrl: string
  difficulty: Difficulty
  createdAt: number
}

// In-memory store for active games
const activeGames = new Map<string, ActiveGame>()

export class GameService {
  constructor(
    private readonly repo: GameRepository,
    private readonly mapillary: MapillaryAdapter | null // null if no token
  ) {}

  async createGame(
    difficulty: Difficulty = 'medium'
  ): Promise<{
    gameId: string
    imageId: string
    thumbUrl: string
  }> {
    // Try up to 10 times to find a location with Mapillary coverage
    const MAX_ATTEMPTS = 10

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const location = await this.repo.getRandomLocation()

      if (!this.mapillary) {
        // No Mapillary token — create game with placeholder
        const game: ActiveGame = {
          id: uuidv4(),
          actualLocation: location,
          countryCode: '',
          imageId: 'placeholder',
          thumbUrl: '',
          difficulty,
          createdAt: Date.now(),
        }
        activeGames.set(game.id, game)
        return { gameId: game.id, imageId: game.imageId, thumbUrl: game.thumbUrl }
      }

      const image = await this.mapillary.findImageNear(location.lat, location.lng)
      if (image) {
        // Use the actual image location (more accurate than our random point)
        const actualLocation: Location = {
          lat: image.geometry.coordinates[1],
          lng: image.geometry.coordinates[0],
        }

        const game: ActiveGame = {
          id: uuidv4(),
          actualLocation,
          countryCode: '',
          imageId: String(image.id),
          thumbUrl: image.thumb_2048_url,
          difficulty,
          createdAt: Date.now(),
        }
        activeGames.set(game.id, game)
        return { gameId: game.id, imageId: game.imageId, thumbUrl: game.thumbUrl }
      }
    }

    throw new Error('Could not find a location with street-level imagery')
  }

  submitGuess(
    gameId: string,
    guess: Location
  ): {
    score: number
    distanceKm: number
    actualLocation: Location
  } {
    const game = activeGames.get(gameId)
    if (!game) {
      throw new Error('Game not found or expired')
    }

    const distanceKm = haversineDistance(game.actualLocation, guess)
    const score = calculateScore(distanceKm, game.difficulty)

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

// Score: 5000 max, decreases with distance
function calculateScore(distanceKm: number, difficulty: Difficulty): number {
  const factor = { easy: 1, medium: 2, hard: 5 }[difficulty]
  return Math.max(0, Math.round(5000 - distanceKm * factor))
}
