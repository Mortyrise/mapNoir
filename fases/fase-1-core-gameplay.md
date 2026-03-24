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
- [ ] Crear `ImageProviderAdapter` interface:
  ```typescript
  interface ImageProviderAdapter {
    getSceneAtLocation(lat: number, lng: number, radius?: number): Promise<Scene | null>
    getViewerComponent(): React.ComponentType<SceneViewerProps>
  }
  ```
- [ ] Implementar `MapillaryAdapter`:
  - Usar [Mapillary JS](https://mapillary.github.io/mapillary-js/) para el visor
  - Buscar imágenes cercanas a coordenadas dadas vía API v4
  - Manejar el caso "no hay imagen disponible" con fallback
- [ ] Componente `<SceneViewer />` que usa el adapter
- [ ] Bloquear movimiento en el visor (el jugador NO puede moverse aún, eso será un recurso)

### Generación de ubicación
- [ ] Endpoint `GET /api/game/new`:
  1. Seleccionar país random del dataset
  2. Generar coordenadas aleatorias dentro de bounding box del país
  3. Buscar imagen Mapillary cercana (radio progresivo: 1km → 5km → 20km)
  4. Si no hay imagen → reintentar con otro país
  5. Devolver: `{ sceneId, imageKey }` (NO las coordenadas reales)
- [ ] Las coordenadas reales se guardan en servidor, nunca se envían al cliente hasta que adivine
- [ ] Crear bounding boxes básicos por país en el dataset

### Marcado en mapa
- [ ] Click en mapa coloca un marcador (solo uno, reposicionable)
- [ ] Botón "Confirmar ubicación" (deshabilitado hasta colocar marcador)
- [ ] Animación mínima al confirmar

### Cálculo de score
- [ ] Endpoint `POST /api/game/guess`:
  - Recibe: `{ gameId, lat, lng }`
  - Calcula distancia con fórmula Haversine
  - Calcula score (propuesta):
    ```
    score = max(0, 5000 - distancia_km * factor)

    factor por dificultad:
    - Fácil: 1 (5000km para 0 puntos)
    - Media: 2 (2500km para 0 puntos)
    - Difícil: 5 (1000km para 0 puntos)
    ```
  - Devuelve: `{ score, distance_km, actual_lat, actual_lng }`

### Pantalla de resultado
- [ ] Mostrar ambos puntos en el mapa (marcador jugador + ubicación real)
- [ ] Línea visual entre ambos puntos
- [ ] Mostrar distancia en km y score
- [ ] Botón "Jugar otra vez"

## Decisiones técnicas

### Mapillary: API v4 vs scraping

| | Pros | Contras |
|---|---|---|
| **API v4 oficial** | Estable, legal, buena documentación | Necesita token (gratis), rate limits |
| **Scraping** | Sin límites | Ilegal, inestable, pueden banearte |

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

- [ ] Se puede jugar una partida completa: ver imagen → marcar → ver resultado
- [ ] El score se calcula correctamente
- [ ] Las coordenadas reales NO son visibles en el cliente hasta confirmar
- [ ] Funciona con al menos 10 países diferentes
- [ ] La imagen se carga en menos de 5 segundos
