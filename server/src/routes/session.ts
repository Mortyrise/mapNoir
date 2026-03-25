import { Router } from 'express'
import { SessionController } from '../controllers/SessionController'

export function createSessionRouter(controller: SessionController): Router {
  const router = Router()

  // POST /api/session/new
  router.post('/new', controller.createSession)

  // POST /api/session/:sessionId/guess
  router.post('/:sessionId/guess', controller.submitGuess)

  // POST /api/session/:sessionId/next
  router.post('/:sessionId/next', controller.advanceRound)

  // GET /api/session/:sessionId/summary
  router.get('/:sessionId/summary', controller.getSummary)

  return router
}
