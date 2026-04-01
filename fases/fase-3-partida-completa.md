# Fase 3 — Partida Completa y Game Feel

## Objetivo

Pasar de "1 ronda suelta" a "sesión de juego completa" con múltiples rondas, narrativa envolvente y feedback que enganche. Esta fase convierte el prototipo en algo que se siente como un juego.

## Entregable

- Partida de 5 rondas con score acumulado
- Narrativa detective por partida (caso con intro y cierre)
- Pantalla de resumen final
- Feedback visual y sonoro satisfactorio
- Selector de dificultad

## Dependencias

- Fase 2 completada

## Tareas

### Sesión multi-ronda
- [x] Estado de sesión en servidor:
  ```typescript
  interface GameSession {
    id: string
    difficulty: Difficulty
    currentRound: number       // 0-4
    locations: PoolEntry[]     // 5 ubicaciones pre-seleccionadas
    roundResults: SessionRoundResult[]
    energy: number             // Energía compartida entre rondas
    maxEnergy: number
  }
  ```
- [x] Endpoint `POST /api/session/new` → crea sesión con 5 ubicaciones pre-generadas
- [x] Endpoint `POST /api/session/:id/guess` → procesa guess de la ronda actual
- [x] Endpoint `POST /api/session/:id/next` → avanza a la siguiente ronda
- [x] Endpoint `GET /api/session/:id/summary` → resumen final de la sesión
- [x] Pre-generar las 5 ubicaciones al crear sesión (evita latencia entre rondas)
- [x] Transición entre rondas: resultado → siguiente escena
- [x] Energía compartida entre rondas (no se resetea por ronda)

### Narrativa por caso
- [x] 3 variantes de intro narrativa en traducciones (EN/ES):
  - "Soplo anónimo a las 0300 horas..."
  - "Inteligencia interceptó transmisión codificada..."
  - "Agente de campo desapareció..."
- [x] Cada sesión tiene un "caso" con número incremental y narrativa aleatoria
- [x] Pantalla de briefing con intro del caso antes de cada ronda
- [x] El tono es siempre detective noir, breve, no intrusivo
- [x] Texto de conclusión diferenciado por rendimiento (bueno/medio/malo) con 3 tiers en EN/ES

### Pantalla de lobby / inicio
- [x] Selector de dificultad (Fácil / Media / Difícil) con detalle de energía y tiempo por nivel
- [x] Breve explicación de cada dificultad (ej. "10 energy, 60s/round")
- [x] Botón "Nuevo caso" que inicia sesión
- [x] Diseño minimalista, temática noir

### Pantalla de resumen final
- [x] Mapa con los 5 puntos (guess vs real) en mapa interactivo
- [x] Tabla con score por ronda con indicador de color por precisión
- [x] Score total prominente con color accent
- [x] Dots de rendimiento por ronda (verde/amarillo/rojo según distancia)
- [x] Botón "Jugar otro caso"
- [x] Botón "Compartir resultado" (genera texto copiable tipo Wordle):
  ```
  Map Noir — Case #42 (Medium)
  🟩🟨🟩🟩🟥
  Score: 15,230 / 25,000
  mapnoir.com
  ```

### Game feel y UI polish
- [x] Transiciones suaves entre estados con CSS transitions
- [x] Animación al revelar ubicación real (pin drop + línea fade-in)
- [x] Animación del score sumándose (counter roll-up con ease-out cúbico)
- [x] Colores del marcador según precisión:
  - Verde: < 200km
  - Amarillo: 200-1000km
  - Rojo: > 1000km
- [x] Sonidos: guess-submit, result-good/bad, timer-tick, session-complete (con toggle mute y localStorage)
- [x] Responsive: breakpoints 640px/1024px, layout vertical en móvil (escena arriba, mapa abajo)

### Pre-generación de escenas
- [x] Scripts batch `generatePool.ts` y `feedPool.ts` que pre-validan ubicaciones:
  1. Genera coordenadas random con selección ponderada por cobertura Mapillary
  2. Verifica que Mapillary tiene imagen cercana
  3. Guarda incrementalmente en `location-pool.json`
- [x] Pool actual: ~2150 ubicaciones pre-validadas (supera el mínimo de 200)
- [x] El endpoint `POST /api/session/new` toma del pool (sin latencia en runtime)
- [x] Sistema de review para aprobar/rechazar ubicaciones del pool (ReviewService + ReviewController + UI)

## Decisiones técnicas

### Pre-generación vs on-the-fly

| | Pros | Contras |
|---|---|---|
| **Pre-generación batch** | Sin latencia, sin fallos en runtime, UX fluida | Necesita script de mantenimiento, pool puede agotarse |
| **On-the-fly** | Siempre fresco, sin pool | Latencia, fallos posibles, mala UX |

**Recomendación**: Pre-generación. Ejecutar el script diariamente o semanalmente. Pool de 500-1000 ubicaciones validadas es suficiente para MVP.

### Compartir resultado: imagen vs texto

| | Pros | Contras |
|---|---|---|
| **Texto copiable (estilo Wordle)** | Zero coste, funciona en todas partes, viral en Twitter/WhatsApp | Menos visual |
| **Imagen generada (canvas/server)** | Más atractivo visualmente | Más complejo, coste de generación |

**Recomendación**: Texto copiable para MVP. Es lo que hizo viral a Wordle. Imagen para post-MVP.

### Responsive: mobile-first vs desktop-first

| | Pros | Contras |
|---|---|---|
| **Mobile-first** | Mayor audiencia potencial (casual gaming es móvil) | Mapa pequeño, difícil de marcar con precisión |
| **Desktop-first** | Mejor UX para el mapa, más cómodo | Menos accesible en móvil |

**Recomendación**: Desktop-first con responsive básico. El mapa + escena necesitan espacio. En móvil, usar layout vertical (escena arriba, mapa abajo) con zoom generoso.

## Riesgos

- **Pool agotado**: Si el pool de ubicaciones validadas se agota, el juego no puede generar nuevas partidas. Monitorear tamaño del pool y ejecutar batch regularmente.
- **Repetición**: Con 500 ubicaciones, jugadores frecuentes verán repetidas. Aceptable para MVP. En post-MVP, expandir pool o añadir generación LLM.
- **Mobile UX**: Marcar con precisión en un mapa móvil es difícil. Considerar zoom automático o marcado en dos pasos (zoom a región → marcar punto).

## Criterio de "done"

- [x] Partida completa de 5 rondas jugable sin interrupciones
- [x] Narrativa detective visible en intro y cada ronda
- [x] Resumen final con mapa, scores y texto compartible
- [x] Selector de dificultad funcional
- [x] Pool de al menos 200 ubicaciones pre-validadas (~2150 actualmente)
- [x] Jugable en desktop y aceptable en móvil
- [x] Transiciones fluidas, sin pantallas en blanco
