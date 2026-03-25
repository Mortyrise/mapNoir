import { Request, Response, NextFunction } from 'express'
import { GameService } from '../services/GameService'
import { AppError } from '../middleware/errorHandler'
import type { Difficulty, GameAction, Language } from '../types'

const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const VALID_ACTIONS: GameAction[] = ['move', 'clue', 'bet']
const VALID_LANGUAGES: Language[] = ['en', 'es']

export class GameController {
  constructor(private readonly gameService: GameService) {}

  newGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const difficulty = (req.body?.difficulty as Difficulty) || 'medium'
      if (!VALID_DIFFICULTIES.includes(difficulty)) {
        throw new AppError('Invalid difficulty', 400, 'INVALID_DIFFICULTY')
      }

      const lang = (req.body?.language as Language) || 'en'
      const language = VALID_LANGUAGES.includes(lang) ? lang : 'en'

      const result = await this.gameService.createGame(difficulty, language)

      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      next(err)
    }
  }

  reportPanoLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId, lat, lng } = req.body
      if (!gameId || typeof lat !== 'number' || typeof lng !== 'number') {
        throw new AppError('Missing gameId, lat, or lng', 400, 'INVALID_PANO_REPORT')
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new AppError('Coordinates out of range', 400, 'INVALID_COORDINATES')
      }

      this.gameService.updateActualLocation(gameId, { lat, lng })

      res.json({
        data: { ok: true },
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      next(err)
    }
  }

  startTimer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string
      if (!id) {
        throw new AppError('Missing game ID', 400, 'MISSING_GAME_ID')
      }

      const result = this.gameService.startTimer(id)

      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'Game not found or expired') {
        next(new AppError(err.message, 404, 'GAME_NOT_FOUND'))
      } else {
        next(err)
      }
    }
  }

  performAction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string
      const { action } = req.body

      if (!id) {
        throw new AppError('Missing game ID', 400, 'MISSING_GAME_ID')
      }

      if (!action || !VALID_ACTIONS.includes(action)) {
        throw new AppError(
          'Invalid action. Must be one of: move, clue, bet',
          400,
          'INVALID_ACTION'
        )
      }

      const result = this.gameService.performAction(id, action as GameAction)

      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      if (err instanceof Error) {
        const statusMap: Record<string, number> = {
          'Game not found or expired': 404,
          'Time has expired': 400,
          'Not enough energy': 400,
          'Movement already unlocked': 400,
          'No more clues available': 400,
          'Already placed a bet': 400,
        }
        const status = statusMap[err.message]
        if (status) {
          next(new AppError(err.message, status, 'ACTION_FAILED'))
          return
        }
      }
      next(err)
    }
  }

  submitGuess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId, lat, lng } = req.body
      if (!gameId || typeof lat !== 'number' || typeof lng !== 'number') {
        throw new AppError('Missing gameId, lat, or lng', 400, 'INVALID_GUESS')
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new AppError('Coordinates out of range', 400, 'INVALID_COORDINATES')
      }

      const result = this.gameService.submitGuess(gameId, { lat, lng })

      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'Game not found or expired') {
        next(new AppError(err.message, 404, 'GAME_NOT_FOUND'))
      } else {
        next(err)
      }
    }
  }
}
