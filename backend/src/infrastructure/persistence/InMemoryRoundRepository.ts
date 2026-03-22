import { Round, RoundRepository } from '../../domain/round';

export class InMemoryRoundRepository implements RoundRepository {
  private store = new Map<string, Round>();

  save(round: Round): void {
    this.store.set(round.id, round);
  }

  findById(id: string): Round | null {
    return this.store.get(id) ?? null;
  }
}
