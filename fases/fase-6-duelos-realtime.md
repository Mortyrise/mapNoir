# Fase 6 — Duelos en Tiempo Real

## Objetivo

Modo competitivo síncrono: dos jugadores juegan las mismas rondas simultáneamente, viendo el progreso del rival en tiempo real. Incluye matchmaking con jugadores random.

## Entregable

- Duelo en tiempo real contra amigo (via link)
- Matchmaking contra jugador random
- Ambos jugadores ven cuándo el rival confirma su guess (no la ubicación)
- Resultado comparativo al final de cada ronda

## Dependencias

- Fase 5 completada
- Auth funcional (ambos jugadores necesitan conexión persistente)

## Tareas

### WebSocket server
- [ ] Instalar y configurar `ws` o `socket.io`:
  ```typescript
  // Eventos del servidor
  interface ServerEvents {
    'duel:ready'        // Ambos jugadores conectados
    'round:start'       // Nueva ronda comienza (escena + pista)
    'opponent:guessed'  // El rival confirmó (sin revelar dónde)
    'round:result'      // Ambos confirmaron → resultado de la ronda
    'duel:result'       // 5 rondas completadas → resultado final
    'opponent:disconnected'
  }

  // Eventos del cliente
  interface ClientEvents {
    'duel:join'         // Unirse a sala
    'round:guess'       // Confirmar ubicación
  }
  ```
- [ ] Gestión de salas (rooms):
  - Cada duelo es una sala con 2 conexiones
  - Estado de sala en memoria (Map<duelId, DuelRoom>)
  - Timeout si un jugador no se conecta en 60s
  - Reconexión: si se cae y vuelve en 30s, se reincorpora

### Flujo de duelo con amigo
1. Jugador A crea duelo realtime → obtiene link
2. Jugador A entra en sala de espera (WebSocket conectado)
3. Jugador B abre link → se conecta a la sala
4. Servidor emite `duel:ready` → comienza ronda 1
5. Ambos ven la misma escena y pistas
6. Cuando uno confirma → el otro ve "Tu rival ha decidido"
7. Cuando ambos confirman → resultado de la ronda
8. Repetir 5 rondas
9. Resultado final comparativo

### Flujo de matchmaking random
- [ ] Cola de matchmaking:
  ```typescript
  interface MatchmakingQueue {
    waiting: Map<Difficulty, UserSocket[]>

    enqueue(user: UserSocket, difficulty: Difficulty): void
    tryMatch(difficulty: Difficulty): [UserSocket, UserSocket] | null
  }
  ```
- [ ] Jugador pulsa "Buscar rival" → entra en cola por dificultad
- [ ] Cuando hay 2 en la misma dificultad → crear duelo automáticamente
- [ ] UI de espera: "Buscando rival..." con animación
- [ ] Timeout de búsqueda: 30s → ofrecer jugar solo o cambiar dificultad
- [ ] Cancel: el jugador puede salir de la cola

### UI de duelo en tiempo real
- [ ] Layout dividido o indicador de rival:
  - **Opción A**: Pantalla dividida (tu juego | estado rival) — más complejo
  - **Opción B**: Tu pantalla normal + barra superior con estado del rival — más simple
- [ ] Barra de rival muestra:
  - Nombre/avatar
  - Indicador "Pensando..." / "Ha decidido"
  - Score acumulado del rival (visible solo entre rondas)
- [ ] Timer sincronizado desde servidor (no confiar en cliente)
- [ ] Auto-submit si se acaba el tiempo (como en single player)

### Manejo de desconexiones
- [ ] Si un jugador se desconecta:
  - Esperar 30s para reconexión
  - Si no vuelve → el otro gana por abandono
  - Score del abandonador = score actual (no se beneficia ni penaliza)
- [ ] Ping/pong para detectar conexiones muertas
- [ ] Estado del duelo persiste en DB (no solo en memoria):
  - Si el servidor se reinicia, los duelos activos se pierden (aceptable en MVP)

### Persistencia de resultados
- [ ] Los duelos realtime se guardan en la misma tabla `duels` con un campo `mode`:
  ```sql
  ALTER TABLE duels ADD COLUMN mode TEXT DEFAULT 'async';
  -- mode: 'async' | 'realtime' | 'daily'
  ```
- [ ] Resultados contribuyen al ranking global

## Decisiones técnicas

### ws vs socket.io

| | Pros | Contras |
|---|---|---|
| **ws (puro)** | Ligero (~0 dependencias), rápido, estándar | Sin reconnect automático, sin rooms, sin fallback |
| **socket.io** | Rooms built-in, reconnect automático, fallback a polling, namespaces | Más pesado (~200KB client), no es WebSocket estándar |

**Recomendación**: **socket.io** para MVP. Las rooms y la reconexión automática te ahorran mucho código. El tamaño extra es irrelevante para un juego.

### Estado de duelo: memoria vs Redis

| | Pros | Contras |
|---|---|---|
| **En memoria (Map)** | Zero config, ultra rápido | Se pierde si el servidor se reinicia, no escala a múltiples instancias |
| **Redis** | Persiste, compartible entre instancias | Otro servicio que instalar y mantener |
| **SQLite** | Ya lo tienes | Lento para updates frecuentes en tiempo real |

**Recomendación**: **En memoria** para MVP. Un solo proceso Node en tu VPS. Si pierdes duelos activos por restart, es aceptable. Redis cuando escales a múltiples instancias.

### UI del rival: pantalla dividida vs barra

| | Pros | Contras |
|---|---|---|
| **Pantalla dividida** | Más espectacular, tipo esport | Muy complejo, malo en móvil, requiere duplicar UI |
| **Barra superior** | Simple, mobile-friendly, no distrae | Menos "wow" |

**Recomendación**: **Barra superior**. Mucho menos código, funciona en móvil, y la tensión viene de saber que el rival está jugando, no de verle jugar.

## Riesgos

- **Complejidad**: Esta es la fase más compleja del MVP. WebSockets + estado sincronizado + manejo de errores es un salto grande. Considerar si es realmente necesario para validar el producto o si los duelos async son suficientes.
- **Concurrencia**: Dos eventos `round:guess` pueden llegar casi simultáneamente. Usar locks o procesamiento secuencial por sala.
- **VPS single instance**: Si tu VPS se cae, todos los duelos activos se pierden. Aceptable en MVP pero molesto para los jugadores.
- **Matchmaking con pocos usuarios**: Si solo hay 5 usuarios activos, la cola estará vacía la mayor parte del tiempo. Necesitas masa crítica. Considerar bots como fallback (post-MVP).

## Alternativa: diferir esta fase

Si la complejidad es excesiva para un dev solo, esta fase puede ser la última del MVP o incluso post-MVP. Los duelos async (fase 5) + reto diario ya cubren el componente social. El realtime es "nice to have".

**Señales para incluirla**: Los duelos async tienen buena tracción y los usuarios piden "jugar a la vez".
**Señales para diferirla**: Pocos usuarios, poca adopción de duelos async.

## Criterio de "done"

- [ ] Duelo realtime via link funciona: ambos juegan simultáneamente
- [ ] Matchmaking random funciona (al menos con 2 usuarios online)
- [ ] Se ve cuándo el rival confirma su guess
- [ ] Resultado comparativo al final
- [ ] Desconexiones manejadas (abandono = derrota)
- [ ] Resultados guardados en DB
