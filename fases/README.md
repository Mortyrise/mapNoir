# Map Noir — Plan de Desarrollo MVP

## Stack elegido

| Capa | Tecnología | Coste |
|------|-----------|-------|
| Frontend | React + Vite + TypeScript | 0$ |
| Mapa | MapLibre GL v5 (proyección globe) + CARTO vector basemaps | 0$ |
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

### [Fase 0 — Fundación y Scaffolding](./fase-0-fundacion.md) ✅
Estructura del proyecto, abstracciones (repository pattern, adapters), dataset de 40 países, i18n (EN/ES), theme toggle. Pendiente: deploy en VPS.

### [Fase 1 — Core Gameplay](./fase-1-core-gameplay.md) ✅
Loop completo jugable: ver escena Mapillary → briefing → marcar en mapa → ver score con desglose detallado y línea visual en mapa de resultado.

### [Fase 2 — Pistas y Recursos](./fase-2-pistas-recursos.md) ✅
1000 pistas por idioma (40 países × 5 categorías × 5), voz narrativa del informante, priorizando lo no-visual (olores, sonidos, comportamientos). Energía, timer, apuesta, movimiento. Desglose de score con deltas de puntos.

### [Fase 3 — Partida Completa y Game Feel](./fase-3-partida-completa.md) ✅
Sesión de 5 rondas con energía compartida, narrativa detective (3 variantes + conclusión por rendimiento), resumen final con mapa y texto compartible, selector de dificultad, efectos de sonido, animaciones (pin drop, score roll-up), responsive, pool de ~2150 ubicaciones pre-validadas, sistema de review.

### [Fase 4 — Auth y Persistencia](./fase-4-auth-persistencia.md) ⬜ Siguiente
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
4. **Bilingüe desde el inicio**: Interfaz en inglés y español con sistema i18n integrado.
5. **Desktop-first, mobile-aceptable**: El gameplay necesita pantalla, pero debe ser usable en móvil.
