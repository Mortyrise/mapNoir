/**
 * Value Object: A point on Earth defined by lat/lon.
 */
export class Location {
  constructor(
    public readonly lat: number,
    public readonly lon: number,
  ) {}

  /** Haversine distance in kilometers. */
  distanceTo(other: Location): number {
    const R = 6371;
    const dLat = this.toRad(other.lat - this.lat);
    const dLon = this.toRad(other.lon - this.lon);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(this.lat)) *
        Math.cos(this.toRad(other.lat)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
