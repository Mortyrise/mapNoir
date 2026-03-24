# Fase 5 — Duelos Asíncronos y Reto Diario

## Objetivo

Primer modo social: un jugador crea un reto, lo comparte, y el otro juega las mismas escenas. Comparación de scores. También reto diario (mismo caso para todos).

## Entregable

- Crear duelo → obtener link compartible
- El retado juega las mismas 5 escenas
- Comparación de resultados
- Reto diario: mismo caso para todos los jugadores, 1 vez al día
- Compartir resultado del reto diario (viral)

## Dependencias

- Fase 4 completada (DB + auth necesarias)

## Tareas

### Modelo de datos para duelos
- [ ] Tabla de duelos:
  ```sql
  CREATE TABLE duels (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,       -- URL-friendly (ej: "abc123")
    creator_id TEXT REFERENCES users(id),
    challenger_id TEXT REFERENCES users(id),  -- NULL hasta que acepte
    locations JSON NOT NULL,          -- Las 5 ubicaciones fijas
    difficulty TEXT NOT NULL,
    creator_score INTEGER,
    challenger_score INTEGER,
    creator_rounds JSON,
    challenger_rounds JSON,
    status TEXT DEFAULT 'pending',    -- pending | completed
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP              -- 7 días de vida
  );
  ```

### Flujo de creación de duelo
- [ ] Endpoint `POST /api/duel/create`:
  1. Generar 5 ubicaciones del pool validado
  2. Crear registro en DB con status `pending`
  3. El creador juega las 5 rondas
  4. Guardar score del creador
  5. Devolver link: `mapnoir.com/duel/{slug}`
- [ ] Al terminar sus 5 rondas, el creador ve:
  - Su resultado
  - Link para compartir
  - Botón copiar link / compartir (Web Share API si disponible)

### Flujo del retado
- [ ] Endpoint `GET /api/duel/:slug`:
  - Devuelve: dificultad, estado, si el retado ya jugó
  - NO devuelve scores del creador (no spoilear)
- [ ] El retado juega las mismas 5 escenas (mismas ubicaciones y pistas)
- [ ] Endpoint `POST /api/duel/:slug/guess` (reutiliza lógica existente)
- [ ] Al terminar: comparación lado a lado

### Pantalla de comparación
- [ ] Mapa con puntos de ambos jugadores (colores diferentes)
- [ ] Tabla comparativa ronda a ronda:
  ```
  Ronda | Tú     | Rival
  1     | 3,200  | 4,100
  2     | 4,500  | 2,800
  ...
  Total | 15,230 | 14,900
  ```
- [ ] Indicador de ganador
- [ ] Botón "Revancha" (crea nuevo duelo invertido)

### Reto diario
- [ ] Tabla:
  ```sql
  CREATE TABLE daily_challenges (
    date DATE PRIMARY KEY,
    locations JSON NOT NULL,
    difficulty TEXT DEFAULT 'medium'
  );

  CREATE TABLE daily_results (
    date DATE REFERENCES daily_challenges(date),
    user_id TEXT REFERENCES users(id),
    total_score INTEGER NOT NULL,
    rounds_data JSON NOT NULL,
    played_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (date, user_id)
  );
  ```
- [ ] Cron job (o script manual) que genera el reto del día siguiente a medianoche:
  - Selecciona 5 ubicaciones del pool
  - Las marca como "usadas" para no repetir
- [ ] Endpoint `GET /api/daily`:
  - Devuelve reto del día
  - Si el usuario ya jugó hoy → devuelve su resultado
- [ ] Endpoint `GET /api/daily/leaderboard`:
  - Top scores del día
  - Solo visible después de jugar (anti-spoiler)

### UI del reto diario
- [ ] Sección prominente en pantalla de inicio: "Reto del día"
- [ ] Indicador si ya jugaste hoy
- [ ] Leaderboard diario tras jugar
- [ ] Texto compartible:
  ```
  Map Noir — Reto diario (24 Mar 2026)
  🟢🟢🟡🔴🟢
  Score: 18,430 / 25,000
  mapnoir.com/daily
  ```

### Expiración y limpieza
- [ ] Duelos expiran a los 7 días si no se completan
- [ ] Cron job o cleanup periódico que elimina duelos expirados
- [ ] Retos diarios se mantienen (historial)

## Decisiones técnicas

### Duelo: mismas pistas o diferentes?

| | Pros | Contras |
|---|---|---|
| **Mismas pistas** | Comparación 100% justa | Si uno comparte pistas, el otro tiene ventaja |
| **Mismas ubicaciones, pistas random** | Menos trampa compartiendo pistas | Comparación menos justa, uno puede tener pistas más fáciles |

**Recomendación**: **Mismas pistas**. La justicia es más importante. El riesgo de compartir pistas es bajo en MVP.

### Reto diario: timezone

| | Pros | Contras |
|---|---|---|
| **UTC fijo** | Simple, un solo reto global | Algunos jugadores lo ven "antes" (horario) |
| **Por timezone del jugador** | Más justo | Muchos retos diferentes, más complejo, trampas cambiando TZ |

**Recomendación**: **UTC fijo**. Como Wordle. Simple y funciona.

### Link de duelo: auth requerida?

| | Pros | Contras |
|---|---|---|
| **Auth requerida para ambos** | Scores se guardan, ranking funciona | Fricción: "mi amigo no tiene cuenta" |
| **Creador auth, retado anónimo** | Baja fricción | Score del retado no se guarda permanentemente |
| **Ambos anónimos permitidos** | Zero fricción | No se puede trackear, no contribuye a rankings |

**Recomendación**: **Creador con auth, retado puede jugar anónimo** pero se le sugiere login para guardar. Maximiza viralidad.

## Riesgos

- **Pool de ubicaciones**: Reto diario + duelos consumen ubicaciones del pool. Con 200 ubicaciones, los retos diarios solos duran 40 días (5 por día). Necesitas ampliar el pool o permitir reutilización.
- **Trampas en duelos**: Alguien podría jugar el duelo, ver las respuestas, y crear otra cuenta para "ganar". Para MVP es aceptable. Anti-cheat es post-MVP.
- **Compartir resultado**: La URL `mapnoir.com/daily` debe tener un buen og:image y meta tags para que se vea bien en WhatsApp/Twitter. Implementar meta tags dinámicos.

## Criterio de "done"

- [ ] Se puede crear un duelo y obtener link
- [ ] El link funciona: el retado juega las mismas escenas
- [ ] Comparación lado a lado al terminar ambos
- [ ] Reto diario funcional: mismo caso para todos
- [ ] Leaderboard diario visible post-partida
- [ ] Texto compartible copiable
- [ ] Duelos expiran correctamente
