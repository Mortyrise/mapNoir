import { Country, Location } from '../geography';

export interface ScoreInput {
  realLocation: Location;
  guessLocation: Location;
  realCountry: Country;
  guessedCountry: Country | null;
  extraCluesUsed: number;
  timeLeft: number;
  betActive: boolean;
}

export interface ScoreBreakdown {
  base: number;
  afterCoherence: number;
  afterResources: number;
  final: number;
  coherenceBonus: boolean;
  coherenceRatio: number;
  distanceKm: number;
  betMultiplier: number;
}

/**
 * Domain Service: pure scoring logic with no infrastructure dependencies.
 */
export class ScoreCalculator {
  private static readonly MAX_SCORE = 5000;
  private static readonly DECAY_FACTOR = 2000;
  private static readonly COHERENCE_THRESHOLD = 0.6;
  private static readonly COHERENCE_RECOVERY = 0.3;
  private static readonly CLUE_PENALTY = 0.15;
  private static readonly MAX_TIME = 60;

  calculate(input: ScoreInput): ScoreBreakdown {
    const distanceKm = input.realLocation.distanceTo(input.guessLocation);

    // Base score: exponential decay
    const base = Math.round(
      ScoreCalculator.MAX_SCORE * Math.exp(-distanceKm / ScoreCalculator.DECAY_FACTOR),
    );

    // Coherence bonus
    const coherenceRatio = input.guessedCountry
      ? input.realCountry.coherenceWith(input.guessedCountry)
      : 0;
    const coherenceBonus = coherenceRatio >= ScoreCalculator.COHERENCE_THRESHOLD;

    const lostPoints = ScoreCalculator.MAX_SCORE - base;
    const afterCoherence = coherenceBonus
      ? Math.round(base + lostPoints * ScoreCalculator.COHERENCE_RECOVERY)
      : base;

    // Resource penalties
    const cluePenalty = Math.min(input.extraCluesUsed, 5) * ScoreCalculator.CLUE_PENALTY;
    const timeRatio = Math.max(0, Math.min(input.timeLeft, ScoreCalculator.MAX_TIME)) / ScoreCalculator.MAX_TIME;
    const timeFactor = timeRatio * 0.1 + 0.9;
    const afterResources = Math.round(afterCoherence * (1 - cluePenalty) * timeFactor);

    // Bet
    const betMultiplier = input.betActive ? 2 : 1;
    const final = Math.round(afterResources * betMultiplier);

    return {
      base,
      afterCoherence,
      afterResources,
      final,
      coherenceBonus,
      coherenceRatio: Math.round(coherenceRatio * 100) / 100,
      distanceKm: Math.round(distanceKm),
      betMultiplier,
    };
  }
}
