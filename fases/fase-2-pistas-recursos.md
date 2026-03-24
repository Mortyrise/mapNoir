# Fase 2 — Sistema de Pistas y Recursos

## Objetivo

Convertir el juego de "adivinar a ciegas" a "deducir con información incompleta". Añadir las mecánicas que diferencian Map Noir de un GeoGuessr básico: pistas narrativas, energía y tiempo.

## Entregable

Partida con:
- 1 pista inicial visible al empezar
- Sistema de energía (2-4 acciones)
- Timer (30-60s)
- Poder pedir pistas adicionales (gasta energía, penaliza score)
- Poder moverse en la escena (gasta energía)
- Poder apostar (x2 score, gasta energía)

## Dependencias

- Fase 1 completada
- `countries.json` con pool de pistas por país

## Tareas

### Base de datos de pistas
- [ ] Ampliar `countries.json` con pools de pistas por tipo:
  ```json
  {
    "ES": {
      "clues": {
        "auditory": [
          "Un testigo afirma haber escuchado español",
          "Se oían conversaciones en un idioma romance"
        ],
        "contextual": [
          "La zona parece turística y mediterránea",
          "Se observaron plantaciones de olivos en los alrededores"
        ],
        "geopolitical": [
          "Es un país miembro de la Unión Europea",
          "Conduce por la derecha"
        ],
        "narrative": [
          "El sospechoso podría haber cruzado la frontera con Francia o Portugal",
          "Las autoridades locales usan el euro"
        ],
        "negative": [
          "No es un país insular",
          "No está en el hemisferio sur"
        ]
      }
    }
  }
  ```
- [ ] Al menos 5 pistas por tipo por país (para los 30-50 países del MVP)
- [ ] Validar que las pistas NO son deducibles directamente de la imagen

### Motor de generación de pistas
- [ ] Servicio `ClueGenerator`:
  ```typescript
  interface ClueGenerator {
    generateCluesForLocation(
      country: CountryData,
      difficulty: Difficulty
    ): GeneratedClues

    // Retorna: {
    //   initial: Clue          // Gratis al empezar
    //   purchasable: Clue[]    // Comprables con energía
    // }
  }
  ```
- [ ] Lógica de selección por dificultad:
  - **Fácil**: Pista inicial fuerte (idioma, moneda). Pistas comprables también fuertes.
  - **Media**: Pista inicial contextual. Mix de comprables.
  - **Difícil**: Pista inicial narrativa/ambigua. Comprables también ambiguas.
- [ ] Evitar pistas contradictorias en la misma partida
- [ ] Endpoint `GET /api/game/new` ahora incluye `initialClue` en la respuesta

### Sistema de energía
- [ ] Estado de partida en servidor:
  ```typescript
  interface GameState {
    id: string
    sceneKey: string
    actualLocation: { lat: number, lng: number }
    country: string
    difficulty: Difficulty
    energy: number          // 2 (difícil) | 3 (media) | 4 (fácil)
    energyUsed: number
    cluesRevealed: number
    hasBet: boolean
    startTime: number
    timeLimit: number       // 30s (difícil) | 45s (media) | 60s (fácil)
  }
  ```
- [ ] Endpoint `POST /api/game/:id/action`:
  - `{ action: "move" }` → desbloquea movimiento en visor, -1 energía
  - `{ action: "clue" }` → devuelve siguiente pista, -1 energía
  - `{ action: "bet" }` → activa multiplicador x2, -1 energía
  - Validar energía suficiente, devolver error si no

### Sistema de tiempo
- [ ] Timer visible en UI (countdown)
- [ ] Timer controlado por servidor (no confiar en cliente):
  - `startTime` se registra en servidor al crear partida
  - `POST /api/game/guess` rechaza si `now - startTime > timeLimit`
