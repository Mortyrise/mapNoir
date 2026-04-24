import { useEffect, useRef, useCallback, useState } from 'react'
import { LeafletMapAdapter } from '../adapters/LeafletMapAdapter'
import type { MapAdapter } from '../adapters/MapAdapter'
import type { LatLng } from '../types'
import 'leaflet/dist/leaflet.css'

interface MultiResultMarker {
  guess: LatLng
  actual: LatLng
  roundIndex: number
}

interface GameMapProps {
  onLocationSelect?: (location: LatLng) => void
  selectedLocation?: LatLng | null
  disabled?: boolean
  theme?: 'dark' | 'light'
  resultMarkers?: { guess: LatLng; actual: LatLng }
  multiResultMarkers?: MultiResultMarker[]
}

const DEFAULT_CONFIG = {
  center: { lat: 30, lng: 0 },
  zoom: 2,
  minZoom: 2,
  maxZoom: 18,
}

// Per-round guess colors (palette-adjacent to accent-2 orange family)
const ROUND_COLORS = ['#d97706', '#e89a3d', '#b85a1a', '#c9a84c', '#eca96d']

export function GameMap({ onLocationSelect, selectedLocation, disabled, theme = 'dark', resultMarkers, multiResultMarkers }: GameMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const adapterRef = useRef<MapAdapter | null>(null)
  const markerIdRef = useRef<string | null>(null)
  const [coords, setCoords] = useState<LatLng | null>(selectedLocation ?? null)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || adapterRef.current) return

    const adapter = new LeafletMapAdapter()
    adapter.initialize(containerRef.current, DEFAULT_CONFIG)
    adapterRef.current = adapter

    return () => {
      adapter.destroy()
      adapterRef.current = null
    }
  }, [])

  // Sync theme with map adapter
  useEffect(() => {
    adapterRef.current?.setTheme(theme)
  }, [theme])

  // Handle map clicks
  const handleMapClick = useCallback(
    (position: LatLng) => {
      if (disabled) return

      const adapter = adapterRef.current
      if (!adapter) return

      // Remove previous marker
      if (markerIdRef.current) {
        adapter.removeMarker(markerIdRef.current)
      }

      // Place new marker
      markerIdRef.current = adapter.placeMarker(position, {
        draggable: true,
      })

      setCoords(position)
      onLocationSelect?.(position)
    },
    [disabled, onLocationSelect]
  )

  // Register click handler
  useEffect(() => {
    const adapter = adapterRef.current
    if (!adapter) return
    adapter.onMapClick(handleMapClick)
  }, [handleMapClick])

  // Sync external selectedLocation changes
  useEffect(() => {
    if (!selectedLocation) return
    const adapter = adapterRef.current
    if (!adapter) return

    if (markerIdRef.current) {
      adapter.removeMarker(markerIdRef.current)
    }

    markerIdRef.current = adapter.placeMarker(selectedLocation)
    setCoords(selectedLocation)
  }, [selectedLocation])

  // Show result markers (guess + actual + line)
  useEffect(() => {
    if (!resultMarkers) return
    const adapter = adapterRef.current
    if (!adapter) return

    // Clear any existing markers
    adapter.clearMarkers()

    // Place guess marker (orange — accent-2 in the new palette)
    adapter.placeMarker(resultMarkers.guess, {
      color: '#d97706',
      label: 'Your guess',
    })

    // Place actual marker (teal accent — reveal)
    adapter.placeMarker(resultMarkers.actual, {
      color: '#6ab8a8',
      label: 'Actual location',
    })

    // Draw dashed line between them
    adapter.drawLine(resultMarkers.guess, resultMarkers.actual, {
      dashed: true,
    })

    // Fit bounds to show both markers
    adapter.fitBounds([resultMarkers.guess, resultMarkers.actual])
  }, [resultMarkers])

  // Show multiple result markers (final summary with all rounds)
  useEffect(() => {
    if (!multiResultMarkers || multiResultMarkers.length === 0) return
    const adapter = adapterRef.current
    if (!adapter) return

    adapter.clearMarkers()

    const allPoints: LatLng[] = []

    for (const { guess, actual, roundIndex } of multiResultMarkers) {
      const color = ROUND_COLORS[roundIndex % ROUND_COLORS.length]

      adapter.placeMarker(guess, { color, label: `Round ${roundIndex + 1}` })
      adapter.placeMarker(actual, { color: '#6ab8a8' })
      adapter.drawLine(guess, actual, { dashed: true })

      allPoints.push(guess, actual)
    }

    if (allPoints.length >= 2) {
      let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
      for (const p of allPoints) {
        if (p.lat < minLat) minLat = p.lat
        if (p.lat > maxLat) maxLat = p.lat
        if (p.lng < minLng) minLng = p.lng
        if (p.lng > maxLng) maxLng = p.lng
      }
      adapter.fitBounds([{ lat: minLat, lng: minLng }, { lat: maxLat, lng: maxLng }])
    }
  }, [multiResultMarkers])

  return (
    <div className="game-map-container">
      <div
        ref={containerRef}
        className="game-map"
        style={{ width: '100%', height: '100%' }}
      />
      {coords && !resultMarkers && !multiResultMarkers && (
        <div className="game-map-coords">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </div>
      )}
    </div>
  )
}
