import { Request, Response, NextFunction } from 'express'
import { SessionService } from '../services/SessionService'
import { AppError } from '../middleware/errorHandler'
import type { Difficulty, Language } from '../types'

const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const VALID_LANGUAGES: Language[] = ['en', 'es']

export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  createSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const difficulty = (req.body?.difficulty as Difficulty) || 'medium'
      if (!VALID_DIFFICULTIES.includes(difficulty)) {
        throw new AppError('Invalid difficulty', 400, 'INVALID_DIFFICULTY')
      }

      const lang = (req.body?.language as Language) || 'en'
      const language = VALID_LANGUAGES.includes(lang) ? lang : 'en'

      const result = await this.sessionService.createSession(difficulty, language)

      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Not enough locations')) {
        next(new AppError(err.message, 503, 'INSUFFICIENT_POOL'))
      } else {
        next(err)
      }
    }
  }

  submitGuess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.params.sessionId as string
      if (!sessionId) {
        throw new AppError('Missing session ID', 400, 'MISSING_SESSION_ID')
      }

      const { lat, lng } = req.body
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new AppError('Missing lat or lng', 400, 'INVALID_GUESS')
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new AppError('Coordinates out of range', 400, 'INVALID_COORDINATES')
      }

      const result = this.sessionService.submitGuess(sessionId, { lat, lng })

      // Transform to client-expected format
      const isLastRound = result.sessionComplete
      const response: Record<string, unknown> = {
        roundIndex: result.roundIndex,
        score: result.score,
        distanceKm: result.distanceKm,
        actualLocation: result.actualLocation,
        guessLocation: { lat, lng },
        breakdown: result.breakdown,
        isLastRound,
      }

      // Include full summary on last round so client doesn't need a second call
      if (isLastRound) {
        const summary = this.sessionService.getSummary(sessionId)
        response.sessionSummary = {
          caseNumber: summary.caseNumber,
          caseName: summary.caseName,
          difficulty: summary.difficulty,
          rounds: summary.rounds.map((r) => ({
            roundIndex: r.roundIndex,
            score: r.score,
            distanceKm: r.distanceKm,
            actualLocation: r.actualLocation,
            guessLocation: r.guessLocation,
          })),
          totalScore: summary.totalScore,
          shareableText: summary.shareableText,
        }
      }

      res.json({
        data: response,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      if (err instanceof Error) {
        const statusMap: Record<string, number> = {
          'Session not found or expired': 404,
          'Session already completed': 400,
          'No active round — call advance first': 400,
          'Game not found or expired': 404,
        }
        const status = statusMap[err.message]
        if (status) {
          next(new AppError(err.message, status, 'SESSION_ERROR'))
          return
        }
      }
      next(err)
    }
  }

  advanceRound = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.params.sessionId as string
      if (!sessionId) {
        throw new AppError('Missing session ID', 400, 'MISSING_SESSION_ID')
      }

      const result = this.sessionService.advanceRound(sessionId)

      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      if (err instanceof Error) {
        const statusMap: Record<string, number> = {
          'Session not found or expired': 404,
          'Session already completed': 400,
          'Current round not yet submitted — submit guess first': 400,
          'No more rounds available': 400,
        }
        const status = statusMap[err.message]
        if (status) {
          next(new AppError(err.message, status, 'SESSION_ERROR'))
          return
        }
      }
      next(err)
    }
  }

  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.params.sessionId as string
      if (!sessionId) {
        throw new AppError('Missing session ID', 400, 'MISSING_SESSION_ID')
      }

      const result = this.sessionService.getSummary(sessionId)

      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      if (err instanceof Error) {
        const statusMap: Record<string, number> = {
          'Session not found or expired': 404,
          'Session not yet completed': 400,
        }
        const status = statusMap[err.message]
        if (status) {
          next(new AppError(err.message, status, 'SESSION_ERROR'))
          return
        }
      }
      next(err)
    }
  }
}
