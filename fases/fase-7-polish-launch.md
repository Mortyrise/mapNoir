# Fase 7 — Polish, SEO y Lanzamiento

## Objetivo

Preparar el producto para su lanzamiento público. Landing page, meta tags, analytics, bug fixes y los detalles que convierten un prototipo en un producto presentable.

## Entregable

- Landing page atractiva en mapnoir.com
- SEO y meta tags para compartir
- Analytics básico
- Error handling robusto
- Performance optimizada
- Listo para publicar en Product Hunt / Reddit / Twitter

## Dependencias

- Fases 0-5 completadas (fase 6 es opcional para lanzamiento)

## Tareas

### Landing page
- [ ] Página principal con:
  - Headline: "Map Noir — Last Known Location"
  - Subtítulo: breve descripción (1 línea)
  - Botón CTA prominente: "Jugar ahora" / "Resolver un caso"
  - Ejemplo visual: screenshot o gif del gameplay
  - Sección "Cómo funciona" (3 pasos visuales)
  - Sección "Reto diario" con link directo
- [ ] Diseño temático noir: fondo oscuro, tipografía con carácter, acentos de color (rojo, amarillo)
- [ ] Responsive (mobile-first para la landing aunque el juego sea desktop-first)

### SEO y meta tags
- [ ] Meta tags básicos en todas las páginas:
  ```html
  <title>Map Noir — Last Known Location</title>
  <meta name="description" content="Juego de deducción geográfica con temática detective. ¿Puedes localizar la escena?">
  ```
- [ ] Open Graph tags para compartir en redes:
  ```html
  <meta property="og:title" content="Map Noir — Last Known Location">
  <meta property="og:description" content="...">
  <meta property="og:image" content="https://mapnoir.com/og-image.png">
  <meta property="og:url" content="https://mapnoir.com">
  <meta property="twitter:card" content="summary_large_image">
  ```
- [ ] OG image: diseñar una imagen 1200x630 con branding
- [ ] Meta tags dinámicos para reto diario y duelos:
  ```
  mapnoir.com/daily → "Reto diario Map Noir — 24 Mar 2026"
  mapnoir.com/duel/abc123 → "Te han retado a un duelo en Map Noir"
  ```
- [ ] `robots.txt` y `sitemap.xml` básicos

### Analytics
- [ ] Instalar analytics (ver decisión técnica)
- [ ] Eventos clave a trackear:
  - Visita landing
  - Inicio de partida (+ dificultad)
  - Partida completada (+ score)
  - Compartir resultado
  - Crear duelo
  - Login
  - Retención: partidas por usuario por semana
- [ ] Dashboard mínimo para ver métricas

### Performance
- [ ] Lazy loading de Mapillary viewer (no cargar hasta que se necesite)
- [ ] Lazy loading de Leaflet (similar)
- [ ] Compresión de assets (gzip/brotli en Nginx)
- [ ] Cache headers para assets estáticos
- [ ] Optimizar imágenes (WebP donde sea posible)
- [ ] Verificar Lighthouse score > 80 en landing

### Error handling
- [ ] Error boundary global en React (pantalla de "algo salió mal")
- [ ] Manejo de errores en API (respuestas consistentes):
  ```json
  { "error": { "code": "GAME_EXPIRED", "message": "..." } }
  ```
- [ ] Logging en servidor (stdout + archivo rotado):
  - Errores de API
  - Fallos de Mapillary
  - Errores de DB
- [ ] Health check endpoint monitoreado (cron que hace ping cada 5 min)

### QA y bug fixes
- [ ] Playtest completo de todos los flujos:
  - Single player (3 dificultades)
  - Reto diario
  - Duelo async (crear + jugar)
  - Duelo realtime (si se incluye fase 6)
  - Login / logout / jugar anónimo
  - Mobile
- [ ] Arreglar bugs encontrados
- [ ] Test de carga básico: ¿aguanta 50 usuarios concurrentes?

### Preparación para lanzamiento
- [ ] Texto para Product Hunt:
  - Tagline (< 60 chars)
  - Descripción (2-3 párrafos)
  - Screenshots/GIFs
- [ ] Texto para Reddit (r/webgames, r/geoguessr, r/IndieGaming):
  - Post conciso mostrando el juego
- [ ] Tweet de lanzamiento
- [ ] Asegurar que el reto diario está activo y el pool tiene contenido para al menos 30 días

## Decisiones técnicas

### Analytics: Plausible vs Google Analytics vs Umami

| | Pros | Contras |
|---|---|---|
| **Google Analytics** | Gratis, potente, estándar | Pesado, privacy concerns, banners de cookies |
| **Plausible** | Ligero (< 1KB), privacy-first, sin cookies | 9$/mes (hosted) o self-host |
| **Umami** | Gratis (self-host), ligero, privacy-first | Necesita hosting (tu VPS puede) |
| **Sin analytics** | Zero complejidad | Vuelas a ciegas |

**Recomendación**: **Umami self-hosted** en tu VPS. Gratis, ligero, respeta privacidad (sin banner de cookies), y tienes control total de los datos.

### Landing: misma SPA vs página estática

| | Pros | Contras |
|---|---|---|
| **Misma SPA React** | Un solo build, routing integrado | Bundle más grande para la landing, peor SEO |
| **Página estática separada** | Ultra rápido, perfecto SEO, independiente | Dos deploys, duplicar estilos |
| **SSR con React (framework)** | Mejor de ambos mundos | Añade complejidad (necesitarías Next.js o similar) |

**Recomendación**: **Misma SPA** con una ruta `/` que sea la landing. Para SEO, usar `react-helmet` para meta tags. El bundle no es problema si usas lazy loading para los componentes del juego.

### Idioma: español vs inglés vs ambos

| | Pros | Contras |
|---|---|---|
| **Solo inglés** | Mercado global, más alcance en Product Hunt/Reddit | Excluye público hispanohablante no bilingüe |
| **Solo español** | Tu idioma nativo, más rápido | Mercado limitado |
| **Ambos (i18n)** | Máximo alcance | Complejidad de internacionalización |

**Recomendación**: **Inglés** como idioma principal para lanzamiento. El público de juegos web es mayoritariamente anglófono. La temática noir funciona perfecto en inglés. i18n es post-MVP.

## Riesgos

- **Lanzar demasiado pronto**: Si el juego tiene bugs visibles o la UX es confusa, las primeras impresiones serán malas. Mejor esperar unos días extra.
- **Lanzar demasiado tarde**: Perfeccionismo. Si el core loop es divertido y funciona, lanza. Los detalles se pulen con feedback real.
- **Pool de contenido**: Si lanzas y se viraliza, el pool de 200-500 ubicaciones se agotará rápido. Tener plan B (reutilizar con pistas diferentes, generar más batch).
- **Product Hunt timing**: Lanzar un martes o miércoles temprano (PST) para máxima visibilidad.

## Criterio de "done"

- [ ] Landing page atractiva y funcional
- [ ] Meta tags correctos (verificar con Twitter Card Validator y Facebook Debugger)
- [ ] Analytics funcionando y registrando eventos
- [ ] Lighthouse > 80 en landing
- [ ] Zero errores críticos en playtest completo
- [ ] Pool de ubicaciones para 30+ días de reto diario
- [ ] Textos de lanzamiento preparados
- [ ] Deploy final en producción estable
