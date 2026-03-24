export interface MapillaryImage {
  id: string
  geometry: { type: string; coordinates: [number, number] } // [lng, lat]
  thumb_2048_url: string
}

export class MapillaryAdapter {
  private readonly token: string
  private readonly baseUrl = 'https://graph.mapillary.com'

  constructor(token: string) {
    this.token = token
  }

  /**
   * Search for images in a bounding box around the point.
   * Tries progressively larger radii: 0.01, 0.05, 0.1, 0.5 degrees.
   */
  async findImageNear(lat: number, lng: number): Promise<MapillaryImage | null> {
    const radii = [0.01, 0.05, 0.1, 0.5]

    for (const radius of radii) {
      const bbox = `${lng - radius},${lat - radius},${lng + radius},${lat + radius}`
      const url = `${this.baseUrl}/images?access_token=${this.token}&fields=id,geometry,thumb_2048_url&bbox=${bbox}&limit=1`

      try {
        const response = await fetch(url)
        if (!response.ok) continue
        const data = (await response.json()) as {
          data?: MapillaryImage[]
        }
        if (data.data && data.data.length > 0) {
          return data.data[0]
        }
      } catch {
        continue
      }
    }
    return null
  }
}
