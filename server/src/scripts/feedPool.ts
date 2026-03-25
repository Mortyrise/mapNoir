/**
 * Feeds the location pool with new locations.
 * Unlike generatePool, this script doesn't target a pool size —
 * it simply makes N requests and adds whatever it finds (skipping duplicates).
 *
 * Usage: npm run feed-pool            → 100 requests (default)
 *        npm run feed-pool -- 500     → 500 requests
 *        PANO_ONLY=false npm run feed-pool  → include non-panoramic images
 */
import dotenv from 'dotenv'
import path from 'path'
import { writeFile, readFile } from 'fs/promises'

dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') })

import { MapillaryAdapter } from '../adapters/MapillaryAdapter'
import { CountryData } from '../types'

const POOL_PATH = path.join(__dirname, '..', 'data', 'location-pool.json')
const COUNTRIES_PATH = path.join(__dirname, '..', 'data', 'countries.json')
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

  const totalRequests = parseInt(process.argv[2] || '100', 10)
  const panoOnly = process.env.PANO_ONLY !== 'false'

  const adapter = new MapillaryAdapter(token)
  const countries = await loadCountries()

  // Load existing pool
  let pool: PoolEntry[] = []
  try {
    const raw = await readFile(POOL_PATH, 'utf-8')
    pool = JSON.parse(raw)
  } catch {
    /* no existing pool */
  }

  const existingIds = new Set(pool.map((p) => p.imageId))
  const initialSize = pool.length

  console.log(`Pool: ${initialSize} locations`)
  console.log(`Requests: ${totalRequests} | Mode: ${panoOnly ? '360° only' : 'all images'}`)

  let requests = 0
  let found = 0
  let dupes = 0

  while (requests < totalRequests) {
    const batchCount = Math.min(BATCH_SIZE, totalRequests - requests)
    const batch: { lat: number; lng: number; code: string }[] = []
    for (let i = 0; i < batchCount; i++) {
      const country = getWeightedRandomCountry(countries)
      const coords = randomInBbox(country.boundingBox)
      batch.push({ ...coords, code: country.code })
    }

    const results = await Promise.all(
      batch.map((b) => adapter.findImageNear(b.lat, b.lng, panoOnly))
    )

    for (let i = 0; i < results.length; i++) {
      requests++
      const image = results[i]
      if (!image) continue

      const imageId = String(image.id)
      if (existingIds.has(imageId)) {
        dupes++
        continue
      }

      existingIds.add(imageId)
      pool.push({
        imageId,
        lat: image.geometry.coordinates[1],
        lng: image.geometry.coordinates[0],
        thumbUrl: image.thumb_2048_url,
        countryCode: batch[i].code,
      })
      found++

      if (found % 5 === 0) {
        await writeFile(POOL_PATH, JSON.stringify(pool, null, 2))
      }
    }

    process.stdout.write(`\r  Requests: ${requests}/${totalRequests} | New: ${found} | Dupes: ${dupes}`)
    await new Promise((r) => setTimeout(r, 200))
  }

  await writeFile(POOL_PATH, JSON.stringify(pool, null, 2))
  console.log(`\n\nDone! Pool: ${initialSize} → ${pool.length} (+${found} new, ${dupes} duplicates skipped)`)
}

main().catch(console.error)
