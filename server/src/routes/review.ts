import { Router } from 'express'
import { ReviewController } from '../controllers/ReviewController'

export function createReviewRouter(controller: ReviewController): Router {
  const router = Router()

  router.get('/locations', controller.getLocations)
  router.post('/vote', controller.submitReview)
  router.delete('/location/:imageId', controller.deleteLocation)
  router.get('/stats', controller.getStats)
  router.get('/countries', controller.getCountries)

  return router
}
