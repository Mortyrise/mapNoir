import { useEffect, useRef, useState } from 'react'
import { api } from '../services/api'

interface GoogleStreetViewViewerProps {
  gameId: string
  lat: number
  lng: number
  apiKey: string
  interactive?: boolean // false = no movement, true = can navigate
}

// Load Google Maps API script once
let googleMapsLoaded = false
let googleMapsPromise: Promise<void> | null = null

function loadGoogleMapsApi(apiKey: string): Promise<void> {
  if (googleMapsLoaded) return Promise.resolve()
  if (googleMapsPromise) return googleMapsPromise

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.onload = () => { googleMapsLoaded = true; resolve() }
    script.onerror = reject
    document.head.appendChild(script)
  })
  return googleMapsPromise
}

export function GoogleStreetViewViewer({ gameId, lat, lng, apiKey, interactive = false }: GoogleStreetViewViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let panorama: google.maps.StreetViewPanorama | null = null

    async function init() {
      try {
        await loadGoogleMapsApi(apiKey)

        const sv = new google.maps.StreetViewService()
        const response = await sv.getPanorama({
          location: { lat, lng },
          radius: 50000, // 50km search radius
          preference: google.maps.StreetViewPreference.NEAREST,
          source: google.maps.StreetViewSource.OUTDOOR,
        })

        if (!response.data.location?.latLng) {
          setError('No street view available for this location')
          setIsLoading(false)
          return
        }

        const panoLocation = response.data.location.latLng

        // Report actual panorama location to server for accurate scoring
        api.reportPanoLocation(gameId, panoLocation.lat(), panoLocation.lng()).catch(() => {})

        panorama = new google.maps.StreetViewPanorama(containerRef.current!, {
          pano: response.data.location.pano,
          disableDefaultUI: true,
          showRoadLabels: false,
          clickToGo: interactive,    // block movement if not interactive
          linksControl: interactive,
          zoomControl: true,
          panControl: true,
          addressControl: false,
          fullscreenControl: false,
          motionTracking: false,
          motionTrackingControl: false,
        })

        setIsLoading(false)
      } catch {
        setError('Failed to load street view')
        setIsLoading(false)
      }
    }

    init()

    return () => {
      // Google StreetViewPanorama doesn't have a destroy method
      // but it gets GC'd when the container is removed
      panorama = null
    }
  }, [gameId, lat, lng, apiKey, interactive])

  if (error) {
    return (
      <div className="scene-viewer scene-viewer-placeholder">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="scene-viewer">
      {isLoading && (
        <div className="scene-viewer-loading">
          <div className="loading-spinner" />
          <p>Loading scene...</p>
        </div>
      )}
      <div ref={containerRef} className="scene-viewer-container" />
    </div>
  )
}
