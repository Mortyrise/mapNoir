import { Location } from '../domain/geography';
import { CountryRepository } from '../domain/geography';
import { RoundRepository } from '../domain/round';
import { ScoreCalculator, ScoreBreakdown } from '../domain/scoring';

export interface SubmitAnswerInput {
  roundId: string;
  lat: number;
  lon: number;
  betActive: boolean;
  cluesUsedCount: number;
  timeLeft: number;
}

export interface SubmitAnswerResult {
  score: number;
  breakdown: ScoreBreakdown;
  realLat: number;
  realLon: number;
  countryName: string;
  playerCountryName: string | null;
}

/**
 * Use Case: player submits a pin and receives their score.
 */
export class SubmitAnswer {
  private scorer = new ScoreCalculator();

  constructor(
    private roundRepo: RoundRepository,
    private countryRepo: CountryRepository,
  ) {}

  execute(input: SubmitAnswerInput): SubmitAnswerResult {
    const round = this.roundRepo.findById(input.roundId);
    if (!round) throw new Error(`Round not found: ${input.roundId}`);

    const guessLocation = new Location(input.lat, input.lon);
    const guessedCountry = this.countryRepo.findNearest(guessLocation);

    const breakdown = this.scorer.calculate({
      realLocation: round.location,
      guessLocation,
      realCountry: round.country,
      guessedCountry,
      extraCluesUsed: input.cluesUsedCount,
      timeLeft: input.timeLeft,
      betActive: input.betActive,
    });

    return {
      score: breakdown.final,
      breakdown,
      realLat: round.location.lat,
      realLon: round.location.lon,
      countryName: round.country.name,
      playerCountryName: guessedCountry?.name ?? null,
    };
  }
}
