import { useEffect, useRef, useState } from 'react'
import { Viewer } from 'mapillary-js'
import 'mapillary-js/dist/mapillary.css'

interface MapillaryViewerProps {
  imageId: string
  accessToken: string
  interactive?: boolean  // false = locked (no movement), true = can move
}

export function MapillaryViewer({ imageId, accessToken, interactive = false }: MapillaryViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current || !imageId || imageId === 'placeholder') return

    setIsLoading(true)

    const viewer = new Viewer({
      accessToken,
      container: containerRef.current,
      imageId,
      component: {
        cover: false,
        direction: !interactive,  // hide direction arrows if not interactive
        sequence: false,          // hide sequence navigation
        zoom: true,
      },
    })

    viewer.on('image', () => {
      setIsLoading(false)
    })

    viewerRef.current = viewer

    return () => {
      viewer.remove()
      viewerRef.current = null
    }
  }, [imageId, accessToken, interactive])

  // Show placeholder if no image
  if (!imageId || imageId === 'placeholder') {
    return (
      <div className="scene-viewer scene-viewer-placeholder">
        <p>No street-level imagery available</p>
        <p className="scene-viewer-hint">Set MAPILLARY_TOKEN in server .env</p>
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
