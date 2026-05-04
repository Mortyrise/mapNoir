import maplibregl, {
  Map as MLMap,
  Marker as MLMarker,
  MapMouseEvent,
} from 'maplibre-gl'
import type { MapAdapter } from './MapAdapter'
import type { LatLng, MapConfig, MarkerOptions } from '../types'

// CARTO vector basemaps — same paleta as the previous raster tiles, free, no token.
const STYLE_URLS = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
}

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

let lineIdCounter = 0
function nextLineId(): string {
  lineIdCounter += 1
  return `line-${lineIdCounter}`
}

function buildMarkerElement(color: string, borderColor: string, label?: string): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'map-noir-marker'
  wrapper.style.width = '20px'
  wrapper.style.height = '20px'
  wrapper.innerHTML = `<div style="
    width: 16px;
    height: 16px;
    background: ${color};
    border: 2px solid ${borderColor};
    border-radius: 50%;
    box-shadow: 0 0 6px ${color}80;
  "></div>`
  if (label) wrapper.title = label
  return wrapper
}

interface LineRecord {
  id: string
  from: LatLng
  to: LatLng
  options?: { color?: string; dashed?: boolean }
}

interface MarkerRecord {
  marker: MLMarker
  position: LatLng
  options?: MarkerOptions
}

export class MapLibreMapAdapter implements MapAdapter {
  private map: MLMap | null = null
  private markers: Map<string, MarkerRecord> = new Map()
  private lines: Map<string, LineRecord> = new Map()
  private currentTheme: 'dark' | 'light' = 'dark'

  initialize(container: HTMLElement, config: MapConfig): void {
    this.map = new maplibregl.Map({
      container,
      style: STYLE_URLS[this.currentTheme],
      center: [config.center.lng, config.center.lat],
      zoom: config.zoom,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
    })

    this.map.addControl(
      new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }),
      'top-right'
    )

    // Globe projection — requires MapLibre GL >= 5.0. The API moved out of
    // MapOptions in v5.24, so set it explicitly post-load. style.load also
    // fires after every setStyle (theme change), so the projection persists.
    this.map.on('style.load', () => {
      this.map?.setProjection({ type: 'globe' })
      // Sources/layers are wiped on style change; markers (DOM) survive.
      this.reAddLineLayers()
    })
  }

  setTheme(theme: 'dark' | 'light'): void {
    if (theme === this.currentTheme) return
    this.currentTheme = theme

    if (!this.map) return

    // Re-skin existing markers (MapLibre Marker has no setIcon equivalent,
    // so we replace the element on each record).
    const fallbackColor = MARKER_COLORS[theme]
    const borderColor = MARKER_BORDER[theme]
    for (const record of this.markers.values()) {
      const color = record.options?.color ?? fallbackColor
      const newEl = buildMarkerElement(color, borderColor, record.options?.label)
      record.marker.remove()
      record.marker = new maplibregl.Marker({
        element: newEl,
        draggable: record.options?.draggable ?? false,
      })
        .setLngLat([record.position.lng, record.position.lat])
        .addTo(this.map)
    }

    // Swap the basemap. This wipes line sources/layers; style.load handler re-adds.
    this.map.setStyle(STYLE_URLS[theme])
  }

  placeMarker(position: LatLng, options?: MarkerOptions): string {
    if (!this.map) {
      throw new Error('Map not initialized. Call initialize() first.')
    }

    const id = nextMarkerId()
    const color = options?.color ?? MARKER_COLORS[this.currentTheme]
    const border = MARKER_BORDER[this.currentTheme]
    const el = buildMarkerElement(color, border, options?.label)

    const marker = new maplibregl.Marker({
      element: el,
      draggable: options?.draggable ?? false,
    })
      .setLngLat([position.lng, position.lat])
      .addTo(this.map)

    this.markers.set(id, { marker, position, options })
    return id
  }

  removeMarker(id: string): void {
    const record = this.markers.get(id)
    if (record) {
      record.marker.remove()
      this.markers.delete(id)
    }
  }

  clearMarkers(): void {
    for (const record of this.markers.values()) {
      record.marker.remove()
    }
    this.markers.clear()
  }

  setView(center: LatLng, zoom: number): void {
    if (!this.map) {
      throw new Error('Map not initialized. Call initialize() first.')
    }
    this.map.setCenter([center.lng, center.lat])
    this.map.setZoom(zoom)
  }

  fitBounds(bounds: [LatLng, LatLng]): void {
    if (!this.map) {
      throw new Error('Map not initialized. Call initialize() first.')
    }
    this.map.fitBounds(
      [
        [bounds[0].lng, bounds[0].lat],
        [bounds[1].lng, bounds[1].lat],
      ],
      { padding: 60, duration: 500 }
    )
  }

  drawLine(
    from: LatLng,
    to: LatLng,
    options?: { color?: string; dashed?: boolean }
  ): string {
    if (!this.map) {
      throw new Error('Map not initialized. Call initialize() first.')
    }

    const id = nextLineId()
    const record: LineRecord = { id, from, to, options }
    this.lines.set(id, record)

    if (this.map.isStyleLoaded()) {
      this.addLineToMap(record)
    }
    // If style isn't loaded yet, style.load handler will pick it up.
    return id
  }

  removeLine(id: string): void {
    this.lines.delete(id)
    if (!this.map) return

    const outlineLayer = `${id}-outline`
    const foregroundLayer = `${id}-foreground`

    if (this.map.getLayer(outlineLayer)) this.map.removeLayer(outlineLayer)
    if (this.map.getLayer(foregroundLayer)) this.map.removeLayer(foregroundLayer)
    if (this.map.getSource(id)) this.map.removeSource(id)
  }

  onMapClick(callback: (position: LatLng) => void): void {
    if (!this.map) {
      throw new Error('Map not initialized. Call initialize() first.')
    }
    this.map.on('click', (e: MapMouseEvent) => {
      callback({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    })
  }

  destroy(): void {
    this.clearMarkers()
    this.lines.clear()
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  }

  private addLineToMap(line: LineRecord): void {
    if (!this.map) return

    const lineColors = LINE_COLORS[this.currentTheme]
    const dashArray = line.options?.dashed ? [2, 2] : undefined

    this.map.addSource(line.id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [line.from.lng, line.from.lat],
            [line.to.lng, line.to.lat],
          ],
        },
      },
    })

    this.map.addLayer({
      id: `${line.id}-outline`,
      type: 'line',
      source: line.id,
      layout: { 'line-cap': 'round' },
      paint: {
        'line-color': lineColors.outline,
        'line-width': 6,
        'line-opacity': 1,
        ...(dashArray && { 'line-dasharray': dashArray }),
      },
    })

    this.map.addLayer({
      id: `${line.id}-foreground`,
      type: 'line',
      source: line.id,
      layout: { 'line-cap': 'round' },
      paint: {
        'line-color': line.options?.color ?? lineColors.foreground,
        'line-width': 2,
        'line-opacity': 1,
        ...(dashArray && { 'line-dasharray': dashArray }),
      },
    })
  }

  private reAddLineLayers(): void {
    if (!this.map) return
    for (const line of this.lines.values()) {
      this.addLineToMap(line)
    }
  }
}
