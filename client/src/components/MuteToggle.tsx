interface MuteToggleProps {
  muted: boolean
  onToggle: () => void
}

export function MuteToggle({ muted, onToggle }: MuteToggleProps) {
  return (
    <button
      className="btn btn-ghost btn-sm mute-toggle"
      onClick={onToggle}
      aria-label={muted ? 'Unmute' : 'Mute'}
      title={muted ? 'Unmute' : 'Mute'}
    >
      <span aria-hidden="true">
        {muted ? '\u{1F507}' : '\u{1F509}'}
      </span>
    </button>
  )
}
