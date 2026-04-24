import type { SVGProps } from 'react'

export type IconName =
  | 'clue'
  | 'move'
  | 'bet'
  | 'time'
  | 'energy'
  | 'pin'
  | 'record'
  | 'arrow'
  | 'check'
  | 'x'
  | 'target'
  | 'sun'
  | 'moon'
  | 'mute'
  | 'sound'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'stroke'> {
  name: IconName
  size?: number
  stroke?: string
  weight?: number
}

export function Icon({
  name,
  size = 18,
  stroke = 'currentColor',
  weight = 1.3,
  ...rest
}: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke,
    strokeWidth: weight,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...rest,
  }

  switch (name) {
    case 'clue':
      return (
        <svg {...common}>
          <circle cx="8.5" cy="8.5" r="5" />
          <line x1="12.5" y1="12.5" x2="17" y2="17" />
          <circle cx="8.5" cy="8.5" r="1" fill={stroke} stroke="none" />
        </svg>
      )
    case 'move':
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7" />
          <path d="M10 5 L12 9 L10 8 L8 9 Z" fill={stroke} stroke="none" />
          <path d="M10 15 L8 11 L10 12 L12 11 Z" fill={stroke} stroke="none" />
        </svg>
      )
    case 'bet':
      return (
        <svg {...common}>
          <path d="M10 3 L10 17 M3 10 L17 10 M5 5 L15 15 M15 5 L5 15" />
        </svg>
      )
    case 'time':
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7" />
          <path d="M10 6 L10 10 L13 12" />
        </svg>
      )
    case 'energy':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="13" height="8" rx="0.5" />
          <line x1="17" y1="8" x2="17" y2="12" />
          <path d="M8 7 L7 10 L10 10 L9 13" />
        </svg>
      )
    case 'pin':
      return (
        <svg {...common}>
          <path d="M10 2 C6 2 4 5 4 8 C4 12 10 18 10 18 C10 18 16 12 16 8 C16 5 14 2 10 2 Z" />
          <circle cx="10" cy="8" r="2" />
        </svg>
      )
    case 'record':
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="5" fill={stroke} stroke="none" />
        </svg>
      )
    case 'arrow':
      return (
        <svg {...common}>
          <line x1="4" y1="10" x2="16" y2="10" />
          <polyline points="12,6 16,10 12,14" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <polyline points="4,10 8,14 16,6" />
        </svg>
      )
    case 'x':
      return (
        <svg {...common}>
          <line x1="5" y1="5" x2="15" y2="15" />
          <line x1="15" y1="5" x2="5" y2="15" />
        </svg>
      )
    case 'target':
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7" />
          <circle cx="10" cy="10" r="3" />
          <circle cx="10" cy="10" r="1" fill={stroke} stroke="none" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="3.5" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="10" y1="16" x2="10" y2="18" />
          <line x1="2" y1="10" x2="4" y2="10" />
          <line x1="16" y1="10" x2="18" y2="10" />
          <line x1="4.3" y1="4.3" x2="5.7" y2="5.7" />
          <line x1="14.3" y1="14.3" x2="15.7" y2="15.7" />
          <line x1="4.3" y1="15.7" x2="5.7" y2="14.3" />
          <line x1="14.3" y1="5.7" x2="15.7" y2="4.3" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...common}>
          <path d="M15.5 12.5 A6.5 6.5 0 1 1 7.5 4.5 A5 5 0 0 0 15.5 12.5 Z" />
        </svg>
      )
    case 'sound':
      return (
        <svg {...common}>
          <path d="M4 8 L7 8 L11 5 L11 15 L7 12 L4 12 Z" />
          <path d="M13 7 A4 4 0 0 1 13 13" />
          <path d="M15 5 A7 7 0 0 1 15 15" />
        </svg>
      )
    case 'mute':
      return (
        <svg {...common}>
          <path d="M4 8 L7 8 L11 5 L11 15 L7 12 L4 12 Z" />
          <line x1="14" y1="7" x2="18" y2="13" />
          <line x1="18" y1="7" x2="14" y2="13" />
        </svg>
      )
    default:
      return null
  }
}
