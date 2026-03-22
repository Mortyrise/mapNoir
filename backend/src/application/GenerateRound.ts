import { v4 as uuidv4 } from 'uuid';
import { Location } from '../domain/geography';
import { Round, RoundRepository, ClueGenerator } from '../domain/round';
import { CountryRepository } from '../domain/geography';

export interface MapillaryImage {
  id: string;
  mapillaryId: string;
  lat: number;
  lon: number;
  countryCode: string;
  city: string;
  description: string;
}

export interface ImageSource {
  pickRandom(): MapillaryImage;
}

/**
 * Use Case: generate a new round for the player.
 */
export class GenerateRound {
  constructor(
    private roundRepo: RoundRepository,
    private countryRepo: CountryRepository,
    private clueGen: ClueGenerator,
    private imageSource: ImageSource,
  ) {}

  execute() {
    const image = this.imageSource.pickRandom();
    const country = this.countryRepo.findByCode(image.countryCode);
    if (!country) throw new Error(`Country not found: ${image.countryCode}`);

    const clues = this.clueGen.generate(country, 2);
    const round = new Round({
      id: uuidv4(),
      location: new Location(image.lat, image.lon),
      country,
      mapillaryId: image.mapillaryId,
      initialClues: clues,
    });

    this.roundRepo.save(round);
    return round.toClientDTO();
  }
}
