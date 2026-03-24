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
- [ ] Scaffolding con `npm create vite@latest` (template React + TypeScript)
- [ ] Estructura de carpetas:
  ```
  src/
    components/     # Componentes UI
    adapters/       # Abstracciones (mapa, imágenes)
    hooks/          # Custom hooks
    services/       # Llamadas API al backend
    types/          # TypeScript interfaces
    pages/          # Páginas/vistas principales
  ```
- [ ] Instalar y configurar Leaflet (`react-leaflet`)
- [ ] Crear `MapAdapter` interface para abstraer el proveedor de mapas
- [ ] Componente `<GameMap />` que usa el adapter
- [ ] Verificar que el mapa renderiza correctamente con OSM tiles

### Backend (Node + Express)
- [ ] Scaffolding con TypeScript
- [ ] Estructura de carpetas:
  ```
  src/
    routes/         # Endpoints
    controllers/    # Lógica de request/response
    services/       # Lógica de negocio
    repositories/   # Abstracción de datos (BUILD FOR CHANGE)
    adapters/       # Geocoding, imágenes
    data/           # JSONs estáticos (países, niveles)
    types/          # TypeScript interfaces
  ```
- [ ] Patrón Repository con implementación JSON inicial:
  ```typescript
  // Interface
  interface GameRepository {
    getRandomLocation(): Promise<Location>
    getCountryData(code: string): Promise<CountryData>
    saveGameResult(result: GameResult): Promise<void>
  }

  // Implementación MVP (JSON files)
  class JsonGameRepository implements GameRepository { ... }

  // Futuro (swap sin tocar lógica de negocio)
  class PostgresGameRepository implements GameRepository { ... }
  ```
- [ ] Endpoint health check: `GET /api/health`
- [ ] CORS configurado para desarrollo local

### Dataset base de países
- [ ] Crear `countries.json` con datos básicos por país:
  ```json
  {
    "ES": {
      "name": "Spain",
      "languages": ["es", "ca", "eu", "gl"],
      "driving": "right",
      "climate": ["mediterranean", "oceanic", "semiarid"],
      "currency": "EUR",
      "region": "Europe",
      "subregion": "Southern Europe",
      "capital": "Madrid",
      "funFacts": ["..."],
      "cluePool": { ... }
    }
  }
  ```
- [ ] Incluir al menos 30-50 países con datos verificados

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

- [ ] `npm run dev` arranca frontend con mapa Leaflet visible
- [ ] `npm run dev:server` arranca backend y responde en `/api/health`
- [ ] Se puede hacer click en el mapa y obtener coordenadas
- [ ] Desplegado en VPS y accesible desde mapnoir.com
- [ ] `countries.json` con al menos 30 países completos
