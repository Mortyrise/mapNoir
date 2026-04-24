import { Icon } from './icons/Icon'

interface MuteToggleProps {
  muted: boolean
  onToggle: () => void
}

export function MuteToggle({ muted, onToggle }: MuteToggleProps) {
  return (
    <button
      type="button"
      className="mute-toggle"
      onClick={onToggle}
      aria-label={muted ? 'Unmute' : 'Mute'}
      title={muted ? 'Unmute' : 'Mute'}
    >
      <Icon name={muted ? 'mute' : 'sound'} size={16} stroke="currentColor" />
    </button>
  )
}
