export interface MapillaryImage {
  id: string
  geometry: { type: string; coordinates: [number, number] } // [lng, lat]
  thumb_2048_url: string
  camera_type?: string
}

const PANO_TYPES = new Set(['equirectangular', 'spherical'])

// Mapillary limits bbox to < 0.01 sq degrees
// 0.099 × 0.099 = 0.0098 sq degrees (just under limit, ~11km × 11km at equator)
const BBOX_HALF = 0.0495

export class MapillaryAdapter {
  private readonly token: string
  private readonly baseUrl = 'https://graph.mapillary.com'

  constructor(token: string) {
    this.token = token
  }

  /**
   * Search for a Mapillary image near the given coordinates.
   * If panoOnly is true, only return equirectangular/spherical images (360°).
   * Fetches up to 10 results and filters client-side since the API
   * does not reliably support server-side camera_type filtering.
   */
  async findImageNear(lat: number, lng: number, panoOnly = false): Promise<MapillaryImage | null> {
    const west = lng - BBOX_HALF
    const south = lat - BBOX_HALF
    const east = lng + BBOX_HALF
    const north = lat + BBOX_HALF
    const bbox = `${west},${south},${east},${north}`
    const limit = panoOnly ? 10 : 1
    const url = `${this.baseUrl}/images?access_token=${this.token}&fields=id,geometry,thumb_2048_url,camera_type&bbox=${bbox}&limit=${limit}`

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!response.ok) return null

      const data = (await response.json()) as { data?: MapillaryImage[] }
      if (!data.data || data.data.length === 0) return null

      if (panoOnly) {
        return data.data.find((img) => PANO_TYPES.has(img.camera_type ?? '')) ?? null
      }
      return data.data[0]
    } catch {
      // Timeout or network error
    }
    return null
  }
}
