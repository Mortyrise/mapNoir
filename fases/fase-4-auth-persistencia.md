# Fase 4 — Autenticación y Persistencia

## Objetivo

Introducir cuentas de usuario y base de datos real. El jugador puede jugar anónimo, pero necesita cuenta para guardar historial, ver rankings y participar en duelos. Esta fase es el **punto de inflexión** donde "build for change" se materializa: swap de JSON a DB real.

## Entregable

- Login con OAuth (Google) y/o email mágico
- Juego anónimo sigue funcionando
- Historial de partidas por usuario
- Ranking global básico
- Base de datos real (SQLite o PostgreSQL)

## Dependencias

- Fase 3 completada
- Dominio con HTTPS configurado (fase 0)

## Tareas

### Base de datos
- [ ] Elegir e instalar DB (ver decisión técnica abajo)
- [ ] Schema inicial:
  ```sql
  -- Usuarios
  CREATE TABLE users (
    id TEXT PRIMARY KEY,          -- UUID
    display_name TEXT NOT NULL,
    email TEXT UNIQUE,
    auth_provider TEXT,           -- 'google', 'email', 'anonymous'
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Sesiones de juego
  CREATE TABLE game_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),  -- NULL para anónimos
    difficulty TEXT NOT NULL,
    total_score INTEGER NOT NULL,
    rounds_data JSON NOT NULL,    -- Detalle de cada ronda
    played_at TIMESTAMP DEFAULT NOW()
  );

  -- Rankings (materializado para performance)
  CREATE TABLE rankings (
    user_id TEXT REFERENCES users(id),
    best_score INTEGER NOT NULL,
    total_games INTEGER NOT NULL,
    avg_score REAL NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id)
  );
  ```
- [ ] Implementar `PostgresGameRepository` (o `SqliteGameRepository`) que implemente la misma interface que `JsonGameRepository`
- [ ] Swap en la inyección de dependencias: cambiar una línea para activar la nueva implementación
- [ ] Migración: script para mover datos de JSON a DB (si hay datos que conservar)

### Autenticación
- [ ] Instalar Passport.js (Express middleware de auth)
- [ ] Implementar estrategia Google OAuth 2.0:
  - Crear app en Google Cloud Console
  - Configurar callback URL
  - Guardar usuario en DB al primer login
- [ ] Implementar "magic link" por email (alternativa sin contraseña):
  - Enviar link con token temporal al email
  - Click en link → sesión iniciada
  - Necesita servicio de email (ver decisión técnica)
- [ ] Sesión con JWT:
  - Token firmado almacenado en httpOnly cookie
  - Middleware que extrae usuario de JWT en cada request
  - Rutas protegidas vs rutas públicas
- [ ] Flujo anónimo:
  - Se puede jugar sin login
  - Al terminar partida: "Inicia sesión para guardar tu resultado"
  - Si hace login → vincular partida recién jugada a su cuenta

### UI de auth
- [ ] Modal de login (no página separada — no interrumpir el flujo)
- [ ] Botones: "Continuar con Google" / "Entrar con email"
- [ ] Avatar + nombre en header cuando está logueado
- [ ] Botón "Cerrar sesión"
- [ ] Prompt post-partida para anónimos: "Guarda tu score — inicia sesión"

### Historial de partidas
- [ ] Endpoint `GET /api/user/history`:
  - Lista de partidas con score, dificultad, fecha
  - Paginado (10 por página)
- [ ] Página `/history` con tabla de partidas anteriores
- [ ] Click en partida → ver resumen (mapa con puntos)

### Ranking global
- [ ] Endpoint `GET /api/rankings`:
  - Top 50 jugadores por best_score
  - Posición del jugador actual
- [ ] Página `/rankings` con leaderboard simple
- [ ] Actualización del ranking al completar partida

## Decisiones técnicas

### SQLite vs PostgreSQL

| | Pros | Contras |
|---|---|---|
| **SQLite** (better-sqlite3) | Zero config, un archivo, perfecto para VPS, sin servicio extra | No soporta conexiones concurrentes de escritura (1 writer), no tiene JSON functions ricas |
| **PostgreSQL** | Concurrencia real, JSON/JSONB nativo, full-text search, escalable | Necesita instalar y mantener servicio, más RAM |

**Para tu VPS con poco tráfico en MVP**: SQLite es suficiente. Un solo proceso Node = un solo writer = sin problemas de concurrencia. Si crece, migrar a Postgres es simple (misma interface de repository).

**Recomendación**: **SQLite** con `better-sqlite3` para MVP. Si el tráfico supera ~100 usuarios concurrentes, migrar a PostgreSQL.

### Auth: Passport.js vs solución propia vs servicio externo

| | Pros | Contras |
|---|---|---|
| **Passport.js** | Estándar de facto en Express, muchas estrategias | Algo verboso, middleware pattern |
| **Auth propio (JWT manual)** | Control total, mínimas dependencias | Más código, más fácil cometer errores de seguridad |
| **Auth0 / Clerk** | UX premium, seguridad auditada | Free tier limitado, dependencia externa, latencia |
| **Lucia Auth** | Moderno, type-safe, ligero | Menor comunidad |

**Recomendación**: **Passport.js + JWT**. Es lo estándar con Express, bien documentado, y tienes control total en tu VPS.

### Email para magic links

| | Pros | Contras |
|---|---|---|
| **Resend** | API moderna, free tier 100 emails/día | Dependencia externa |
| **Nodemailer + SMTP propio** | Sin dependencia | Config compleja, deliverability dudosa |
| **Solo Google OAuth (sin email)** | Zero coste, zero complejidad | Excluye usuarios sin Google |

**Recomendación para MVP**: **Solo Google OAuth**. Añadir magic links cuando haya demanda. Reduce complejidad enormemente.

### JWT: cookie vs localStorage

| | Pros | Contras |
|---|---|---|
| **httpOnly cookie** | Seguro contra XSS, automático en requests | Necesita CSRF protection, más config CORS |
| **localStorage** | Simple, funciona cross-domain | Vulnerable a XSS |

**Recomendación**: **httpOnly cookie**. La seguridad compensa la complejidad extra.

## Riesgos

- **Vincular partida anónima a cuenta**: El flujo "juega anónimo → login → se vincula" requiere almacenar temporalmente la partida (en memoria/session) hasta que haga login. Si cierra el navegador se pierde. Aceptable para MVP.
- **OAuth en VPS**: Necesitas HTTPS (ya configurado en fase 0) y callback URL correcta. Probar en staging antes.
- **SQLite backups**: Un archivo SQLite corrupto = pérdida total. Configurar backup diario con cron (`cp database.sqlite database.sqlite.bak`).

## Criterio de "done"

- [ ] Se puede jugar sin cuenta (anónimo)
- [ ] Login con Google OAuth funciona
- [ ] Tras login, las partidas se guardan en DB
- [ ] Página de historial muestra partidas anteriores
- [ ] Ranking global con top 50
- [ ] `JsonGameRepository` reemplazado por `SqliteGameRepository` sin cambios en lógica de negocio
- [ ] Backup de SQLite automatizado
