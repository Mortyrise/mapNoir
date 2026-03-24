import type { LatLng, MapConfig, MarkerOptions } from '../types'

export interface MapAdapter {
  // Initialize map in a container element
  initialize(container: HTMLElement, config: MapConfig): void

  // Marker management
  placeMarker(position: LatLng, options?: MarkerOptions): string // returns marker id
  removeMarker(id: string): void
  clearMarkers(): void

  // View control
  setView(center: LatLng, zoom: number): void
  fitBounds(bounds: [LatLng, LatLng]): void

  // Lines
  drawLine(from: LatLng, to: LatLng, options?: { color?: string; dashed?: boolean }): string
  removeLine(id: string): void

  // Events
  onMapClick(callback: (position: LatLng) => void): void

  // Theme
  setTheme(theme: 'dark' | 'light'): void

  // Cleanup
  destroy(): void
}
