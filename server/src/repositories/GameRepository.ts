import { Location, CountryData, GameResult } from '../types'

export interface GameRepository {
  getRandomLocation(): Promise<Location>
  getCountryData(code: string): Promise<CountryData | null>
  getAllCountries(): Promise<CountryData[]>
  saveGameResult(result: GameResult): Promise<void>
}
