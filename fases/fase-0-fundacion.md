# Fase 0 — Fundación y Scaffolding

## Objetivo

Crear la estructura base del proyecto con las abstracciones necesarias para que los cambios futuros (DB, proveedor de mapas, proveedor de imágenes) sean un swap limpio, no una reescritura.

## Entregable

Proyecto arrancable con:
- Frontend React+Vite sirviendo una página con un mapa Leaflet funcional
- Backend Express con estructura de carpetas definida
- Abstracciones (interfaces/adaptadores) para mapa, imágenes y datos
- Deploy básico en VPS funcionando

## Tareas

### Frontend (React + Vite)
- [x] Scaffolding con `npm create vite@latest` (template React + TypeScript)
- [x] Estructura de carpetas:
  ```
  src/
    components/     # Componentes UI
    adapters/       # Abstracciones (mapa, imágenes)
    hooks/          # Custom hooks
    services/       # Llamadas API al backend
    types/          # TypeScript interfaces
    styles/         # Tokens y variables CSS
    i18n/           # Traducciones (EN/ES)
  ```
- [x] Instalar y configurar Leaflet (adapter propio sin react-leaflet)
- [x] Crear `MapAdapter` interface para abstraer el proveedor de mapas
- [x] Componente `<GameMap />` que usa el adapter
- [x] Verificar que el mapa renderiza correctamente con CartoDB tiles (dark/light)
- [x] **Extra**: Sistema i18n con soporte inglés/español
- [x] **Extra**: Theme toggle dark/light mode con tokens CSS

### Backend (Node + Express)
- [x] Scaffolding con TypeScript
- [x] Estructura de carpetas:
  ```
  src/
    routes/         # Endpoints
    controllers/    # Lógica de request/response
    services/       # Lógica de negocio (GameService, ClueGenerator)
    repositories/   # Abstracción de datos
    data/           # JSONs estáticos (países, pistas, location pool)
    types/          # TypeScript interfaces
  ```
- [x] Patrón Repository con implementación JSON inicial
- [x] Endpoint health check: `GET /api/health`
- [x] CORS configurado para desarrollo local

### Dataset base de países
- [x] Crear `countries.json` con datos básicos por país
- [x] 40 países incluidos con datos verificados
- [x] Ficheros de pistas separados: `clues-en.json` y `clues-es.json`
- [x] Pool de ubicaciones pre-validadas: `location-pool.json`

### Infra / VPS
- [ ] Nginx como reverse proxy
- [ ] PM2 para gestionar el proceso Node
- [ ] Build de React servido como estático por Nginx (o por Express)
- [ ] HTTPS con Let's Encrypt (certbot)
- [ ] Dominio mapnoir.com apuntando a la VPS

## Decisiones técnicas

### TypeScript vs JavaScript

| | Pros | Contras |
|---|---|---|
| **TypeScript** | Autocompletado, menos bugs, las interfaces del patrón repository son naturales | Más config inicial, build step |
| **JavaScript** | Más rápido para prototipar | Sin tipos = más errores en refactors futuros |

**Recomendación**: TypeScript. Como dev solo, los tipos te salvan de bugs tontos y hacen que "build for change" funcione de verdad. El coste inicial es mínimo.

### Monorepo vs Repos separados

| | Pros | Contras |
|---|---|---|
| **Monorepo** | Un solo `git clone`, compartir tipos, despliegue coordinado | Puede complicar CI (no aplica en MVP) |
| **Repos separados** | Independencia total | Duplicar tipos, coordinar versiones |

**Recomendación**: Monorepo simple con carpetas `client/` y `server/`. Para un dev solo no tiene sentido separar repos.

## Riesgos

- **Sobre-ingeniería**: No abstraer más de lo necesario. Solo map adapter, image adapter y repository pattern. No crear abstracciones "por si acaso".
- **Leaflet + React**: `react-leaflet` puede dar problemas con re-renders. Usar `useMap()` hook para control imperativo cuando sea necesario.

## Criterio de "done"

- [x] `npm run dev` arranca frontend con mapa Leaflet visible
- [x] `npm run dev:server` arranca backend y responde en `/api/health`
- [x] Se puede hacer click en el mapa y obtener coordenadas
- [ ] Desplegado en VPS y accesible desde mapnoir.com
- [x] `countries.json` con 40 países completos
