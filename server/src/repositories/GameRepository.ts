import { Location, CountryData, GameResult } from '../types'

export interface GameRepository {
  getRandomLocation(): Promise<Location>
  getRandomLocationInCountry(code: string): Promise<Location | null>
  getCountryData(code: string): Promise<CountryData | null>
  getAllCountries(): Promise<CountryData[]>
  saveGameResult(result: GameResult): Promise<void>
}
