import { Country, Location } from '../geography';
import { Clue } from './Clue';

/**
 * Aggregate Root: a game round.
 * Encapsulates all state and business rules for a single round.
 */
export class Round {
  public readonly id: string;
  public readonly location: Location;
  public readonly country: Country;
  public readonly mapillaryId: string;
  public readonly initialClues: Clue[];
  public readonly createdAt: number;

  private extraClues: Clue[] = [];

  constructor(params: {
    id: string;
    location: Location;
    country: Country;
    mapillaryId: string;
    initialClues: Clue[];
  }) {
    this.id = params.id;
    this.location = params.location;
    this.country = params.country;
    this.mapillaryId = params.mapillaryId;
    this.initialClues = params.initialClues;
    this.createdAt = Date.now();
  }

  get allClueTexts(): string[] {
    return [
      ...this.initialClues.map(c => c.text),
      ...this.extraClues.map(c => c.text),
    ];
  }

  get extraClueCount(): number {
    return this.extraClues.length;
  }

  addExtraClue(clue: Clue): void {
    this.extraClues.push(clue);
  }

  /** Public response — hides real location from client. */
  toClientDTO() {
    return {
      roundId: this.id,
      mapillaryId: this.mapillaryId,
      clues: this.initialClues,
    };
  }
}
