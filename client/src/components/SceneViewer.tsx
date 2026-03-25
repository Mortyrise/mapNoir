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
  t: (key: string) => string
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
        t={props.t}
      />
    )
  }

  return (
    <div className="scene-viewer scene-viewer-placeholder">
      <p>{props.t('scene.noProvider')}</p>
      <p className="scene-viewer-hint">{props.t('scene.hint')}</p>
    </div>
  )
}
