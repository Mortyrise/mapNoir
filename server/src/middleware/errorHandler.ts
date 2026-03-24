import { Request, Response, NextFunction } from 'express'
import { ApiErrorResponse } from '../types'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.message)

  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
      },
    }
    res.status(err.statusCode).json(body)
    return
  }

  // Never leak stack traces or internal details in production
  const isProduction = process.env.NODE_ENV === 'production'
  const body: ApiErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction ? 'An unexpected error occurred' : err.message,
    },
  }
  res.status(500).json(body)
}
