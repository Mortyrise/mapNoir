import { Request, Response, NextFunction } from 'express'
import { GameService } from '../services/GameService'
import { AppError } from '../middleware/errorHandler'

export class GameController {
  constructor(private readonly gameService: GameService) {}

  newGame = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.gameService.createGame()

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