- [ ] UI: timer cambia de color cuando queda poco tiempo (< 10s)
- [ ] Auto-submit cuando se acaba el tiempo (guess en la posición actual del marcador, o penalización máxima si no hay marcador)

### UI de recursos
- [ ] Barra de energía (iconos o barra visual)
- [ ] Botones de acción con coste visible:
  - "Moverse (1 energía)"
  - "Pedir pista (1 energía, -15% score)"
  - "Apostar x2 (1 energía)"
- [ ] Botones deshabilitados cuando no hay energía
- [ ] Feedback visual al usar energía (animación de consumo)

### Panel de pistas
- [ ] Pista inicial visible al empezar (estilo narrativo/detective)
- [ ] Pistas compradas aparecen en un panel lateral o inferior
- [ ] Formato narrativo: no "Idioma: español" sino "Un testigo afirma haber escuchado español"

### Ajuste de score
- [ ] Fórmula actualizada:
  ```
  base_score = max(0, 5000 - distancia_km * factor)

  // Modificadores
  clue_penalty = cluesRevealed * 0.15    // -15% por pista comprada
  time_bonus = timeRemaining / timeLimit  // 0-1, porcentaje de tiempo sobrante
  bet_multiplier = hasBet ? 2 : 1

  final_score = base_score * (1 - clue_penalty) * (1 + time_bonus * 0.2) * bet_multiplier
  ```
- [ ] El score siempre se calcula en servidor

## Decisiones técnicas

### Movimiento en Mapillary: desbloqueo vs siempre activo

| | Pros | Contras |
|---|---|---|
| **Bloqueado por defecto** (tu diseño) | Movimiento es recurso estratégico, más tensión | Más código, UX menos intuitiva |
| **Siempre activo, movimiento gratis** | Más sencillo, más parecido a GeoGuessr | Pierde diferenciación, menos decisiones |

**Recomendación**: Mantener tu diseño. El movimiento como recurso es la mecánica que diferencia Map Noir.

### Pistas: generación estática vs LLM

| | Pros | Contras |
|---|---|---|
| **Pool estático (JSON)** | Predecible, sin coste, sin latencia | Limitado, repetitivo con el tiempo |
| **LLM (GPT/Claude API)** | Infinita variedad, pistas más creativas | Coste por partida (~$0.01-0.05), latencia, puede generar pistas incorrectas |
| **Híbrido: pool + LLM para variación** | Mejor de ambos mundos | Complejidad |

**Recomendación para MVP**: Pool estático. La variedad no es crítica en MVP, y el coste de LLM escala con usuarios. Dejar la interface preparada para añadir LLM después.

### Dificultad: seleccionable vs progresiva

| | Pros | Contras |
|---|---|---|
| **Seleccionable** (fácil/media/difícil) | Jugador elige su nivel, más accesible | Menos progresión |
| **Progresiva** (empieza fácil, sube) | Sensación de reto creciente | Puede frustrar al principiante |

**Recomendación MVP**: Seleccionable. Más simple y permite testear qué dificultad prefiere la gente.

## Riesgos

- **Calidad de pistas**: Pistas demasiado fáciles o demasiado vagas rompen la experiencia. Necesitarás playtesting real para calibrar.
- **Timer como frustración**: Si las imágenes Mapillary tardan en cargar, el timer corre durante la carga. Considerar iniciar el timer solo cuando la imagen esté lista.
- **Abuso de inspect**: Un jugador técnico podría interceptar las pistas del servidor. No es crítico en MVP, pero las pistas compradas deberían entregarse solo bajo demanda, no precargadas.

## Criterio de "done"

- [ ] Al empezar partida se ve 1 pista narrativa
- [ ] Se puede comprar al menos 1 pista adicional con energía
- [ ] Se puede desbloquear movimiento con energía
- [ ] Se puede apostar x2
- [ ] Timer visible y funcional
- [ ] Score final refleja uso de pistas, tiempo y apuesta
- [ ] No se puede actuar sin energía suficiente
