import { RoundRepository, ClueGenerator, Clue } from '../domain/round';

export interface RequestExtraClueInput {
  roundId: string;
  usedClueTexts: string[];
}

/**
 * Use Case: player requests an additional clue for the current round.
 */
export class RequestExtraClue {
  constructor(
    private roundRepo: RoundRepository,
    private clueGen: ClueGenerator,
  ) {}

  execute(input: RequestExtraClueInput): Clue | null {
    const round = this.roundRepo.findById(input.roundId);
    if (!round) throw new Error(`Round not found: ${input.roundId}`);

    const excluded = [...round.allClueTexts, ...input.usedClueTexts];
    const clue = this.clueGen.generateExtra(round.country, excluded);
    if (!clue) return null;

    round.addExtraClue(clue);
    this.roundRepo.save(round);
    return clue;
  }
}
