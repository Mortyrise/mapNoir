import { Round } from './Round';

/**
 * Port: persistence for active rounds.
 */
export interface RoundRepository {
  save(round: Round): void;
  findById(id: string): Round | null;
}
