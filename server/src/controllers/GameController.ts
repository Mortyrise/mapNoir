import { Request, Response, NextFunction } from 'express'
import { GameService } from '../services/GameService'
import { AppError } from '../middleware/errorHandler'

export class GameController {
  constructor(private readonly gameService: GameService) {}

  newGame = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const difficulty = req.body.difficulty || 'medium'
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        throw new AppError('Invalid difficulty', 400, 'INVALID_DIFFICULTY')
      }

      const result = await this.gameService.createGame(difficulty)

      res.json({
        data: result,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      next(err)
    }
  }

  submitGuess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { gameId, lat, lng } = req.body
      if (!gameId || typeof lat !== 'number' || typeof lng !== 'number') {
        throw new AppError('Missing gameId, lat, or lng', 400, 'INVALID_GUESS')
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
