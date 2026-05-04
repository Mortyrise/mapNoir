# Migración a MapLibre GL (proyección globe)

**Estado:** Integración completa — solo QA visual y limpieza de Leaflet pendientes
**Fecha de inicio:** 2026-05-04
**Última actualización:** 2026-05-04 (mismo día)
**Owner:** Joan

---

## Motivación

Map Noir es un juego de geolocalización: la **proyección del mapa es parte de la mecánica**, no chrome visual. La implementación actual usa Leaflet 2D (web mercator) con tiles raster de CARTO. Esto tiene dos limitaciones funcionales:

1. **El antimeridiano rompe la línea guess↔actual.** Un guess en Tokio y actual en San Francisco hoy dibuja la línea cruzando el Atlántico (la ruta visualmente larga), no por el Pacífico (la corta y geográficamente correcta). En globo las great-circle lines son nativas.
2. **Vista global pobre a zoom bajo.** A `zoom: 2` (el default y minZoom actual) Mercator distorsiona Groenlandia, deforma Antártida y oculta el carácter "vista del planeta" que la pantalla de resultado multi-ronda pide a gritos.

MapLibre GL v5 introdujo `projection: 'globe'` (octubre 2024) — mismo API base que v1 de Mapbox GL, sin token, sin cuotas, open-source. Mantiene el coste 0$/mes del stack.

El `GlobeLoader.tsx` (SVG ortográfico hand-rolled como splash) es señal de que el equipo ya quería un globo pero acabó animándolo a mano. Esto lo sustituye por un globo real e interactivo.

## Por qué MapLibre y no Mapbox

| Criterio | MapLibre GL v5 | Mapbox GL JS v3 |
|---|---|---|
| Coste | 0$ siempre | Free tier 50k loads/mes, luego ~$5/1k |
| Token | No | Sí |
| Globe projection | Sí (v5+) | Sí (v3) |
| Estilos | CARTO vector / OpenFreeMap / propios | Mapbox Studio (premium) |
| Bundle | ~250 KB gzip | ~280 KB gzip |
| Filosofía | Open source, fork | SaaS |

Encaja mejor con el principio "Coste cero" del stack actual.

## Arquitectura: lo que ya estaba bien

`client/src/adapters/MapAdapter.ts` define una interfaz de 28 líneas con 11 métodos. `GameMap.tsx` solo conoce esa interfaz. **Toda la dependencia de Leaflet está contenida en `LeafletMapAdapter.ts`**. El `BUILD FOR CHANGE` del README de fases se aplica casi literalmente aquí: añadimos `MapLibreMapAdapter.ts` paralelo y solo hay que cambiar **una línea** de import en `GameMap.tsx`.

## Plan de migración

### Hecho

- [x] Documentar el cambio (este doc)
- [x] Añadir `maplibre-gl@^5` a `client/package.json` y `npm install` (5.24.0 instalado)
- [x] Implementar `client/src/adapters/MapLibreMapAdapter.ts` con paridad funcional al Leaflet adapter:
  - [x] `initialize` + `setProjection({type:'globe'})` post-`style.load` (la API quitó `projection` de `MapOptions` en v5.24)
  - [x] CARTO vector style (`dark-matter` / `positron`)
  - [x] `placeMarker` / `removeMarker` / `clearMarkers` con HTML element idéntico al actual (mismo div, mismos colores, animación pin-drop preservada vía `.map-noir-marker > div`)
  - [x] `setView` / `fitBounds` (con conversión `{lat,lng}` → `[lng,lat]`)
  - [x] `drawLine` / `removeLine` con outline+foreground vía dos line layers GeoJSON apilados
  - [x] `onMapClick`
  - [x] `setTheme` con `setStyle` y re-add de líneas en `style.load` (las sources/layers se borran al cambiar style; los markers no)
  - [x] `destroy`
  - [x] Tooltips con `title` HTML attribute (paridad mínima con Leaflet `bindTooltip` non-permanent)
  - [x] `NavigationControl` añadido para reemplazar el zoom built-in de Leaflet
- [x] **Swap del import en `GameMap.tsx`**: `LeafletMapAdapter` → `MapLibreMapAdapter`, `leaflet/dist/leaflet.css` → `maplibre-gl/dist/maplibre-gl.css`
- [x] **Reescribir CSS leaflet- → maplibregl-** en `GameMap.css` y `App.css`:
  - `.leaflet-tile-pane` → `.maplibregl-canvas`
  - `.leaflet-control-zoom` → `.maplibregl-ctrl-group`
  - `.leaflet-control-zoom a` → `.maplibregl-ctrl-group button`
  - `.leaflet-control-attribution` → `.maplibregl-ctrl-attrib`
  - Animación `line-reveal` sobre `.leaflet-overlay-pane` desactivada (lines viven en WebGL canvas, no hay DOM pane); keyframes mantenidos para reactivar vía paint property
- [x] **Lazy-load del adapter** vía `dynamic import()` en `GameMap.tsx`. Validado con build:
  - Antes: bundle único 2.3 MB (622 KB gzip)
  - Después: main 1.25 MB (333 KB gzip) + chunk MapLibre 1.06 MB (285 KB gzip) cargado solo al montar `GameMap`
  - Se introdujo state `mapReady` que dispara las re-runs de los `useEffect` dependientes una vez el adapter está listo
