import type { LatLng } from '../types'

export interface SceneData {
  id: string
  imageUrl?: string
  viewerKey?: string // For interactive viewers like Mapillary
  provider: string
  location?: LatLng // Only sent after guess is confirmed
}

export interface ImageProviderAdapter {
  // Get a scene near given coordinates
  getSceneNearLocation(
    lat: number,
    lng: number,
    radiusKm?: number,
  ): Promise<SceneData | null>

  // Get viewer component props (for React component)
  getViewerType(): 'interactive' | 'static'
}
