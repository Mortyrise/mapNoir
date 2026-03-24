import { Router, Request, Response } from 'express'
import { ApiSuccessResponse } from '../types'
import { GameController } from '../controllers/GameController'

export function createGameRouter(controller: GameController): Router {
  const router = Router()

  // GET /api/game/health
  router.get('/health', (_req: Request, res: Response) => {
    const body: ApiSuccessResponse<{ status: string }> = {
      data: { status: 'ok' },
      meta: { timestamp: new Date().toISOString() },
    }
    res.json(body)
  })

  // POST /api/game/new
  router.post('/new', controller.newGame)

  // POST /api/game/guess
  router.post('/guess', controller.submitGuess)

  return router
}
