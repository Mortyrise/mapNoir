import { Country } from '../geography';
import { Clue } from './Clue';

/**
 * Port: how the domain generates clues for a country.
 * Infrastructure provides template-based or AI-based implementations.
 */
export interface ClueGenerator {
  generate(country: Country, count: number): Clue[];
  generateExtra(country: Country, exclude: string[]): Clue | null;
}
