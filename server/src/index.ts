import path from 'path'
import dotenv from 'dotenv'

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { errorHandler } from './middleware/errorHandler'
import { ApiSuccessResponse } from './types'
import { createGameRouter } from './routes/game'
import { JsonGameRepository } from './repositories/JsonGameRepository'
import { MapillaryAdapter } from './adapters/MapillaryAdapter'
import { GameService } from './services/GameService'
import { GameController } from './controllers/GameController'

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
  })
)
app.use(express.json())

// Rate limiting on /api
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
})
app.use('/api', apiLimiter)

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  const body: ApiSuccessResponse<{ status: string }> = {
    data: { status: 'ok' },
    meta: { timestamp: new Date().toISOString() },
  }
  res.json(body)
})

// Initialize dependencies
const repo = new JsonGameRepository()
const mapillaryToken = process.env.MAPILLARY_TOKEN
const mapillary = mapillaryToken ? new MapillaryAdapter(mapillaryToken) : null

if (!mapillaryToken) {
  console.log('[server] MAPILLARY_TOKEN not set — running with placeholder images')
}

const gameService = new GameService(repo, mapillary)
const gameController = new GameController(gameService)

// Routes
app.use('/api/game', createGameRouter(gameController))

// Global error handler (must be registered last)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[server] Map Noir server running on port ${PORT}`)
  console.log(`[server] Environment: ${process.env.NODE_ENV ?? 'development'}`)
})

export default app
