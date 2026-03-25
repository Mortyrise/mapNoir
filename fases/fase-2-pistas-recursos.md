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
- [x] Pistas en ficheros separados: `clues-es.json` y `clues-en.json`
- [x] 5 categorías por país: auditory, contextual, geopolitical, narrative, negative
- [x] 5 pistas por categoría por país = 25 pistas/país = 1000 pistas por idioma
- [x] 40 países cubiertos en ambos idiomas
- [x] Pistas NO deducibles de la imagen — priorizan lo no-visual:
  - **auditory**: Sonidos, volumen de conversaciones, música, llamada a la oración
  - **contextual**: Olores, sensación climática, atmósfera, humedad
  - **geopolitical**: Banderas parciales/ambiguas, moneda, idioma (humanizado)
  - **narrative**: Comportamientos, costumbres, horarios, experiencia gastronómica
  - **negative**: Lo que NO se observó (para descartar regiones)
- [x] Todas las pistas usan voz narrativa del informante ("Nuestro informante recuerda...", "El contacto nos dice...")

### Motor de generación de pistas
- [x] Servicio `ClueGenerator` implementado con selección por dificultad:
  - **Fácil**: Pista inicial de [auditory, geopolitical]. Comprables: contextual → narrative → negative
  - **Media**: Pista inicial de [contextual, geopolitical]. Comprables: auditory → narrative → negative
  - **Difícil**: Pista inicial de [narrative, negative]. Comprables: contextual → geopolitical → auditory
- [x] Selección aleatoria dentro de cada categoría sin repeticiones
- [x] Fallback si el país no tiene pistas en el pool
- [x] Endpoint `POST /api/game/new` incluye `initialClue` en la respuesta
- [x] Soporte de idioma (EN/ES) en la generación de pistas

### Sistema de energía
- [x] Estado de partida en servidor con: energy, movementUnlocked, hasBet, cluesRevealed, startTime, timeLimit
- [x] Endpoint `POST /api/game/:id/action`:
  - `{ action: "move" }` → desbloquea movimiento en visor, -1 energía
  - `{ action: "clue" }` → devuelve siguiente pista, -1 energía
  - `{ action: "bet" }` → activa multiplicador x2, -1 energía
  - Valida energía suficiente y acciones no duplicadas (move/bet solo una vez)

### Sistema de tiempo
- [x] Timer visible en UI (countdown) con componente `<Timer />`
- [x] Timer controlado por servidor (startTime registrado al iniciar partida)
- [x] Timer empieza al entrar en juego (tras briefing)
- [x] Auto-submit configurable cuando se acaba el tiempo

### UI de recursos
- [x] Componente `<ResourceBar />` con barra de energía visual (pips)
- [x] Botones de acción: Move, Clue, Bet — con estados y tooltips traducidos
- [x] Botones deshabilitados cuando no hay energía o acción ya usada

### Panel de pistas
- [x] Componente `<CluePanel />` con pista inicial visible al empezar
- [x] Pistas compradas aparecen en el panel con estilo narrativo/detective
- [x] Pantalla de briefing antes de empezar la ronda con detalles del caso

### Ajuste de score
- [x] Fórmula implementada:
  ```
  base_score = max(0, 5000 - distancia_km * 2)
  clue_penalty = cluesRevealed * 0.15
  time_bonus = timeRemaining / timeLimit (effective: * 0.2, max +20%)
  bet_multiplier = hasBet ? 2 : 1
  final_score = round(base * (1 - clue_penalty) * (1 + timeBonus * 0.2) * betMultiplier)
  ```
- [x] Score siempre calculado en servidor
- [x] Servidor envía valores intermedios (afterClues, afterTime) para desglose exacto sin errores de redondeo
- [x] Cliente muestra desglose con deltas de puntos (no acumulados): base /5000, penalización, bonus, apuesta

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

- [x] Al empezar partida se ve 1 pista narrativa con voz del informante
- [x] Se puede comprar hasta 3 pistas adicionales con energía
- [x] Se puede desbloquear movimiento con energía
- [x] Se puede apostar x2
- [x] Timer visible y funcional
- [x] Score final refleja uso de pistas, tiempo y apuesta con desglose claro
- [x] No se puede actuar sin energía suficiente
