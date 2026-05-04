import { useEffect, useRef, useCallback, useState } from 'react'
import type { MapAdapter } from '../adapters/MapAdapter'
import type { LatLng } from '../types'

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
  // Tracks adapter readiness so dependent effects re-run after the lazy
  // import resolves. MapLibre + its CSS live in a separate chunk.
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || adapterRef.current) return
    let cancelled = false

    void (async () => {
      await import('maplibre-gl/dist/maplibre-gl.css')
      const { MapLibreMapAdapter } = await import('../adapters/MapLibreMapAdapter')
      if (cancelled || !containerRef.current) return
      const adapter = new MapLibreMapAdapter()
      adapter.initialize(containerRef.current, DEFAULT_CONFIG)
      adapterRef.current = adapter
      setMapReady(true)
    })()

    return () => {
      cancelled = true
      adapterRef.current?.destroy()
      adapterRef.current = null
      setMapReady(false)
    }
  }, [])

  useEffect(() => {
    if (!mapReady) return
    adapterRef.current?.setTheme(theme)
  }, [theme, mapReady])

  const handleMapClick = useCallback(
    (position: LatLng) => {
      if (disabled) return

      const adapter = adapterRef.current
      if (!adapter) return

      if (markerIdRef.current) {
        adapter.removeMarker(markerIdRef.current)
      }

      markerIdRef.current = adapter.placeMarker(position, {
        draggable: true,
      })

      setCoords(position)
      onLocationSelect?.(position)
    },
    [disabled, onLocationSelect]
  )

  useEffect(() => {
    if (!mapReady) return
    const adapter = adapterRef.current
    if (!adapter) return
    adapter.onMapClick(handleMapClick)
  }, [handleMapClick, mapReady])

  useEffect(() => {
    if (!mapReady) return
    if (!selectedLocation) return
    const adapter = adapterRef.current
    if (!adapter) return

    if (markerIdRef.current) {
      adapter.removeMarker(markerIdRef.current)
    }

    markerIdRef.current = adapter.placeMarker(selectedLocation)
    setCoords(selectedLocation)
  }, [selectedLocation, mapReady])

  useEffect(() => {
    if (!mapReady) return
    if (!resultMarkers) return
    const adapter = adapterRef.current
    if (!adapter) return

    adapter.clearMarkers()

    adapter.placeMarker(resultMarkers.guess, {
      color: '#d97706',
      label: 'Your guess',
    })

    adapter.placeMarker(resultMarkers.actual, {
      color: '#6ab8a8',
      label: 'Actual location',
    })

    adapter.drawLine(resultMarkers.guess, resultMarkers.actual, {
      dashed: true,
    })

    adapter.fitBounds([resultMarkers.guess, resultMarkers.actual])
  }, [resultMarkers, mapReady])

  useEffect(() => {
    if (!mapReady) return
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
  }, [multiResultMarkers, mapReady])

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
