import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import type { LocationReview, ReviewVote } from '../types'

interface PoolEntry {
  imageId: string
  lat: number
  lng: number
  thumbUrl: string
  countryCode: string
}

export interface ReviewLocation extends PoolEntry {
  review?: LocationReview
}

export interface ReviewStats {
  total: number
  reviewed: number
  approved: number
  rejected: number
  countries: {
    countryCode: string
    total: number
    reviewed: number
    approved: number
    rejected: number
  }[]
}

const POOL_PATH = path.join(__dirname, '..', 'data', 'location-pool.json')
const REVIEWS_PATH = path.join(__dirname, '..', 'data', 'reviews.json')

export class ReviewService {
  private pool: PoolEntry[] | null = null
  private reviews: Map<string, LocationReview> = new Map()
  private loaded = false

  private async loadPool(): Promise<PoolEntry[]> {
    if (this.pool) return this.pool
    const raw = await readFile(POOL_PATH, 'utf-8')
    this.pool = JSON.parse(raw)
    return this.pool!
  }

  private async loadReviews(): Promise<void> {
    if (this.loaded) return
    try {
      const raw = await readFile(REVIEWS_PATH, 'utf-8')
      const arr: LocationReview[] = JSON.parse(raw)
      for (const r of arr) this.reviews.set(r.imageId, r)
    } catch {
      // No reviews file yet
    }
    this.loaded = true
  }

  private async saveReviews(): Promise<void> {
    const arr = Array.from(this.reviews.values())
    await writeFile(REVIEWS_PATH, JSON.stringify(arr, null, 2))
  }

  async getLocations(
    countryCode?: string,
    status?: 'all' | 'reviewed' | 'unreviewed'
  ): Promise<ReviewLocation[]> {
    const pool = await this.loadPool()
    await this.loadReviews()

    let locations: ReviewLocation[] = pool.map((p) => ({
      ...p,
      review: this.reviews.get(p.imageId),
    }))

    if (countryCode) {
      locations = locations.filter((l) => l.countryCode === countryCode)
    }
    if (status === 'reviewed') {
      locations = locations.filter((l) => l.review)
    } else if (status === 'unreviewed') {
      locations = locations.filter((l) => !l.review)
    }

    return locations
  }

  async submitReview(imageId: string, vote: ReviewVote, note?: string): Promise<void> {
    await this.loadPool()
    await this.loadReviews()

    const entry = this.pool!.find((p) => p.imageId === imageId)
    if (!entry) throw new Error('Location not found in pool')

    this.reviews.set(imageId, {
      imageId,
      countryCode: entry.countryCode,
      vote,
      note: note || undefined,
      reviewedAt: new Date().toISOString(),
    })

    await this.saveReviews()
  }

  async deleteLocation(imageId: string): Promise<void> {
    const pool = await this.loadPool()
    await this.loadReviews()

    const idx = pool.findIndex((p) => p.imageId === imageId)
    if (idx === -1) throw new Error('Location not found in pool')

    pool.splice(idx, 1)
    this.reviews.delete(imageId)

    await writeFile(POOL_PATH, JSON.stringify(pool, null, 2))
    await this.saveReviews()
  }

  async getStats(): Promise<ReviewStats> {
    const pool = await this.loadPool()
    await this.loadReviews()

    const countryMap = new Map<string, { total: number; reviewed: number; approved: number; rejected: number }>()

    for (const entry of pool) {
      let c = countryMap.get(entry.countryCode)
      if (!c) {
        c = { total: 0, reviewed: 0, approved: 0, rejected: 0 }
        countryMap.set(entry.countryCode, c)
      }
      c.total++
      const review = this.reviews.get(entry.imageId)
      if (review) {
        c.reviewed++
        if (review.vote === 'approve') c.approved++
        else c.rejected++
      }
    }

    const countries = Array.from(countryMap.entries())
      .map(([countryCode, stats]) => ({ countryCode, ...stats }))
      .sort((a, b) => a.countryCode.localeCompare(b.countryCode))

    return {
      total: pool.length,
      reviewed: this.reviews.size,
      approved: Array.from(this.reviews.values()).filter((r) => r.vote === 'approve').length,
      rejected: Array.from(this.reviews.values()).filter((r) => r.vote === 'reject').length,
      countries,
    }
  }

  async getCountries(): Promise<string[]> {
    const pool = await this.loadPool()
    return [...new Set(pool.map((p) => p.countryCode))].sort()
  }
}
