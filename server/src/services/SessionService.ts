import { v4 as uuidv4 } from 'uuid'
import { GameService, PoolEntry } from './GameService'
import type { Difficulty, Language, Location, SessionRoundResult } from '../types'

const ROUNDS_PER_SESSION = 5
const SESSION_TTL = 30 * 60 * 1000 // 30 minutes
const MAX_SCORE_PER_ROUND = 5000

// Shared energy across all 5 rounds (creates strategic resource management)
const SESSION_ENERGY: Record<Difficulty, number> = {
  easy: 10,
  medium: 7,
  hard: 4,
}

// Noir/spy case names — no geographic references (would be a clue)
const CASE_NAMES: Record<string, string[]> = {
  en: [
    'The Fading Signal', 'Operation Blind Meridian', 'The Burned Ledger',
    'The Silent Frequency', 'Operation Paper Ghost', 'The Fractured Cipher',
    'The Cold Informant', 'Operation Dead Drop', 'The Missing Reel',
    'The Phantom Protocol', 'Operation Smoke Mirror', 'The Severed Line',
    'The Double Exposure', 'Operation Iron Compass', 'The Last Negative',
    'The Erased Tapes', 'Operation Hollow Signal', 'The Broken Relay',
    'The Invisible Border', 'Operation Glass Key', 'The Sunken Archive',
    'The Coded Postcard', 'Operation Silent Witness', 'The Lost Frequency',
    'The Pale Courier', 'Operation Dark Lens', 'The Vanishing Point',
    'The Intercepted Letter', 'Operation Dust Archive', 'The Static Line',
    'The Forgotten Dossier', 'Operation Ash Protocol', 'The Muted Transmission',
    'The Redacted File', 'Operation Blind Corner', 'The Shadow Dispatch',
    'The Sealed Envelope', 'Operation Cold Needle', 'The Orphan Signal',
    'The Terminal Briefing',
  ],
  es: [
    'La Señal Perdida', 'Operación Meridiano Ciego', 'El Libro Quemado',
    'La Frecuencia Silenciosa', 'Operación Fantasma de Papel', 'El Cifrado Roto',
    'El Informante Frío', 'Operación Punto Muerto', 'El Carrete Perdido',
    'El Protocolo Fantasma', 'Operación Espejo de Humo', 'La Línea Cortada',
    'La Doble Exposición', 'Operación Brújula de Hierro', 'El Último Negativo',
    'Las Cintas Borradas', 'Operación Señal Hueca', 'El Relé Roto',
    'La Frontera Invisible', 'Operación Llave de Cristal', 'El Archivo Hundido',
    'La Postal Cifrada', 'Operación Testigo Silencioso', 'La Frecuencia Perdida',
    'El Correo Pálido', 'Operación Lente Oscura', 'El Punto de Fuga',
    'La Carta Interceptada', 'Operación Archivo de Ceniza', 'La Línea Estática',
    'El Dosier Olvidado', 'Operación Protocolo Gris', 'La Transmisión Muda',
    'El Expediente Censurado', 'Operación Esquina Ciega', 'El Despacho Sombrío',
    'El Sobre Sellado', 'Operación Aguja Fría', 'La Señal Huérfana',
    'El Informe Final',
  ],
}

interface ActiveSession {
  id: string
  caseNumber: number
  caseName: string
  difficulty: Difficulty
  language: string
  locations: PoolEntry[] // 5 pre-selected
  currentRound: number // 0-4
  currentGameId: string | null
  roundResults: SessionRoundResult[]
  totalScore: number
  energy: number       // shared energy remaining
  maxEnergy: number    // total energy for this session
  createdAt: number
  lastActivity: number
  completed: boolean
}

// In-memory store for active sessions
const activeSessions = new Map<string, ActiveSession>()

// Monotonically increasing case number
let nextCaseNumber = 1

export class SessionService {
  constructor(private readonly gameService: GameService) {}

  private cleanupExpiredSessions(): void {
    const now = Date.now()
    for (const [id, session] of activeSessions) {
      if (now - session.lastActivity > SESSION_TTL) {
        activeSessions.delete(id)
      }
    }
  }

  private touchSession(session: ActiveSession): void {
    session.lastActivity = Date.now()
  }

  private scoreToSquares(score: number): string {
    const ratio = Math.max(0, Math.min(1, score / MAX_SCORE_PER_ROUND))
    const filled = Math.round(ratio * 5)
    return '\u25a0'.repeat(filled) + '\u25a1'.repeat(5 - filled)
  }

  private formatDifficulty(difficulty: Difficulty): string {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
  }

  private generateShareableText(session: ActiveSession): string {
    const squares = session.roundResults.map((r) => this.scoreToSquares(r.score)).join(' ')
    const total = session.totalScore.toLocaleString('en-US')

    return [
      `Map Noir \ud83d\udd0d Case #${session.caseNumber}`,
      `${session.caseName} \u2014 ${this.formatDifficulty(session.difficulty)}`,
      squares,
      `${total} pts`,
      'mapnoir.com',
    ].join('\n')
  }

  private pickCaseName(language: string): string {
    const names = CASE_NAMES[language] || CASE_NAMES['en']
    return names[Math.floor(Math.random() * names.length)]
  }

