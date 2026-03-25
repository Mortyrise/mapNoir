# Fase 1 — Core Gameplay (Single Player)

## Objetivo

Tener el loop principal jugable: ver escena, deducir, marcar en mapa, ver resultado. Sin pistas, sin recursos, sin timer. Solo la mecánica base.

## Entregable

Una partida jugable de 1 ronda:
1. Se muestra una imagen panorámica (Mapillary)
2. El jugador marca un punto en el mapa
3. Se calcula y muestra el score por distancia
4. Feedback visual: línea entre punto marcado y punto real

## Dependencias

- Fase 0 completada

## Tareas

### Visor de escenas (Mapillary)
- [x] Crear `ImageProviderAdapter` interface
- [x] Implementar `MapillaryAdapter`:
  - Visor Mapillary JS integrado
  - Busca imágenes cercanas vía API v4
  - Maneja "no hay imagen" con fallback y mensaje de error
- [x] Componente `<SceneViewer />` que usa el adapter
- [x] Bloquear movimiento en el visor (se desbloquea como recurso)

### Generación de ubicación
- [x] Endpoint `POST /api/game/new`:
  - Selecciona ubicación del pool pre-validado (`location-pool.json`)
  - Devuelve: `{ gameId, imageId, provider, initialClue, energy, timeLimit, difficulty }`
  - Soporta parámetro de idioma para pistas
- [x] Las coordenadas reales se guardan en servidor, nunca se envían al cliente hasta guess
- [x] Pool de ubicaciones pre-validadas por país

### Marcado en mapa
- [x] Click en mapa coloca un marcador (solo uno, reposicionable)
- [x] Botón "Confirmar ubicación" (deshabilitado hasta colocar marcador)

### Cálculo de score
- [x] Endpoint `POST /api/game/guess`:
  - Recibe: `{ gameId, lat, lng }`
  - Calcula distancia con fórmula Haversine
  - Score: `base = max(0, 5000 - distancia_km * 2)` (factor fijo, dificultad afecta vía tiempo/energía)
  - Devuelve: `{ score, distanceKm, actualLocation, breakdown }`
- [x] Breakdown detallado con valores intermedios: `{ baseScore, cluePenalty, afterClues, timeBonus, afterTime, betMultiplier }`

### Pantalla de resultado
- [x] Mostrar ambos puntos en el mapa (guess en dorado + real en verde)
- [x] Línea visual dashed entre ambos puntos con doble trazo (outline + foreground) adaptado a tema claro/oscuro
- [x] Mostrar distancia en km y score final (sin /5000 engañoso)
- [x] Desglose en cascada mostrando deltas de puntos: base /5000, penalización pistas (-X pts), bonus tiempo (+X pts), multiplicador apuesta (+X pts)
- [x] Botón "Nuevo caso"

## Decisiones técnicas

### Mapillary: API v4 vs scraping

| | Pros | Contras |
|---|---|---|
| **API v4 oficial** | Estable, legal, buena documentación | Necesita token (gratis), rate limits |

**Recomendación**: API v4 sin duda. Es gratis y legal.

### Score: fórmula lineal vs logarítmica

| | Pros | Contras |
|---|---|---|
| **Lineal** (`5000 - dist * factor`) | Simple, predecible | Poco gratificante en rangos medios |
| **Logarítmica** (`5000 * e^(-dist/factor)`) | Premia mucho la precisión, más emocionante | Menos intuitiva |
| **GeoGuessr style** (escalonada) | Jugadores la conocen | Puede sentirse "copiado" |

**Recomendación**: Empezar con **lineal** por simplicidad. Iterar basándote en playtesting. Es un cambio de una línea.

### Seguridad: coordenadas reales

**Crítico**: Las coordenadas reales NUNCA deben llegar al cliente antes de confirmar el guess. Esto significa:
- El `gameId` es un token opaco (UUID)
- El servidor guarda el estado de la partida en memoria (o JSON)
- Solo tras `POST /api/game/guess` se revelan las coordenadas

Si el jugador inspecciona el network tab y ve las coordenadas, el juego se rompe.

## Riesgos

- **Cobertura Mapillary**: Muchos países tienen poca o nula cobertura. Necesitarás una lista de "países con buena cobertura" para el MVP. Europa, EEUU, Brasil, Japón, Australia tienen buena cobertura. África y Asia Central casi nada.
- **Latencia**: La búsqueda de imagen Mapillary puede ser lenta. Considerar pre-generar un pool de escenas válidas en batch.
- **Bounding boxes imprecisos**: Coordenadas random pueden caer en el mar o zonas sin carreteras. Filtrar por tierra firme.

## Criterio de "done"

- [x] Se puede jugar una partida completa: ver imagen → marcar → ver resultado
- [x] El score se calcula correctamente con desglose detallado
- [x] Las coordenadas reales NO son visibles en el cliente hasta confirmar
- [x] Funciona con 40 países diferentes
- [x] La imagen se carga correctamente desde Mapillary
