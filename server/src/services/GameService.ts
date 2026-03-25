import { v4 as uuidv4 } from 'uuid'
import { readFile } from 'fs/promises'
import path from 'path'
import { GameRepository } from '../repositories/GameRepository'
import { MapillaryAdapter } from '../adapters/MapillaryAdapter'
import { ClueGenerator } from './ClueGenerator'
import type { Location, Difficulty, GameAction, Language } from '../types'

interface ActiveGame {
  id: string
  actualLocation: Location // NEVER sent to client before guess
  countryCode: string
  imageId: string
  thumbUrl: string
  provider: 'mapillary' | 'google'
  createdAt: number
  // Phase 2: resources
  difficulty: Difficulty
  energy: number
  energyUsed: number
  cluesRevealed: number
  hasBet: boolean
  startTime: number
  timeLimit: number // seconds
  movementUnlocked: boolean
  initialClue: string
  revealedClues: string[]
  purchasableClues: string[] // clues available for purchase (not yet revealed)
}

export interface PoolEntry {
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

// Difficulty settings
const ENERGY_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 4,
  medium: 3,
  hard: 2,
}

const TIME_LIMIT_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 60,
  medium: 45,
  hard: 30,
}

export class GameService {
  private pool: PoolEntry[] | null = null
  private poolLoadAttempted = false
  private clueGenerator = new ClueGenerator()

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

  private buildGame(
    location: Location,
    countryCode: string,
    imageId: string,
    thumbUrl: string,
    provider: 'mapillary' | 'google',
    difficulty: Difficulty,
    language: Language
  ): ActiveGame {
    const energy = ENERGY_BY_DIFFICULTY[difficulty]
    const timeLimit = TIME_LIMIT_BY_DIFFICULTY[difficulty]
    const clues = this.clueGenerator.generateCluesForLocation(countryCode, difficulty, language)
    return {
      id: uuidv4(),
      actualLocation: location,
      countryCode,
      imageId,
      thumbUrl,
      provider,
      createdAt: Date.now(),
      difficulty,
      energy,
      energyUsed: 0,
      cluesRevealed: 0,
      hasBet: false,
      startTime: 0,
      timeLimit,
      movementUnlocked: false,
      initialClue: clues.initial,
      revealedClues: [],
      purchasableClues: clues.purchasable,
    }
  }

