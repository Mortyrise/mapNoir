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
- [ ] Estado de sesión en servidor:
  ```typescript
  interface GameSession {
    id: string
    difficulty: Difficulty
    rounds: RoundState[]       // Array de 5 rondas
    currentRound: number       // 0-4
    totalScore: number
    narrative: CaseNarrative
  }
  ```
- [ ] Endpoint `POST /api/session/new` → crea sesión con 5 ubicaciones pre-generadas
- [ ] Endpoint `GET /api/session/:id/round` → devuelve ronda actual
- [ ] Endpoint `POST /api/session/:id/guess` → procesa guess, avanza ronda
- [ ] Pre-generar las 5 ubicaciones al crear sesión (evita latencia entre rondas)
- [ ] Transición entre rondas: resultado → breve pausa → siguiente escena

### Narrativa por caso
- [ ] Pool de templates narrativos:
  ```json
  {
    "templates": [
      {
        "intro": "Caso #{{caseNumber}}: Un informante desapareció tras enviar estas coordenadas parciales. Reconstruye su ruta.",
        "roundPrefix": "Última señal detectada en un punto desconocido. {{initialClue}}",
        "conclusion_good": "Excelente trabajo, detective. El caso se cierra con {{score}} puntos.",
        "conclusion_bad": "El caso se enfría. Puntuación: {{score}}."
      }
    ]
  }
  ```
- [ ] Cada sesión tiene un "caso" con número y narrativa
- [ ] Cada ronda tiene un breve texto introductorio contextual
- [ ] El tono es siempre detective noir, breve, no intrusivo

### Pantalla de lobby / inicio
- [ ] Selector de dificultad (Fácil / Media / Difícil)
- [ ] Breve explicación de cada dificultad
- [ ] Botón "Nuevo caso" que inicia sesión
- [ ] Diseño minimalista, temática noir (oscuro, tipografía serif para títulos)

### Pantalla de resumen final
- [ ] Mapa con los 5 puntos (guess vs real) conectados por líneas
- [ ] Tabla con score por ronda
- [ ] Score total prominente
- [ ] Botón "Jugar otro caso"
- [ ] Botón "Compartir resultado" (genera texto copiable tipo Wordle):
  ```
  Map Noir — Caso #42
  Dificultad: Media
  🔴🟡🟢🟢🔴
  Score: 15,230 / 25,000
  mapnoir.com
  ```

### Game feel y UI polish
- [ ] Transiciones suaves entre estados (escena → resultado → siguiente)
- [ ] Animación al revelar ubicación real (pin drop + línea que se dibuja)
- [ ] Animación del score sumándose (counter roll-up)
- [ ] Colores del marcador según precisión:
  - Verde: < 50km
  - Amarillo: 50-500km
  - Rojo: > 500km
- [ ] Sonido sutil al confirmar guess (opcional, toggle en settings)
- [ ] Responsive: jugable en móvil (mapa y escena en stack vertical)

### Pre-generación de escenas
- [ ] Script batch que pre-valida ubicaciones:
  1. Genera coordenadas random
  2. Verifica que Mapillary tiene imagen cercana
  3. Guarda en `validated-locations.json`
- [ ] El endpoint `POST /api/session/new` toma de este pool (no genera en tiempo real)
- [ ] Esto elimina la latencia y los fallos de "no hay imagen"

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

- [ ] Partida completa de 5 rondas jugable sin interrupciones
- [ ] Narrativa detective visible en intro y cada ronda
- [ ] Resumen final con mapa, scores y texto compartible
- [ ] Selector de dificultad funcional
- [ ] Pool de al menos 200 ubicaciones pre-validadas
- [ ] Jugable en desktop y aceptable en móvil
- [ ] Transiciones fluidas, sin pantallas en blanco
