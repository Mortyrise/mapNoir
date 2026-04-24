import { Icon } from './icons/Icon'
import type { Theme } from '../hooks/useTheme'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to paper mode' : 'Switch to noir mode'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={16} stroke="currentColor" />
    </button>
  )
}
