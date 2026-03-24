import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { GameRepository } from './GameRepository'
import { Location, CountryData, GameResult } from '../types'

export class JsonGameRepository implements GameRepository {
  private countriesCache: CountryData[] | null = null
  private readonly countriesPath: string
  private readonly resultsPath: string

  constructor() {
    this.countriesPath = path.join(__dirname, '..', 'data', 'countries.json')
    this.resultsPath = path.join(__dirname, '..', 'data', 'results.json')
  }

  private async loadCountries(): Promise<CountryData[]> {
    if (this.countriesCache) {
      return this.countriesCache
    }

    const raw = await readFile(this.countriesPath, 'utf-8')
    const countriesObj = JSON.parse(raw)
    // Convert object keyed by country code to array
    const countries: CountryData[] = Object.values(countriesObj)
    this.countriesCache = countries
    return countries
  }

  async getRandomLocation(): Promise<Location> {
    const countries = await this.loadCountries()

    // Weight selection by coverage: high=6, medium=3, low=1
    const weights = { high: 6, medium: 3, low: 1 }
    const weighted: CountryData[] = []
    for (const country of countries) {
      const w = weights[country.mapillaryCoverage] || 1
      for (let i = 0; i < w; i++) {
        weighted.push(country)
      }
    }

    const country = weighted[Math.floor(Math.random() * weighted.length)]
    const { north, south, east, west } = country.boundingBox

    const lat = south + Math.random() * (north - south)
    const lng = west + Math.random() * (east - west)

    return {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
    }
  }

  async getRandomLocationInCountry(code: string): Promise<Location | null> {
    const country = await this.getCountryData(code)
    if (!country) return null
    const { north, south, east, west } = country.boundingBox
    const lat = south + Math.random() * (north - south)
    const lng = west + Math.random() * (east - west)
    return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) }
  }

  async getCountryData(code: string): Promise<CountryData | null> {
    const countries = await this.loadCountries()
    return countries.find((c) => c.code === code) ?? null
  }

  async getAllCountries(): Promise<CountryData[]> {
    return this.loadCountries()
  }

  async saveGameResult(result: GameResult): Promise<void> {
    try {
      let results: GameResult[] = []
      try {
        const raw = await readFile(this.resultsPath, 'utf-8')
        results = JSON.parse(raw)
      } catch {
        // File doesn't exist yet, start with empty array
      }

      results.push(result)
      await writeFile(this.resultsPath, JSON.stringify(results, null, 2), 'utf-8')
    } catch (err) {
      // Fallback: log result if file write fails
      console.log('[GameResult]', JSON.stringify(result))
    }
  }
}