- [x] **Tipo-check + build** verde tras todos los cambios (`npx tsc -b && vite build` exit 0)
- [x] Actualizar `fases/README.md` tabla de stack: fila "Mapa" → MapLibre GL v5 (proyección globe) + CARTO vector basemaps

### Pendiente

- [ ] **QA visual y de gameplay** (no se pudo hacer desde aquí — requiere navegador):
  - Verificar que el globo aparece y rota correctamente en la pantalla de juego
  - Dark/light theme switch mid-game (líneas deben re-aparecer correctamente tras `setStyle`; hay flicker esperado)
  - Multi-round summary: 5 pares guess/actual con `fitBounds` correcto en globo
  - Antimeridiano: guess Tokio + actual SF debe dibujar arco por el Pacífico (great-circle nativo del globo)
  - Mobile (touch + performance — WebGL exige más GPU que canvas 2D)
  - Transición globe↔mercator alrededor de zoom 6
  - Iconos de zoom: el filter `invert(0.85)` en dark mode puede necesitar tuning
  - Atribución legible en ambos temas
- [ ] **Tinte teal en paint properties del style vector** (mejor que filter CSS): hoy se mantiene `filter:` sobre `.maplibregl-canvas`. Funciona pero los valores fueron tuneados para raster CARTO; el vector dark-matter puede quedar excesivamente teñido. Solución correcta: derivar style vector con paint properties ajustadas, o aceptar el filter si visualmente está bien.
- [ ] **Reactivar fade-in de líneas en pantallas de resultado** vía animación de la paint property `line-opacity` desde JS (los keyframes CSS ya no aplican). Polish, no bloqueante.
- [ ] **Decidir sobre `GlobeLoader.tsx`** SVG ortográfico: el mapa real ya es un globo interactivo, el loader puede:
  - mantenerse como branding pre-juego (consistente con el ahora-sí-globo del juego),
  - retirarse para reducir código,
  - sustituirse por un fade-in del mapa real.
- [ ] **Eliminar dependencias Leaflet** tras QA OK: borrar `leaflet`, `react-leaflet`, `@types/leaflet` de `client/package.json` y `LeafletMapAdapter.ts`. Recortará otros ~50 KB del bundle.

### Riesgos identificados

1. **Bundle size**: 250 KB gzip vs 40 KB de Leaflet (≈6×). Mitigación: lazy-load (ítem pendiente). Sin lazy-load, el LCP del splash sufre.
2. **WebGL en móvil low-end**: el globo es más caro de renderizar que tiles raster. Probar en un Android de gama media antes de mergear.
3. **Theme switch reset**: al cambiar style se borran sources y layers. Los markers persisten, las líneas no — el adapter ya re-añade líneas en `style.load`, pero hay un flicker visual durante la transición. Aceptable; el theme switch es una acción rara durante una partida.
4. **Atribución CARTO + OSM**: hay que mantener la atribución visible. El adapter la incluye por defecto.

### Decisiones tomadas

- **Style por defecto**: CARTO `dark-matter-gl-style` y `positron-gl-style`. Razón: paleta y look idénticos al raster actual, son vectoriales gratis y no requieren API key.
- **Tooltips**: HTML `title` attribute en vez de `maplibregl.Popup`. Razón: paridad mínima con el comportamiento actual (hover, no permanente). Si pide más fidelidad, migrar a Popup con mouseenter/mouseleave.
- **API marker**: `Marker({element})` con el mismo `<div>` que el divIcon de Leaflet. Razón: mismos estilos CSS aplicables, cero diferencia visual.
- **Líneas con outline+foreground**: dos GeoJSON line layers con IDs derivados del id del par, en vez de dos `Polyline` apiladas como hace Leaflet. Razón: API nativa de MapLibre.

## Cómo seguir desde aquí

1. `npm run dev:client` y abrir el juego. Verificar:
   - El globo aparece, rota con drag, hace zoom con scroll
   - Click en el mapa coloca un marker (se mantiene la animación pin-drop)
   - El switch de tema cambia el basemap (dark-matter ↔ positron) y los markers persisten
   - En el round-result, la línea guess→actual aparece con outline + dashed foreground
   - El multi-round final encuadra los 5 pares correctamente
2. Especialmente probar el caso **antimeridiano**: en una ronda, hacer un guess en Asia/Pacífico vs un actual en América. La línea debería ir por el camino corto (sobre el Pacífico) gracias al globo, no cruzar todo el mapa.
3. Si los iconos de zoom no se ven bien con `filter: invert(0.85)`, ajustar en `GameMap.css`.
4. Si el tinte teal sobre el vector dark-matter resulta excesivo, atenuar los filtros de `.maplibregl-canvas` o pasar a paint properties (ver pendientes).
5. Cuando QA visual OK: borrar Leaflet del `package.json` y `LeafletMapAdapter.ts`.

## Coste estimado restante

| Tarea | Días-persona |
|---|---|
| QA matrix (themes, multi-round, antimeridiano, mobile) | 0.5 |
| Tinte teal en paint properties (si el filter no convence) | 0.25–0.5 |
| Reactivar line-reveal animation vía JS | 0.25 |
| Decisión + ejecución sobre GlobeLoader | 0.1 |
| Remove Leaflet tras QA | 0.1 |
| **Total restante** | **1.2–1.45** |
