import { MapillaryViewer } from './MapillaryViewer'
import { GoogleStreetViewViewer } from './GoogleStreetViewViewer'

interface SceneViewerProps {
  provider: 'mapillary' | 'google'
  // Mapillary props
  imageId?: string
  mapillaryToken?: string
  // Google props
  gameId?: string
  lat?: number
  lng?: number
  googleApiKey?: string
  // Common
  interactive?: boolean
}

export function SceneViewer(props: SceneViewerProps) {
  if (props.provider === 'google' && props.googleApiKey && props.lat != null && props.lng != null && props.gameId) {
    return (
      <GoogleStreetViewViewer
        gameId={props.gameId}
        lat={props.lat}
        lng={props.lng}
        apiKey={props.googleApiKey}
        interactive={props.interactive}
      />
    )
  }

  if (props.provider === 'mapillary' && props.imageId && props.mapillaryToken) {
    return (
      <MapillaryViewer
        imageId={props.imageId}
        accessToken={props.mapillaryToken}
        interactive={props.interactive}
      />
    )
  }

  return (
    <div className="scene-viewer scene-viewer-placeholder">
      <p>No scene provider configured</p>
      <p className="scene-viewer-hint">Set SCENE_PROVIDER in .env</p>
    </div>
  )
}
