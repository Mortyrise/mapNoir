/**
 * Feeds the location pool ensuring a minimum number of locations per country.
 * Searches near known cities for much higher hit rates than random coordinates.
 *
 * Usage: npm run feed-pool            → min 8 per country (default)
 *        npm run feed-pool -- 12      → min 12 per country
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

/** Add small random offset around a city center (~5-15km radius) */
function jitterAroundCity(city: { lat: number; lng: number }): { lat: number; lng: number } {
  const offset = 0.05 + Math.random() * 0.1 // ~5-15km
  const angle = Math.random() * Math.PI * 2
  return {
    lat: city.lat + Math.sin(angle) * offset,
    lng: city.lng + Math.cos(angle) * offset,
  }
}

async function main() {
  const token = process.env.MAPILLARY_TOKEN
  if (!token) {
    console.error('MAPILLARY_TOKEN not set in .env')
    process.exit(1)
  }

  const minPerCountry = parseInt(process.argv[2] || '8', 10)
  const panoOnly = process.env.PANO_ONLY !== 'false'

  const adapter = new MapillaryAdapter(token)

  const countriesRaw = await readFile(COUNTRIES_PATH, 'utf-8')
  const countriesMap: Record<string, CountryData> = JSON.parse(countriesRaw)
  const countries = Object.values(countriesMap)

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

  // Count per country
  const countByCountry: Record<string, number> = {}
  for (const entry of pool) {
    countByCountry[entry.countryCode] = (countByCountry[entry.countryCode] || 0) + 1
  }

  const toFill = countries.filter((c) => (countByCountry[c.code] || 0) < minPerCountry)

  if (toFill.length === 0) {
    console.log(`All ${countries.length} countries already have ${minPerCountry}+ locations. Pool: ${pool.length}`)
    return
  }

  console.log(`Pool: ${initialSize} locations | Mode: ${panoOnly ? '360° only' : 'all images'}`)
  console.log(`Min per country: ${minPerCountry} | Countries to fill: ${toFill.length}/${countries.length}\n`)

  let totalFound = 0
  let totalAttempts = 0

  for (const country of toFill) {
    const current = countByCountry[country.code] || 0
    const needed = minPerCountry - current
    let found = 0
    let attempts = 0
    const maxAttempts = needed * 30 // much lower limit since city-based search is efficient

    process.stdout.write(`${country.code} ${country.name} (${current}→${minPerCountry}): `)

    while (found < needed && attempts < maxAttempts) {
      const batchCount = Math.min(BATCH_SIZE, needed - found + BATCH_SIZE)
      const batch: { lat: number; lng: number }[] = []
      for (let i = 0; i < batchCount; i++) {
        // Pick a random city and jitter around it
        const city = country.cities[Math.floor(Math.random() * country.cities.length)]
        batch.push(jitterAroundCity(city))
      }

      const results = await Promise.all(
        batch.map((b) => adapter.findImageNear(b.lat, b.lng, panoOnly))
      )

      for (const image of results) {
        attempts++
        if (!image) continue

        const imageId = String(image.id)
        if (existingIds.has(imageId)) continue

        existingIds.add(imageId)
        pool.push({
          imageId,
          lat: image.geometry.coordinates[1],
          lng: image.geometry.coordinates[0],
          thumbUrl: image.thumb_2048_url,
          countryCode: country.code,
        })
        found++
        countByCountry[country.code] = (countByCountry[country.code] || 0) + 1

        if (found % 3 === 0) {
          await writeFile(POOL_PATH, JSON.stringify(pool, null, 2))
        }
        if (found >= needed) break
      }

      process.stdout.write(`\r${country.code} ${country.name} (${current}→${minPerCountry}): ${found}/${needed} (${attempts} attempts)`)
      await new Promise((r) => setTimeout(r, 200))
    }

    totalFound += found
    totalAttempts += attempts

    if (found < needed) {
      process.stdout.write(` ⚠ only found ${found}/${needed}`)
    }
    console.log()

    await writeFile(POOL_PATH, JSON.stringify(pool, null, 2))
  }

  console.log(`\nDone! Pool: ${initialSize} → ${pool.length} (+${totalFound} new)`)
  console.log(`Total attempts: ${totalAttempts} | Success rate: ${((totalFound / totalAttempts) * 100).toFixed(1)}%`)
}

main().catch(console.error)
