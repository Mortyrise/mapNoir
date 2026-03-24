/**
 * Generates a pool of validated Mapillary locations.
 * Run with: npx ts-node --transpile-only src/scripts/generatePool.ts
 */
import dotenv from 'dotenv'
import path from 'path'
import { writeFile, readFile } from 'fs/promises'

dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') })

import { MapillaryAdapter, MapillaryImage } from '../adapters/MapillaryAdapter'
import { CountryData } from '../types'

const POOL_PATH = path.join(__dirname, '..', 'data', 'location-pool.json')
const COUNTRIES_PATH = path.join(__dirname, '..', 'data', 'countries.json')
// Adjust as needed — each location takes ~2s to validate against Mapillary
const TARGET_POOL_SIZE = parseInt(process.env.POOL_SIZE || '100', 10)
const BATCH_SIZE = 5

interface PoolEntry {
  imageId: string
  lat: number
  lng: number
  thumbUrl: string
  countryCode: string
}

async function loadCountries(): Promise<CountryData[]> {
  const raw = await readFile(COUNTRIES_PATH, 'utf-8')
  return Object.values(JSON.parse(raw))
}

function getWeightedRandomCountry(countries: CountryData[]): CountryData {
  const weights = { high: 8, medium: 3, low: 1 }
  const weighted: CountryData[] = []
  for (const c of countries) {
    const w = weights[c.mapillaryCoverage] || 1
    for (let i = 0; i < w; i++) weighted.push(c)
  }
  return weighted[Math.floor(Math.random() * weighted.length)]
}

function randomInBbox(bb: CountryData['boundingBox']): { lat: number; lng: number } {
  return {
    lat: bb.south + Math.random() * (bb.north - bb.south),
    lng: bb.west + Math.random() * (bb.east - bb.west),
  }
}

async function main() {
  const token = process.env.MAPILLARY_TOKEN
  if (!token) {
    console.error('MAPILLARY_TOKEN not set in .env')
    process.exit(1)
  }

  const adapter = new MapillaryAdapter(token)
  const countries = await loadCountries()

  // Load existing pool if any
  let pool: PoolEntry[] = []
  try {
    const raw = await readFile(POOL_PATH, 'utf-8')
    pool = JSON.parse(raw)
    console.log(`Existing pool: ${pool.length} locations`)
  } catch {
    console.log('No existing pool, starting fresh')
  }

  const needed = TARGET_POOL_SIZE - pool.length
  if (needed <= 0) {
    console.log(`Pool already has ${pool.length} locations (target: ${TARGET_POOL_SIZE})`)
    return
  }

  console.log(`Need ${needed} more locations. Searching...`)

  let found = 0
  let attempts = 0
  const panoOnly = process.env.PANO_ONLY !== 'false' // default: true
  console.log(`Mode: ${panoOnly ? 'panoramic only (360°)' : 'all images'}`)
  const maxAttempts = needed * (panoOnly ? 50 : 15)

  while (found < needed && attempts < maxAttempts) {
    // Generate batch of random locations
    const batch: { lat: number; lng: number; code: string }[] = []
    for (let i = 0; i < BATCH_SIZE; i++) {
      const country = getWeightedRandomCountry(countries)
      const coords = randomInBbox(country.boundingBox)
      batch.push({ ...coords, code: country.code })
    }

    // Query Mapillary in parallel
    const results = await Promise.all(
      batch.map((b) => adapter.findImageNear(b.lat, b.lng, panoOnly))
    )

    for (let i = 0; i < results.length; i++) {
      attempts++
      const image = results[i]
      if (image) {
        // Check for duplicates
        if (pool.some((p) => p.imageId === String(image.id))) continue

        pool.push({
          imageId: String(image.id),
          lat: image.geometry.coordinates[1],
          lng: image.geometry.coordinates[0],
          thumbUrl: image.thumb_2048_url,
          countryCode: batch[i].code,
        })
        found++
        process.stdout.write(`\r  Found: ${found}/${needed} (attempts: ${attempts})`)

        // Save incrementally every 5 finds
        if (found % 5 === 0) {
          await writeFile(POOL_PATH, JSON.stringify(pool, null, 2))
        }
      }
    }

    // Small delay to respect rate limits
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(`\nTotal pool: ${pool.length} locations`)
  console.log(`Success rate: ${((found / attempts) * 100).toFixed(1)}%`)

  await writeFile(POOL_PATH, JSON.stringify(pool, null, 2))
  console.log(`Saved to ${POOL_PATH}`)
}

main().catch(console.error)
