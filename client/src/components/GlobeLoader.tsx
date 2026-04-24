import { useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------
   Hand-simplified continent silhouettes — arrays of [lon, lat] points.
   Detailed enough to be recognizable once projected onto the sphere.
   ------------------------------------------------------------------ */
/* Hand-simplified outlines — lon, lat points walked along the coastline.
   Densified enough that great-circle interpolation reads as recognizable
   silhouettes at globe scale. Europe + Asia are a single polygon so the
   continent reads continuously instead of as two detached shapes. */
const CONTINENTS: Array<Array<[number, number]>> = [
  // ---- EURASIA (Europe + Asia as one continuous coast) ----
  [
    // Iberian atlantic / Gibraltar
    [-9, 37], [-9, 41], [-8, 43], [-3, 44],
    // French atlantic / Brittany / Channel
    [-1, 46], [-4, 48], [0, 49], [2, 51],
    // Low Countries / North Germany / Denmark
    [4, 52], [8, 54], [11, 54], [10, 57], [12, 57],
    // Scandinavia west coast up to North Cape
    [8, 60], [10, 64], [14, 68], [20, 70], [28, 71],
    // Kola / Barents sea / Kara sea
    [35, 69], [44, 68], [55, 70], [68, 72], [78, 73], [90, 74], [100, 77],
    // Taimyr / Lena / Kolyma / Chukotka
    [105, 76], [120, 74], [135, 72], [150, 71], [160, 69], [170, 67], [179, 66],
    // Bering / Kamchatka east side
    [175, 62], [165, 60], [160, 56],
    // Okhotsk / Sea of Japan
    [155, 52], [148, 48], [142, 46], [138, 44],
    // Primorye / Korea
    [132, 44], [130, 42], [129, 39], [127, 37], [126, 35], [127, 34],
    // China east coast
    [121, 31], [120, 27], [117, 24], [111, 21],
    // Indochina
    [108, 17], [108, 11], [104, 10], [104, 1],
    // Malay peninsula → Gulf of Thailand → Myanmar coast
    [100, 6], [98, 12], [97, 16], [94, 20], [92, 22],
    // Bengal / Indian east coast
    [89, 22], [85, 20], [81, 16], [80, 13], [77, 8],
    // Indian west coast
    [73, 11], [73, 18], [70, 21], [67, 24],
    // Iran / Persian Gulf north
    [62, 25], [58, 25], [56, 26],
    // Arabian peninsula east (Oman) → south (Yemen)
    [58, 23], [55, 20], [52, 17], [49, 14], [45, 13], [43, 13],
    // Red sea east coast / Sinai
    [41, 16], [39, 21], [37, 26], [35, 28], [34, 30], [32, 31],
    // Eastern Mediterranean / Levant / Anatolia south
    [34, 35], [36, 36], [32, 36], [30, 37], [27, 37],
    // Aegean / Greece / Balkans (simplified)
    [26, 38], [23, 38], [22, 40], [19, 42],
    // Adriatic east / Italy boot / Sicily
    [16, 42], [18, 40], [15, 38], [13, 38],
    // Tyrrhenian / Riviera / Iberian Mediterranean
    [11, 43], [8, 44], [4, 43], [0, 41],
    [-3, 37], [-6, 36], [-9, 37],
  ],

  // ---- AFRICA ----
  [
    [-17, 15],   // Dakar / Senegal
    [-17, 21], [-13, 27], [-9, 31],
    [-6, 35], [-3, 35],                  // Morocco N / Algeria coast
    [3, 36], [10, 37],                    // Tunisia
    [15, 32], [20, 31], [25, 31], [30, 31],
    [32, 30], [33, 28],                   // Egypt / Sinai base
    [36, 22],                              // Sudan Red Sea
    [43, 12],                              // Bab el Mandeb
    [49, 11], [51, 12], [51, 2],          // Horn of Africa
    [43, -3], [40, -6], [40, -13],        // Kenya / Tanzania
    [39, -17], [36, -22], [33, -26],      // Mozambique
    [28, -33], [22, -34], [18, -34],      // Cape
    [14, -25], [12, -18], [13, -10],      // Namibia / Angola
    [13, -5], [12, -1],                    // Gabon / Congo
    [9, 3], [7, 4],                        // Cameroon / Nigeria bight
    [3, 6], [-2, 5],                       // Ghana / Ivory Coast
    [-8, 4], [-12, 7], [-15, 12], [-17, 15],
  ],

  // ---- NORTH AMERICA ----
  [
    [-166, 66], [-164, 70], [-156, 71], [-148, 70], [-140, 70],
    [-128, 70], [-115, 72], [-100, 73], [-90, 72], [-82, 72],
    [-74, 69], [-66, 62],                 // Labrador / Hudson
    [-60, 55], [-55, 51], [-60, 46],      // Newfoundland
    [-67, 45], [-70, 42],                 // Maine / NY
    [-75, 39], [-77, 35], [-80, 32],      // Mid-Atlantic
    [-80, 25],                             // Florida tip
    [-83, 30], [-88, 30], [-94, 29], [-97, 27],
    [-98, 22], [-105, 20], [-110, 20],    // Mexico Pacific
    [-115, 24], [-118, 30], [-122, 38],
    [-124, 44], [-124, 48], [-130, 55],
    [-140, 59], [-150, 58], [-160, 56],
    [-166, 62], [-166, 66],
  ],

  // ---- SOUTH AMERICA ----
  [
    [-78, 12],                             // Caribbean coast
    [-70, 11], [-62, 10], [-55, 6], [-50, 2],
    [-48, -2], [-42, -6], [-37, -8],       // Brazil NE
    [-38, -16], [-40, -22], [-48, -28],    // Brazil SE
    [-55, -34], [-60, -39], [-65, -42],    // Argentina
    [-68, -46], [-72, -51], [-74, -54],    // Tierra del Fuego
    [-74, -50], [-73, -42],                // Chile south
    [-72, -32], [-73, -20], [-76, -14],    // Chile / Peru
    [-81, -6], [-80, 0],                   // Ecuador / Colombia Pacific
    [-78, 6], [-78, 12],
  ],

  // ---- AUSTRALIA ----
  [
    [114, -22], [122, -18], [128, -15], [132, -12],
    [137, -12], [142, -10], [146, -18],    // Gulf of Carpentaria → NE QLD
    [150, -22], [153, -27], [150, -34],
    [147, -38], [141, -38], [135, -34],
    [126, -32], [120, -33], [115, -32],
    [114, -25], [114, -22],
  ],

  // ---- GREAT BRITAIN ----
  [
    [-5, 50], [-2, 50], [1, 52], [2, 53],
    [0, 54], [-1, 55], [-3, 58], [-5, 58],
    [-6, 55], [-4, 54], [-5, 52], [-5, 50],
  ],
  // IRELAND
  [
    [-10, 52], [-6, 55], [-6, 54], [-7, 52], [-10, 52],
  ],

  // ---- JAPAN (main island chain, simplified) ----
  [
    [131, 32], [135, 34], [137, 35], [140, 36],
    [141, 39], [142, 41], [145, 44],
    [141, 45], [140, 41], [138, 37], [133, 33], [131, 32],
  ],

  // MADAGASCAR
  [
    [44, -12], [49, -13], [50, -18], [48, -23], [44, -25],
    [43, -21], [43, -16], [44, -12],
  ],

  // GREENLAND
  [
    [-55, 60], [-42, 60], [-28, 64], [-22, 70], [-20, 76],
    [-22, 82], [-40, 83], [-55, 80], [-60, 75], [-58, 66], [-55, 60],
  ],

  // INDONESIA (broad arc)
  [
    [95, 5], [104, 5], [109, -1], [116, -2],
    [124, -3], [132, -1], [140, -4],
    [130, -8], [120, -9], [110, -8], [105, -6], [100, -1], [95, 5],
  ],

  // NEW ZEALAND
  [
    [170, -34], [175, -37], [178, -39],
    [175, -42], [171, -45], [167, -47], [166, -44], [168, -41],
    [170, -34],
  ],

  // BORNEO
  [
    [109, 1], [115, 5], [119, 5], [118, 2], [116, -2],
    [111, -3], [109, 1],
  ],

  // ICELAND
  [
    [-24, 63], [-19, 63], [-14, 64], [-14, 66], [-19, 66], [-24, 65], [-24, 63],
  ],
]

interface CityRef { city: string; country: string; lat: number; lon: number }
const REAL_CITIES: CityRef[] = [
  { city: 'Paris',     country: 'FR', lat: 48.8566, lon: 2.3522 },
  { city: 'Tokyo',     country: 'JP', lat: 35.6762, lon: 139.6503 },
  { city: 'Río',       country: 'BR', lat: -22.9068, lon: -43.1729 },
  { city: 'Estambul',  country: 'TR', lat: 41.0082, lon: 28.9784 },
  { city: 'Marrakech', country: 'MA', lat: 31.6295, lon: -7.9811 },
  { city: 'Sídney',    country: 'AU', lat: -33.8688, lon: 151.2093 },
  { city: 'Lisboa',    country: 'PT', lat: 38.7223, lon: -9.1393 },
  { city: 'Bangkok',   country: 'TH', lat: 13.7563, lon: 100.5018 },
  { city: 'Nairobi',   country: 'KE', lat: -1.2921, lon: 36.8219 },
  { city: 'Ciudad de México', country: 'MX', lat: 19.4326, lon: -99.1332 },
  { city: 'El Cairo',  country: 'EG', lat: 30.0444, lon: 31.2357 },
  { city: 'Reikiavik', country: 'IS', lat: 64.1466, lon: -21.9426 },
]

function formatCoord(lat: number, lon: number) {
  const latStr = `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`
  const lonStr = `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`
  return `${latStr} / ${lonStr}`
}

/** Project lat/lon to (x, y, z) on screen after a Y-axis rotation. */
function project(latDeg: number, lonDeg: number, rotY: number, cx: number, cy: number, r: number) {
  const lat = (latDeg * Math.PI) / 180
  const lon = (lonDeg * Math.PI) / 180 + rotY
  const x = Math.cos(lat) * Math.sin(lon)
  const y = -Math.sin(lat)
  const z = Math.cos(lat) * Math.cos(lon)
  return { x: cx + x * r, y: cy + y * r, z }
}

interface GlobeLoaderProps {
  size?: number
  speed?: number
  accent?: string
  accent2?: string
  /** phase ≥ 2 hides N/E/S/W markers and city labels (compact/dock mode). */
  phase?: 1 | 2
}

export function GlobeLoader({
  size = 340,
  speed = 1,
  accent,
  accent2,
  phase = 1,
}: GlobeLoaderProps) {
  const [t, setT] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  // Read CSS variables so the loader follows the active palette.
  const resolvedAccent = accent ?? 'var(--accent, #6ab8a8)'
  const resolvedAccent2 = accent2 ?? 'var(--accent-2, #d97706)'
  const isCssVar = resolvedAccent.startsWith('var(')

  useEffect(() => {
    const loop = (now: number) => {
      if (startRef.current == null) startRef.current = now
      setT(((now - startRef.current) / 1000) * speed)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [speed])

  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.34
  const rotY = -t * 0.25

  // For SVG attributes we need a concrete color fallback when using CSS vars
  // (SVG stroke/fill don't accept var() cleanly in all browsers for gradients).
  const strokeColor = isCssVar ? '#6ab8a8' : resolvedAccent
  const pulseColor = resolvedAccent2.startsWith('var(') ? '#d97706' : resolvedAccent2

  const cities = REAL_CITIES.map((c) => {
    const p = project(c.lat, c.lon, rotY, cx, cy, radius)
    return { ...c, ...p }
  })
  const activeSignals = cities.filter((c) => c.z > 0.2).slice(0, 3)

  const gridId = `mn-grid-${size}`
  const clipId = `mn-clip-${size}`
  const shadeId = `mn-shade-${size}`

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Globe loader">
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={radius} />
        </clipPath>
        <pattern id={gridId} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.08" />
        </pattern>
        <radialGradient id={shadeId} cx="40%" cy="40%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.08" />
          <stop offset="70%" stopColor={strokeColor} stopOpacity="0.02" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      <rect width={size} height={size} fill={`url(#${gridId})`} />

      {phase < 2 && (
        <>
          {[[20, 20], [size - 20, 20], [20, size - 20], [size - 20, size - 20]].map(([x, y], i) => (
            <g key={i} opacity="0.35">
              <line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke={strokeColor} strokeWidth="0.6" />
              <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke={strokeColor} strokeWidth="0.6" />
            </g>
          ))}
        </>
      )}

      <circle cx={cx} cy={cy} r={radius} fill={`url(#${shadeId})`} />

      <g clipPath={`url(#${clipId})`}>
        {[-60, -30, 0, 30, 60].map((lat, i) => {
          const rad = (lat * Math.PI) / 180
          const r = Math.cos(rad) * radius
          const yOff = -Math.sin(rad) * radius
          return (
            <ellipse
              key={`lat-${i}`}
              cx={cx}
              cy={cy + yOff}
              rx={r}
              ry={r * 0.18}
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.4"
              opacity={lat === 0 ? 0.45 : 0.18}
            />
          )
        })}

        {[0, 30, 60, 90, 120, 150].map((lng, i) => {
          const effectiveLon = (lng * Math.PI) / 180 + rotY
          const rx = Math.abs(Math.sin(effectiveLon)) * radius
          const tilt = Math.abs(Math.cos(effectiveLon))
          return (
            <ellipse
              key={`lng-${i}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.3"
              opacity={0.1 + tilt * 0.18}
            />
          )
        })}

        {CONTINENTS.map((poly, pi) => {
          // Densify every segment by interpolating along the great-circle
          // between visible endpoints. Without this, large polygons like
          // Asia show jumps (Siberia "recalculating") because two adjacent
          // lon/lat points can be >30° apart and project straight across
          // the sphere instead of following its curvature.
          const projected = poly.map(([lon, lat]) => ({
            lat,
            lon,
            p: project(lat, lon, rotY, cx, cy, radius),
          }))

          // Build sub-paths of visible (z > 0) points, interpolating between
          // each pair so the stroke follows the sphere surface.
          const segs: Array<Array<{ x: number; y: number }>> = []
          let current: Array<{ x: number; y: number }> = []

          const STEPS = 6 // interpolation samples per original segment

          for (let i = 0; i < projected.length - 1; i++) {
            const a = projected[i]
            const b = projected[i + 1]

            for (let s = 0; s < STEPS; s++) {
              const t0 = s / STEPS
              const lat = a.lat + (b.lat - a.lat) * t0
              const lon = a.lon + (b.lon - a.lon) * t0
              const pp = project(lat, lon, rotY, cx, cy, radius)
              if (pp.z > 0) {
                current.push({ x: pp.x, y: pp.y })
              } else if (current.length > 0) {
                segs.push(current)
                current = []
              }
            }
          }
          if (current.length > 0) segs.push(current)

          const fullyVisible = segs.length === 1 && projected.every((pp) => pp.p.z > 0)

          return segs.map((seg, si) => {
            if (seg.length < 2) return null
            const d = seg
              .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
              .join(' ')
            // Only close + fill when the whole polygon is on the near side.
            // Partial arcs render as polylines so the fill never cuts across
            // the sphere.
            return (
              <path
                key={`c-${pi}-${si}`}
                d={fullyVisible ? d + ' Z' : d}
                fill={fullyVisible ? strokeColor : 'none'}
                fillOpacity={fullyVisible ? 0.12 : 0}
                stroke={strokeColor}
                strokeWidth="0.8"
                strokeOpacity="0.85"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )
          })
        })}
      </g>

      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={strokeColor} strokeWidth="0.8" opacity="0.7" />
      <circle cx={cx} cy={cy} r={radius + 5} fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.3" />

      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2 - Math.PI / 2
        const isMajor = i % 9 === 0
        const r1 = radius + 8
        const r2 = radius + (isMajor ? 16 : 12)
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * r1}
            y1={cy + Math.sin(a) * r1}
            x2={cx + Math.cos(a) * r2}
            y2={cy + Math.sin(a) * r2}
            stroke={strokeColor}
            strokeWidth={isMajor ? 1 : 0.5}
            opacity={isMajor ? 0.7 : 0.3}
          />
        )
      })}

      {phase < 2 && (
        <>
          {[
            { lbl: 'N', x: cx, y: cy - radius - 22, ax: 'middle' as const },
            { lbl: 'E', x: cx + radius + 22, y: cy + 3, ax: 'start' as const },
            { lbl: 'S', x: cx, y: cy + radius + 28, ax: 'middle' as const },
            { lbl: 'W', x: cx - radius - 22, y: cy + 3, ax: 'end' as const },
          ].map((m) => (
            <text
              key={m.lbl}
              x={m.x}
              y={m.y}
              fontFamily="JetBrains Mono, monospace"
              fontSize="9"
              fill={strokeColor}
              textAnchor={m.ax}
              opacity="0.6"
              letterSpacing="0.1em"
            >
              {m.lbl}
            </text>
          ))}
        </>
      )}

      {activeSignals.map((s, i) => {
        const pulse = 1 + Math.sin(t * 3 + i * 2) * 0.35
        const labelLeft = s.x > cx
        return (
          <g key={`sig-${i}`}>
            <circle cx={s.x} cy={s.y} r={6 * pulse} fill="none" stroke={pulseColor} strokeWidth="0.8" opacity={1 / pulse} />
            <circle cx={s.x} cy={s.y} r={4} fill="none" stroke={pulseColor} strokeWidth="0.6" opacity="0.7" />
            <circle cx={s.x} cy={s.y} r={2} fill={pulseColor} />
            {phase < 2 && (
              <g opacity={Math.min(1, (s.z - 0.2) * 2)}>
                <line
                  x1={s.x}
                  y1={s.y}
                  x2={labelLeft ? Math.max(s.x - 30, 10) : Math.min(s.x + 30, size - 10)}
                  y2={s.y}
                  stroke={strokeColor}
                  strokeWidth="0.4"
                  opacity="0.6"
                />
                <text
                  x={labelLeft ? s.x - 34 : s.x + 34}
                  y={s.y - 2}
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="7"
                  fill={strokeColor}
                  opacity="0.85"
                  textAnchor={labelLeft ? 'end' : 'start'}
                  letterSpacing="0.05em"
                >
                  {s.city.toUpperCase()} · {s.country}
                </text>
                <text
                  x={labelLeft ? s.x - 34 : s.x + 34}
                  y={s.y + 8}
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="6.5"
                  fill={strokeColor}
                  opacity="0.5"
                  textAnchor={labelLeft ? 'end' : 'start'}
                  letterSpacing="0.05em"
                >
                  {formatCoord(s.lat, s.lon)}
                </text>
              </g>
            )}
          </g>
        )
      })}

      <circle cx={cx} cy={cy} r="1.5" fill={strokeColor} opacity="0.6" />
    </svg>
  )
}