  /**
   * Picks N unique random locations from the pre-generated pool.
   * Throws if the pool doesn't have enough locations.
   */
  async getUniquePoolLocations(count: number): Promise<PoolEntry[]> {
    const pool = await this.loadPool()
    if (pool.length < count) {
      throw new Error(`Not enough locations in pool (need ${count}, have ${pool.length})`)
    }

    const indices = new Set<number>()
    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * pool.length))
    }

    return Array.from(indices).map((i) => pool[i])
  }

  /**
   * Creates a game for a specific pool entry (used by SessionService).
   * Returns the same shape as createGame.
   */
  createRoundGame(
    entry: PoolEntry,
    difficulty: Difficulty,
    language: Language,
    energyOverride?: number
  ): {
    gameId: string
    imageId: string
    thumbUrl: string
    provider: 'mapillary' | 'google'
    initialClue: string
    energy: number
    timeLimit: number
    difficulty: Difficulty
  } {
    this.cleanupExpiredGames()

    const game = this.buildGame(
      { lat: entry.lat, lng: entry.lng },
      entry.countryCode,
      entry.imageId,
      entry.thumbUrl,
      'mapillary',
      difficulty,
      language
    )

    // Override energy if session provides shared energy
    if (energyOverride !== undefined) {
      game.energy = energyOverride
    }

    activeGames.set(game.id, game)

    return {
      gameId: game.id,
      imageId: game.imageId,
      thumbUrl: game.thumbUrl,
      provider: 'mapillary',
      initialClue: game.initialClue,
      energy: game.energy,
      timeLimit: game.timeLimit,
      difficulty: game.difficulty,
    }
  }

  async createGame(difficulty: Difficulty = 'medium', language: Language = 'en'): Promise<{
    gameId: string
    imageId: string
    thumbUrl: string
    provider: 'mapillary' | 'google'
    searchLat?: number
    searchLng?: number
    // Phase 2 additions
    initialClue: string
    energy: number
    timeLimit: number
    difficulty: Difficulty
  }> {
    this.cleanupExpiredGames()

    // Google Street View provider
    if (this.sceneProvider === 'google') {
      const location = await this.repo.getRandomLocation()
      const game = this.buildGame(location, '', 'google', '', 'google', difficulty, language)
      activeGames.set(game.id, game)
      return {
        gameId: game.id,
        imageId: game.imageId,
        thumbUrl: game.thumbUrl,
        provider: 'google',
        searchLat: location.lat,
        searchLng: location.lng,
        initialClue: game.initialClue,
        energy: game.energy,
        timeLimit: game.timeLimit,
        difficulty: game.difficulty,
      }
    }

    // Mapillary provider
    if (!this.mapillary) {
      const location = await this.repo.getRandomLocation()
      const game = this.buildGame(location, '', 'placeholder', '', 'mapillary', difficulty, language)
      activeGames.set(game.id, game)
      return {
        gameId: game.id,
        imageId: game.imageId,
        thumbUrl: game.thumbUrl,
        provider: 'mapillary',
        initialClue: game.initialClue,
        energy: game.energy,
        timeLimit: game.timeLimit,
        difficulty: game.difficulty,
      }
    }

    // Strategy 1: Use pre-generated pool (instant, reliable)
    const pool = await this.loadPool()
    if (pool.length > 0) {
      const entry = pool[Math.floor(Math.random() * pool.length)]
      const game = this.buildGame(
        { lat: entry.lat, lng: entry.lng },
        entry.countryCode,
        entry.imageId,
        entry.thumbUrl,
        'mapillary',
        difficulty,
        language
      )
      activeGames.set(game.id, game)
      return {
        gameId: game.id,
        imageId: game.imageId,
        thumbUrl: game.thumbUrl,
        provider: 'mapillary',
        initialClue: game.initialClue,
        energy: game.energy,
        timeLimit: game.timeLimit,
        difficulty: game.difficulty,
      }
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
        const game = this.buildGame(
          { lat: image.geometry.coordinates[1], lng: image.geometry.coordinates[0] },
          '',
          String(image.id),
          image.thumb_2048_url,
          'mapillary',
          difficulty,
          language
        )
        activeGames.set(game.id, game)
        return {
          gameId: game.id,
          imageId: game.imageId,
          thumbUrl: game.thumbUrl,
          provider: 'mapillary',
          initialClue: game.initialClue,
          energy: game.energy,
          timeLimit: game.timeLimit,
          difficulty: game.difficulty,
        }
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

  startTimer(gameId: string): { startTime: number; timeLimit: number } {
    const game = activeGames.get(gameId)
    if (!game) {
      throw new Error('Game not found or expired')
    }
    if (game.startTime !== 0) {
      // Already started — return current state
      return { startTime: game.startTime, timeLimit: game.timeLimit }
    }
    game.startTime = Date.now()
    return { startTime: game.startTime, timeLimit: game.timeLimit }
  }

  performAction(
    gameId: string,
    action: GameAction
  ): {
    success: boolean
    energy: number
    clue?: string
    movementUnlocked?: boolean
    hasBet?: boolean
  } {
    const game = activeGames.get(gameId)
    if (!game) {
      throw new Error('Game not found or expired')
    }

    // Auto-start timer if not started (safety net)
    if (game.startTime === 0) {
      game.startTime = Date.now()
    }

    // Check timer
    const elapsed = (Date.now() - game.startTime) / 1000
    if (elapsed > game.timeLimit) {
      throw new Error('Time has expired')
    }

    // Check energy
    if (game.energy <= 0) {
      throw new Error('Not enough energy')
    }

    switch (action) {
      case 'move': {
        if (game.movementUnlocked) {
          throw new Error('Movement already unlocked')
        }
        game.energy -= 1
        game.energyUsed += 1
        game.movementUnlocked = true
        return {
          success: true,
          energy: game.energy,
          movementUnlocked: true,
        }
      }
      case 'clue': {
        if (game.purchasableClues.length === 0) {
          throw new Error('No more clues available')
        }
        game.energy -= 1
        game.energyUsed += 1
        game.cluesRevealed += 1
        const clue = game.purchasableClues.shift()!
        game.revealedClues.push(clue)
        return {
          success: true,
          energy: game.energy,
          clue,
        }
      }
      case 'bet': {
        if (game.hasBet) {
          throw new Error('Already placed a bet')
        }
        game.energy -= 1
        game.energyUsed += 1
        game.hasBet = true
        return {
          success: true,
          energy: game.energy,
          hasBet: true,
        }
      }
      default:
        throw new Error('Invalid action')
    }
  }

  getGameState(gameId: string): {
    energy: number
    timeRemaining: number
    cluesRevealed: number
    hasBet: boolean
    movementUnlocked: boolean
  } | null {
    const game = activeGames.get(gameId)
    if (!game) return null

    const elapsed = (Date.now() - game.startTime) / 1000
    const timeRemaining = Math.max(0, game.timeLimit - elapsed)

    return {
      energy: game.energy,
      timeRemaining,
      cluesRevealed: game.cluesRevealed,
      hasBet: game.hasBet,
      movementUnlocked: game.movementUnlocked,
    }
  }

  submitGuess(
    gameId: string,
    guess: Location
  ): {
    score: number
    distanceKm: number
    actualLocation: Location
    energyRemaining: number
    breakdown: {
      baseScore: number
      cluePenalty: number
      afterClues: number
      timeBonus: number
      afterTime: number
      betMultiplier: number
    }
  } {
    this.cleanupExpiredGames()

    const game = activeGames.get(gameId)
    if (!game) {
      throw new Error('Game not found or expired')
    }

    // Auto-start timer if not started (safety net)
    if (game.startTime === 0) {
      game.startTime = Date.now()
    }

    const distanceKm = haversineDistance(game.actualLocation, guess)
    const elapsed = (Date.now() - game.startTime) / 1000
    const timeRemaining = Math.max(0, game.timeLimit - elapsed)
    const timedOut = elapsed > game.timeLimit

    const score = calculateScore(
      distanceKm,
      game.cluesRevealed,
      timeRemaining,
      game.timeLimit,
      game.hasBet,
      timedOut
    )

    const energyRemaining = game.energy

    // Remove game from active (one guess per game)
    activeGames.delete(gameId)

    return {
      score: score.final,
      distanceKm: Math.round(distanceKm * 10) / 10,
      actualLocation: game.actualLocation, // NOW we reveal it
      energyRemaining,
      breakdown: {
        baseScore: score.base,
        cluePenalty: score.cluePenalty,
        afterClues: score.afterClues,
        timeBonus: score.timeBonus,
        afterTime: score.afterTime,
        betMultiplier: score.betMultiplier,
      },
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

// Phase 2 scoring formula
// base_score = max(0, 5000 - distancia_km * factor)
// clue_penalty = cluesRevealed * 0.15
// time_bonus = timeRemaining / timeLimit (0-1)
// bet_multiplier = hasBet ? 2 : 1
// final_score = base_score * (1 - clue_penalty) * (1 + time_bonus * 0.2) * bet_multiplier
function calculateScore(
  distanceKm: number,
  cluesRevealed: number,
  timeRemaining: number,
  timeLimit: number,
  hasBet: boolean,
  timedOut: boolean
): { final: number; base: number; cluePenalty: number; afterClues: number; timeBonus: number; afterTime: number; betMultiplier: number } {
  const base = Math.max(0, 5000 - distanceKm * 2)
  const cluePenalty = cluesRevealed * 0.15
  const timeBonus = timedOut ? 0 : timeRemaining / timeLimit
  const betMultiplier = hasBet ? 2 : 1

  const afterClues = base * (1 - cluePenalty)
  const afterTime = afterClues * (1 + timeBonus * 0.2)
  const final = Math.round(afterTime * betMultiplier)

  return {
    final: Math.max(0, final),
    base: Math.round(base),
    cluePenalty: Math.round(cluePenalty * 100),
    afterClues: Math.round(afterClues),
    timeBonus: Math.round(timeBonus * 0.2 * 100),
    afterTime: Math.round(afterTime),
    betMultiplier,
  }
}