  async createSession(
    difficulty: Difficulty = 'medium',
    language: Language = 'en'
  ): Promise<{
    sessionId: string
    caseNumber: number
    caseName: string
    difficulty: Difficulty
    totalRounds: number
    currentRound: number
    energy: number
    maxEnergy: number
    game: {
      gameId: string
      imageId: string
      thumbUrl: string
      provider: 'mapillary' | 'google'
      initialClue: string
      energy: number
      timeLimit: number
      difficulty: Difficulty
    }
  }> {
    this.cleanupExpiredSessions()

    // Pick 5 unique locations upfront
    const locations = await this.gameService.getUniquePoolLocations(ROUNDS_PER_SESSION)

    const maxEnergy = SESSION_ENERGY[difficulty]

    // Create first round game with full session energy
    const gameData = this.gameService.createRoundGame(locations[0], difficulty, language, maxEnergy)

    const session: ActiveSession = {
      id: uuidv4(),
      caseNumber: nextCaseNumber++,
      caseName: this.pickCaseName(language),
      difficulty,
      language,
      locations,
      currentRound: 0,
      currentGameId: gameData.gameId,
      roundResults: [],
      totalScore: 0,
      energy: maxEnergy,
      maxEnergy,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      completed: false,
    }

    activeSessions.set(session.id, session)

    return {
      sessionId: session.id,
      caseNumber: session.caseNumber,
      caseName: session.caseName,
      difficulty: session.difficulty,
      totalRounds: ROUNDS_PER_SESSION,
      currentRound: session.currentRound,
      energy: session.energy,
      maxEnergy: session.maxEnergy,
      game: gameData,
    }
  }

  submitGuess(
    sessionId: string,
    guess: Location
  ): {
    roundIndex: number
    score: number
    distanceKm: number
    actualLocation: Location
    breakdown: {
      baseScore: number
      cluePenalty: number
      afterClues: number
      timeBonus: number
      afterTime: number
      betMultiplier: number
    }
    sessionComplete: boolean
    totalScore: number
    energyRemaining: number
    roundsPlayed: number
    totalRounds: number
  } {
    this.cleanupExpiredSessions()

    const session = activeSessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found or expired')
    }
    if (session.completed) {
      throw new Error('Session already completed')
    }
    if (!session.currentGameId) {
      throw new Error('No active round — call advance first')
    }

    this.touchSession(session)

    // Delegate to GameService (captures remaining energy before game deletion)
    const result = this.gameService.submitGuess(session.currentGameId, guess)

    // Update session energy from the game's remaining energy
    session.energy = result.energyRemaining

    // Store round result
    const roundResult: SessionRoundResult = {
      roundIndex: session.currentRound,
      score: result.score,
      distanceKm: result.distanceKm,
      actualLocation: result.actualLocation,
      guessLocation: guess,
      breakdown: result.breakdown,
    }
    session.roundResults.push(roundResult)
    session.totalScore += result.score
    session.currentGameId = null

    // Check if this was the last round
    const isLastRound = session.currentRound >= ROUNDS_PER_SESSION - 1
    if (isLastRound) {
      session.completed = true
    }

    return {
      roundIndex: session.currentRound,
      score: result.score,
      distanceKm: result.distanceKm,
      actualLocation: result.actualLocation,
      breakdown: result.breakdown,
      sessionComplete: session.completed,
      totalScore: session.totalScore,
      energyRemaining: session.energy,
      roundsPlayed: session.roundResults.length,
      totalRounds: ROUNDS_PER_SESSION,
    }
  }

  advanceRound(sessionId: string): {
    currentRound: number
    totalRounds: number
    game: {
      gameId: string
      imageId: string
      thumbUrl: string
      provider: 'mapillary' | 'google'
      initialClue: string
      energy: number
      timeLimit: number
      difficulty: Difficulty
    }
  } {
    this.cleanupExpiredSessions()

    const session = activeSessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found or expired')
    }
    if (session.completed) {
      throw new Error('Session already completed')
    }
    if (session.currentGameId) {
      throw new Error('Current round not yet submitted — submit guess first')
    }

    this.touchSession(session)

    // Advance to next round
    session.currentRound += 1

    if (session.currentRound >= ROUNDS_PER_SESSION) {
      throw new Error('No more rounds available')
    }

    // Create game for next round with session's remaining energy
    const entry = session.locations[session.currentRound]
    const gameData = this.gameService.createRoundGame(
      entry,
      session.difficulty,
      session.language as Language,
      session.energy
    )
    session.currentGameId = gameData.gameId

    return {
      currentRound: session.currentRound,
      totalRounds: ROUNDS_PER_SESSION,
      game: gameData,
    }
  }

  getSummary(sessionId: string): {
    sessionId: string
    caseNumber: number
    caseName: string
    difficulty: Difficulty
    totalScore: number
    rounds: SessionRoundResult[]
    shareableText: string
  } {
    this.cleanupExpiredSessions()

    const session = activeSessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found or expired')
    }
    if (!session.completed) {
      throw new Error('Session not yet completed')
    }

    return {
      sessionId: session.id,
      caseNumber: session.caseNumber,
      caseName: session.caseName,
      difficulty: session.difficulty,
      totalScore: session.totalScore,
      rounds: session.roundResults,
      shareableText: this.generateShareableText(session),
    }
  }

  getSession(sessionId: string): {
    sessionId: string
    caseNumber: number
    difficulty: Difficulty
    currentRound: number
    totalRounds: number
    totalScore: number
    roundResults: SessionRoundResult[]
    completed: boolean
    hasActiveRound: boolean
  } {
    this.cleanupExpiredSessions()

    const session = activeSessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found or expired')
    }

    this.touchSession(session)

    return {
      sessionId: session.id,
      caseNumber: session.caseNumber,
      difficulty: session.difficulty,
      currentRound: session.currentRound,
      totalRounds: ROUNDS_PER_SESSION,
      totalScore: session.totalScore,
      roundResults: session.roundResults,
      completed: session.completed,
      hasActiveRound: session.currentGameId !== null,
    }
  }
}
