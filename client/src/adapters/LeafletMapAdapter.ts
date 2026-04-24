import L from 'leaflet'
import type { MapAdapter } from './MapAdapter'
import type { LatLng, MapConfig, MarkerOptions } from '../types'

const TILE_URLS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
}
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'

const MARKER_COLORS = {
  dark: '#d97706',
  light: '#b85a1a',
}

const MARKER_BORDER = {
  dark: '#07090a',
  light: '#f3efe6',
}

const LINE_COLORS = {
  dark: {
    outline: 'rgba(106, 184, 168, 0.22)',
    foreground: 'rgba(106, 184, 168, 0.85)',
  },
  light: {
    outline: 'rgba(47, 109, 96, 0.18)',
    foreground: 'rgba(47, 109, 96, 0.9)',
  },
}

let markerIdCounter = 0

function nextMarkerId(): string {
  markerIdCounter += 1
  return `marker-${markerIdCounter}`
}

function buildIcon(color: string, borderColor: string): L.DivIcon {
  return L.divIcon({
    className: 'map-noir-marker',
    html: `<div style="
      width: 16px;
      height: 16px;
      background: ${color};
      border: 2px solid ${borderColor};
      border-radius: 50%;
      box-shadow: 0 0 6px ${color}80;
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

let lineIdCounter = 0

function nextLineId(): string {
  lineIdCounter += 1
  return `line-${lineIdCounter}`
}

export class LeafletMapAdapter implements MapAdapter {
  private map: L.Map | null = null
  private tileLayer: L.TileLayer | null = null
  private markers: Map<string, L.Marker> = new Map()
  private lines: Map<string, { outline: L.Polyline; foreground: L.Polyline }> = new Map()
  private currentTheme: 'dark' | 'light' = 'dark'

  initialize(container: HTMLElement, config: MapConfig): void {
    this.map = L.map(container, {
      center: [config.center.lat, config.center.lng],
      zoom: config.zoom,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
    })

    this.tileLayer = L.tileLayer(TILE_URLS[this.currentTheme], {
      attribution: TILE_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map)
  }

  setTheme(theme: 'dark' | 'light'): void {
    if (theme === this.currentTheme) return
    this.currentTheme = theme

    if (this.map && this.tileLayer) {
      this.tileLayer.setUrl(TILE_URLS[theme])
    }

    // Update existing marker icons to match new theme
    const color = MARKER_COLORS[theme]
    const border = MARKER_BORDER[theme]
    for (const marker of this.markers.values()) {
      marker.setIcon(buildIcon(color, border))
    }

    // Update existing line colors to match new theme
    const lineColors = LINE_COLORS[theme]
    for (const { outline, foreground } of this.lines.values()) {
      outline.setStyle({ color: lineColors.outline })
      foreground.setStyle({ color: lineColors.foreground })
    }
  }

  placeMarker(position: LatLng, options?: MarkerOptions): string {
    if (!this.map) {
      throw new Error('Map not initialized. Call initialize() first.')
    }

    const id = nextMarkerId()
    const color = options?.color ?? MARKER_COLORS[this.currentTheme]
    const border = MARKER_BORDER[this.currentTheme]

    const marker = L.marker([position.lat, position.lng], {
      icon: buildIcon(color, border),
      draggable: options?.draggable ?? false,
    })

    if (options?.label) {
      marker.bindTooltip(options.label, {
        permanent: false,
        direction: 'top',
        className: 'map-noir-tooltip',
      })
    }

    marker.addTo(this.map)
    this.markers.set(id, marker)

    return id
  }

  removeMarker(id: string): void {
    const marker = this.markers.get(id)
    if (marker) {
      marker.remove()
      this.markers.delete(id)
    }
  }

  clearMarkers(): void {
    for (const marker of this.markers.values()) {
      marker.remove()
    }
    this.markers.clear()
  }

  setView(center: LatLng, zoom: number): void {
    if (!this.map) {
      throw new Error('Map not initialized. Call initialize() first.')
    }
    this.map.setView([center.lat, center.lng], zoom)
  }

  fitBounds(bounds: [LatLng, LatLng]): void {
    if (!this.map) {
      throw new Error('Map not initialized. Call initialize() first.')
    }
    this.map.fitBounds([
      [bounds[0].lat, bounds[0].lng],
      [bounds[1].lat, bounds[1].lng],
    ])
  }

  drawLine(from: LatLng, to: LatLng, options?: { color?: string; dashed?: boolean }): string {
    if (!this.map) {
      throw new Error('Map not initialized. Call initialize() first.')
    }

    const id = nextLineId()
    const lineColors = LINE_COLORS[this.currentTheme]
    const dashArray = options?.dashed ? '8, 8' : undefined
    const coords: L.LatLngExpression[] = [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ]

    // Wider outline for contrast on any background
    const outline = L.polyline(coords, {
      color: lineColors.outline,
      weight: 6,
      opacity: 1,
      dashArray,
      lineCap: 'round',
    }).addTo(this.map)

    // Thinner foreground accent line
    const foreground = L.polyline(coords, {
      color: options?.color ?? lineColors.foreground,
      weight: 2,
      opacity: 1,
      dashArray,
      lineCap: 'round',
    }).addTo(this.map)

    this.lines.set(id, { outline, foreground })

    return id
  }

  removeLine(id: string): void {
    const entry = this.lines.get(id)
    if (entry) {
      entry.outline.remove()
      entry.foreground.remove()
      this.lines.delete(id)
    }
  }

  onMapClick(callback: (position: LatLng) => void): void {
    if (!this.map) {
      throw new Error('Map not initialized. Call initialize() first.')
    }
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      callback({ lat: e.latlng.lat, lng: e.latlng.lng })
    })
  }

  destroy(): void {
    this.clearMarkers()
    for (const { outline, foreground } of this.lines.values()) {
      outline.remove()
      foreground.remove()
    }
    this.lines.clear()
    if (this.map) {
      this.map.remove()
      this.map = null
      this.tileLayer = null
    }
  }
}
