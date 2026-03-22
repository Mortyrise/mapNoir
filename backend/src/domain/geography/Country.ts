/**
 * Value Object: metadata about a country used for clue generation and scoring.
 */
export interface CountryProps {
  code: string;
  name: string;
  languages: string[];
  driving: 'right' | 'left';
  climate: string[];
  currency: string;
  region: string;
  coastal: boolean;
  borders: string[];
  touristLevel: 'high' | 'medium' | 'low';
  tags: string[];
}

export class Country {
  readonly code: string;
  readonly name: string;
  readonly languages: string[];
  readonly driving: 'right' | 'left';
  readonly climate: string[];
  readonly currency: string;
  readonly region: string;
  readonly coastal: boolean;
  readonly borders: string[];
  readonly touristLevel: 'high' | 'medium' | 'low';
  readonly tags: string[];

  constructor(props: CountryProps) {
    this.code = props.code;
    this.name = props.name;
    this.languages = props.languages;
    this.driving = props.driving;
    this.climate = props.climate;
    this.currency = props.currency;
    this.region = props.region;
    this.coastal = props.coastal;
    this.borders = props.borders;
    this.touristLevel = props.touristLevel;
    this.tags = props.tags;
  }

  /** Metadata coherence ratio with another country (0..1). */
  coherenceWith(other: Country): number {
    if (this.code === other.code) return 1;

    const checks = [
      this.languages.some(l => other.languages.includes(l)),
      this.driving === other.driving,
      this.currency === other.currency,
      this.climate.some(c => other.climate.includes(c)),
      this.region === other.region,
      this.coastal === other.coastal,
    ];
    return checks.filter(Boolean).length / checks.length;
  }

  hasBorderWith(countryCode: string): boolean {
    return this.borders.includes(countryCode);
  }
}
