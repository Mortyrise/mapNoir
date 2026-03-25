import { Request, Response, NextFunction } from 'express'
import { ReviewService } from '../services/ReviewService'
import { AppError } from '../middleware/errorHandler'
import type { ReviewVote } from '../types'

export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  getLocations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const country = req.query.country as string | undefined
      const status = (req.query.status as 'all' | 'reviewed' | 'unreviewed') || 'all'

      const locations = await this.reviewService.getLocations(country, status)

      res.json({
        data: locations,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      next(err)
    }
  }

  submitReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageId, vote, note } = req.body

      if (!imageId || typeof imageId !== 'string') {
        throw new AppError('Missing imageId', 400, 'INVALID_REVIEW')
      }
      if (vote !== 'approve' && vote !== 'reject') {
        throw new AppError('Vote must be "approve" or "reject"', 400, 'INVALID_VOTE')
      }

      await this.reviewService.submitReview(imageId, vote as ReviewVote, note)

      res.json({
        data: { ok: true },
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'Location not found in pool') {
        next(new AppError(err.message, 404, 'LOCATION_NOT_FOUND'))
      } else {
        next(err)
      }
    }
  }

  deleteLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const imageId = req.params.imageId as string
      if (!imageId) {
        throw new AppError('Missing imageId', 400, 'MISSING_IMAGE_ID')
      }

      await this.reviewService.deleteLocation(imageId)

      res.json({
        data: { ok: true },
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'Location not found in pool') {
        next(new AppError(err.message, 404, 'LOCATION_NOT_FOUND'))
      } else {
        next(err)
      }
    }
  }

  getStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.reviewService.getStats()

      res.json({
        data: stats,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      next(err)
    }
  }

  getCountries = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const countries = await this.reviewService.getCountries()

      res.json({
        data: countries,
        meta: { timestamp: new Date().toISOString() },
      })
    } catch (err) {
      next(err)
    }
  }
}
