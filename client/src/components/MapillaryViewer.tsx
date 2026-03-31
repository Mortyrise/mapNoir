import { useEffect, useRef, useState } from 'react'
import { Viewer } from 'mapillary-js'
import 'mapillary-js/dist/mapillary.css'

interface MapillaryViewerProps {
  imageId: string
  accessToken: string
  interactive?: boolean  // false = locked (no movement), true = can move
  t: (key: string) => string
}

export function MapillaryViewer({ imageId, accessToken, interactive = false, t }: MapillaryViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Create viewer once
  useEffect(() => {
    if (!containerRef.current || !imageId || imageId === 'placeholder') return

    setIsLoading(true)

    const viewer = new Viewer({
      accessToken,
      container: containerRef.current,
      imageId,
      component: {
        cover: false,
        direction: interactive,
        sequence: false,
        zoom: true,
      },
    })

    viewer.on('image', () => {
      setIsLoading(false)
      viewer.setZoom(0)
      viewer.resize()
    })

    viewerRef.current = viewer

    return () => {
      viewer.remove()
      viewerRef.current = null
    }
    // Only create/destroy on mount/unmount or when token/interactive changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, interactive])

  // Navigate to new image without destroying the viewer
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !imageId || imageId === 'placeholder') return

    setIsLoading(true)
    viewer.moveTo(imageId).then(() => {
      setIsLoading(false)
      viewer.setZoom(0)
      viewer.resize()
    }).catch(() => {
      setIsLoading(false)
    })
  }, [imageId])

  // Resize viewer when container size changes
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const ro = new ResizeObserver(() => {
      viewer.resize()
    })

    if (containerRef.current) {
      ro.observe(containerRef.current)
    }

    return () => ro.disconnect()
  }, [])

  if (!imageId || imageId === 'placeholder') {
    return (
      <div className="scene-viewer scene-viewer-placeholder">
        <p>{t('scene.noImagery')}</p>
        <p className="scene-viewer-hint">{t('scene.hintToken')}</p>
      </div>
    )
  }

  return (
    <div className="scene-viewer">
      {isLoading && (
        <div className="scene-viewer-loading">
          <div className="loading-spinner" />
          <p>{t('scene.loading')}</p>
        </div>
      )}
      <div ref={containerRef} className="scene-viewer-container" />
    </div>
  )
}
