# Map Noir — Plan de Desarrollo MVP

## Stack elegido

| Capa | Tecnología | Coste |
|------|-----------|-------|
| Frontend | React + Vite + TypeScript | 0$ |
| Mapa | Leaflet + OpenStreetMap | 0$ |
| Escenas | Mapillary API v4 | 0$ |
| Backend | Node.js + Express + TypeScript | 0$ |
| DB (fases 0-3) | JSON files + localStorage | 0$ |
| DB (fase 4+) | SQLite (better-sqlite3) | 0$ |
| Geocoding | Nominatim (batch) | 0$ |
| Auth | Passport.js + Google OAuth + JWT | 0$ |
| Realtime | socket.io | 0$ |
| Analytics | Umami (self-hosted) | 0$ |
| Hosting | VPS propia + Nginx + PM2 + Let's Encrypt | Existente |

**Coste total: 0$/mes** (sobre VPS existente)

---

## Fases

### [Fase 0 — Fundación y Scaffolding](./fase-0-fundacion.md)
Estructura del proyecto, abstracciones (repository pattern, adapters), dataset de países, deploy en VPS.

### [Fase 1 — Core Gameplay](./fase-1-core-gameplay.md)
Loop básico jugable: ver escena Mapillary → marcar en mapa → ver score por distancia.

### [Fase 2 — Pistas y Recursos](./fase-2-pistas-recursos.md)
Sistema de pistas narrativas, energía, timer, apuesta. La mecánica que diferencia Map Noir.

### [Fase 3 — Partida Completa y Game Feel](./fase-3-partida-completa.md)
Sesión de 5 rondas, narrativa detective, resumen final, texto compartible, pre-generación batch.

### [Fase 4 — Auth y Persistencia](./fase-4-auth-persistencia.md)
Swap JSON → SQLite, Google OAuth, historial de partidas, ranking global. Punto de inflexión.

### [Fase 5 — Duelos Async y Reto Diario](./fase-5-duelos-async.md)
Primer modo social: duelos por link, reto diario global, leaderboard diario.

### [Fase 6 — Duelos en Tiempo Real](./fase-6-duelos-realtime.md) ⚠️ *Opcional para lanzamiento*
WebSockets, duelo simultáneo, matchmaking random. Fase más compleja — diferir si los duelos async validan.

### [Fase 7 — Polish y Lanzamiento](./fase-7-polish-launch.md)
Landing page, SEO, analytics, QA, preparación para Product Hunt / Reddit.

---

## Orden de prioridad y dependencias

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 7
                                                   ↘
                                                 Fase 6 (opcional)
```

**MVP mínimo viable** = Fases 0-3 (single player completo, sin cuentas)
**MVP social** = Fases 0-5 + 7 (con duelos async y reto diario)
**MVP completo** = Todas las fases

---

## Principios de desarrollo

1. **BUILD FOR CHANGE**: Adapters para mapa e imágenes. Repository pattern para datos. Swap sin reescritura.
2. **Validar antes de construir**: Cada fase debe ser testeable con usuarios reales antes de pasar a la siguiente.
3. **Coste cero**: No pagar por servicios hasta tener tracción demostrada.
4. **Inglés primero**: Interfaz en inglés para máximo alcance. i18n post-MVP.
5. **Desktop-first, mobile-aceptable**: El gameplay necesita pantalla, pero debe ser usable en móvil.
