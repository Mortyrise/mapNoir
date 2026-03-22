import { Country, CountryRepository } from '../../domain/geography';
import { Location } from '../../domain/geography';
import countriesData from '../data/europe-countries.json';
import imagesData from '../data/mapillary-images.json';

interface ImageEntry {
  lat: number;
  lon: number;
  countryCode: string;
}

export class JsonCountryRepository implements CountryRepository {
  private countries: Country[];
  private images: ImageEntry[];

  constructor() {
    this.countries = (countriesData as any[]).map(d => new Country(d));
    this.images = imagesData as ImageEntry[];
  }

  findByCode(code: string): Country | null {
    return this.countries.find(c => c.code === code) ?? null;
  }

  /**
   * MVP reverse geocoding: find the nearest curated image
   * and return its country. Good enough for Europe scoring.
   */
  findNearest(location: Location): Country | null {
    let minDist = Infinity;
    let bestCode = '';

    for (const img of this.images) {
      const d = location.distanceTo(new Location(img.lat, img.lon));
      if (d < minDist) {
        minDist = d;
        bestCode = img.countryCode;
      }
    }
    return this.findByCode(bestCode);
  }

  getAll(): Country[] {
    return this.countries;
  }
}
