import { useEffect, useRef, useCallback, useState } from 'react'
import { LeafletMapAdapter } from '../adapters/LeafletMapAdapter'
import type { MapAdapter } from '../adapters/MapAdapter'
import type { LatLng } from '../types'
import 'leaflet/dist/leaflet.css'

interface GameMapProps {
  onLocationSelect?: (location: LatLng) => void
  selectedLocation?: LatLng | null
  disabled?: boolean
  theme?: 'dark' | 'light'
  resultMarkers?: { guess: LatLng; actual: LatLng }
}

const DEFAULT_CONFIG = {
  center: { lat: 30, lng: 0 },
  zoom: 2,
  minZoom: 2,
  maxZoom: 18,
}

export function GameMap({ onLocationSelect, selectedLocation, disabled, theme = 'dark', resultMarkers }: GameMapProps) {
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

    // Place guess marker (gold)
    adapter.placeMarker(resultMarkers.guess, {
      color: '#D4A017',
      label: 'Your guess',
    })

    // Place actual marker (green)
    adapter.placeMarker(resultMarkers.actual, {
      color: '#2d8a4e',
      label: 'Actual location',
    })

    // Draw dashed line between them
    adapter.drawLine(resultMarkers.guess, resultMarkers.actual, {
      color: 'rgba(255, 255, 255, 0.4)',
      dashed: true,
    })

    // Fit bounds to show both markers
    adapter.fitBounds([resultMarkers.guess, resultMarkers.actual])
  }, [resultMarkers])

  return (
    <div className="game-map-container">
      <div
        ref={containerRef}
        className="game-map"
        style={{ width: '100%', height: '100%' }}
      />
      {coords && !resultMarkers && (
        <div className="game-map-coords">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </div>
      )}
    </div>
  )
}
