/**
 * Value Object: a single clue shown to the player.
 */
export type ClueType =
  | 'auditory'
  | 'geopolitical'
  | 'monetary'
  | 'climatic'
  | 'regional'
  | 'coastal'
  | 'negative'
  | 'narrative';

export interface Clue {
  type: ClueType;
  text: string;
}
