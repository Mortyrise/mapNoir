import { Country } from './Country';
import { Location } from './Location';

/**
 * Port: how the domain accesses country data.
 * Infrastructure provides the concrete implementation.
 */
export interface CountryRepository {
  findByCode(code: string): Country | null;
  findNearest(location: Location): Country | null;
  getAll(): Country[];
}
