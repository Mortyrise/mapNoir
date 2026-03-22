# Map Noir -- Last Known Location

## Game Design & Implementation Blueprint

> "No sabes donde estas. Decides donde crees que estas."

**Dominio:** mapnoir.com
**Stack:** React + Vite / Node.js Express (DDD) / Mapbox GL JS / Mapillary API

---

## Vision

**Map Noir** es un juego web movil de deduccion geografica con estetica detective.
El jugador resuelve casos ubicando escenas reales en el mapa a partir de
**pistas ambiguas, no visibles en la imagen**.

> No se trata de saber, sino de **decidir con incertidumbre**.

---

## Decisiones de diseno

| Aspecto              | Decision                                         |
| -------------------- | ------------------------------------------------ |
| Escena visual        | Mapillary (Street View interactivo, gratuito)    |
| Mapa de respuesta    | Mapbox GL JS (estilo noir personalizable)        |
| Cobertura MVP        | Europa unicamente                                |
| Generacion de pistas | Rule-based desde dataset propio                  |
| Dificultad MVP       | Un solo modo de juego                            |
| Estructura partida   | 5 rondas por caso                                |
| Timer                | Soft (solo penaliza score, no fuerza envio)      |
| Apuesta (x2)         | Se activa ANTES de colocar el pin                |
| Pistas extra         | Aleatorias, penalizan score                      |
| Accion "Consultar"   | Fuera del MVP                                    |
| Sesion anonima       | localStorage unicamente                          |
| Cuentas              | Opcionales (guardan historial y rankings)        |
| Retos sociales       | Fuera del MVP                                    |
| Caso diario          | Post-MVP (Wordle-style, 3 rondas, mismo p/todos) |
| Iconografia          | Lucide React (sin emojis)                        |

---

## Core Loop (una ronda)

```
1. Backend genera ronda
   +-- Selecciona imagen Mapillary (lista curada Europa)
   +-- Reverse geocode -> pais
   +-- Enriquece con dataset propio
   +-- Genera 2 pistas iniciales (rule-based)

2. Jugador en pantalla de juego
   |-- Ve Mapillary interactivo (navegar: -1 energia por desplazamiento)
   |-- Lee 2 pistas iniciales
   |-- [Opcional] Pide pista extra aleatoria (-15% score)
   |-- [Opcional] Activa apuesta x2 ANTES de marcar pin
   +-- Marca pin en Mapbox + confirma

3. Backend calcula score -> feedback visual

4. Siguiente ronda (x5) -> Pantalla resumen
```

---

## Sistema de recursos

| Recurso      | Valor        | Mecanica                                                    |
| ------------ | ------------ | ----------------------------------------------------------- |
| Energia      | 3 acciones   | Desplazarse en Mapillary consume 1. Rotar/pan es gratis.    |
| Timer        | 60s          | Soft: el score maximo disponible baja al pasarse del tiempo |
| Pistas extra | Sin limite   | Cada una penaliza -15% del score base                       |
| Apuesta      | 1 uso/ronda  | x2 score si se activa antes del pin. Riesgo total.          |

---

## Formula de puntuacion

```
score_base = 5000 * e^(-distancia_km / 2000)
// GeoGuessr-style decay, max 5000 pts a 0km

coherence = metadatos_coincidentes / total_metadatos_comparados
// Compara: idioma, conduccion, clima, moneda, region, costa/interior
// Si coherence >= 0.6 -> reducir decay un 30%

score_recursos = score_base
  * (1 - pistas_extra * 0.15)
  * (tiempo_restante/60 * 0.1 + 0.9)

score_final = score_recursos * (apuesta_activa ? 2 : 1)
```

Score total = suma de 5 rondas (max ~25.000 pts + bonos apuesta).

---

## Dataset de paises europeos

```json
{
  "code": "FR",
  "name": "France",
  "languages": ["fr"],
  "driving": "right",
  "climate": ["oceanic", "mediterranean", "continental"],
  "currency": "EUR",
  "region": "Western Europe",
  "coastal": true,
  "borders": ["ES", "IT", "DE", "BE", "LU", "CH"],
  "touristLevel": "high",
  "tags": ["wine", "alps", "romance"]
}
```

Cobertura MVP: ~30 paises europeos con metadatos completos.

---

## Sistema de pistas (rule-based)

Las pistas **no deben ser visibles directamente en la imagen**.

| Tipo         | Campo dataset | Ejemplo                                    |
| ------------ | ------------- | ------------------------------------------ |
| Auditiva     | languages     | "Se escuchaba frances en el ambiente"       |
| Geopolitica  | driving       | "Se conduce por la derecha"                 |
| Monetaria    | currency      | "Alguien pago con euros"                    |
| Climatica    | climate       | "Clima mediterraneo, verano muy seco"       |
| Regional     | region        | "Europa occidental"                         |
| Costera      | coastal       | "El olor a mar no estaba lejos"             |
| Negativa     | borders       | "El sospechoso no cruzo hacia Rusia"        |
| Narrativa    | tags          | "Entre vinedos y arquitectura antigua"      |

Cada ronda: 2 pistas al inicio. El jugador puede pedir mas (aleatorias, penalizan score).

---

## Arquitectura backend (DDD)

Tres capas con separacion estricta de responsabilidades:

```
backend/src/
|
|-- domain/                    LOGICA DE NEGOCIO PURA
|   |-- geography/
|   |   |-- Location.ts        Value Object: lat/lon + haversine
|   |   |-- Country.ts         Value Object: metadatos + coherencia
|   |   +-- CountryRepository.ts   Port (interfaz)
|   |-- round/
|   |   |-- Round.ts           Aggregate Root: estado de ronda
|   |   |-- Clue.ts            Value Object: tipo + texto
|   |   |-- ClueGenerator.ts   Port (interfaz)
|   |   +-- RoundRepository.ts Port (interfaz)
|   +-- scoring/
|       +-- ScoreCalculator.ts Domain Service: formula pura
|
|-- application/               CASOS DE USO (orquestacion)
|   |-- GenerateRound.ts       Genera ronda nueva
|   |-- SubmitAnswer.ts        Calcula score de respuesta
|   +-- RequestExtraClue.ts    Pista extra
|
+-- infrastructure/            IMPLEMENTACIONES CONCRETAS
    |-- persistence/
    |   |-- InMemoryRoundRepository.ts
    |   |-- JsonCountryRepository.ts
    |   +-- JsonImageSource.ts
    |-- clues/
    |   +-- TemplateClueGenerator.ts   Plantillas en espanol
    |-- http/
    |   |-- server.ts           Composicion root + Express
    |   +-- gameController.ts   Rutas HTTP
    +-- data/
        |-- europe-countries.json
        +-- mapillary-images.json
```

### Principios

- **Domain** no importa nada de infrastructure ni de express
- **Application** depende solo de interfaces del domain (ports)
- **Infrastructure** implementa los ports y conecta todo
- Los puertos (CountryRepository, RoundRepository, ClueGenerator) permiten
  reemplazar implementaciones sin tocar logica de negocio

### API endpoints

| Metodo | Ruta              | Descripcion                                |
| ------ | ----------------- | ------------------------------------------ |
| GET    | /game/generate    | Nueva ronda: mapillaryId + clues + roundId |
| POST   | /game/clue/:id    | Pista extra aleatoria para una ronda       |
| POST   | /game/score       | Score con breakdown completo               |
| GET    | /health           | Health check del servicio                  |

---

## Arquitectura frontend

```
frontend/src/
|
|-- components/
|   |-- MapillaryViewer.tsx    Street View interactivo
|   |-- MapboxAnswerMap.tsx    Mapa respuesta + pin
|   |-- CluePanel.tsx          Pistas + pedir mas
|   |-- ResourceBar.tsx        Energia + timer
|   |-- BetButton.tsx          Apostar x2
|   +-- ScoreResult.tsx        Feedback post-ronda
|
|-- pages/
|   |-- HomePage.tsx           Inicio
|   |-- GamePage.tsx           Core game loop
|   +-- SummaryPage.tsx        Resumen 5 rondas
|
|-- hooks/
|   |-- useGame.ts             Estado global del juego
|   +-- useResources.ts        Energia + timer
|
+-- lib/
    |-- api.ts                 Cliente HTTP al backend
    +-- scoring.ts             Formulas compartidas
```

### Estetica

- **Tono:** Film noir detective -- oscuro, grano, tipografia de expediente
- **Iconos:** Lucide React (sin emojis en la UI)
- **Tipografia:** Display serif + monospace para datos/pistas
- **Paleta:** Negros profundos, ambar/mostaza como acento, rojo para alertas
- **Mobile-first:** Mapillary arriba, mapa abajo, responsive

---

## Post-MVP -- Roadmap

| Feature               | Descripcion                                    |
| --------------------- | ---------------------------------------------- |
| Caso diario           | 3 rondas iguales para todos (Wordle-style)     |
| Crear/compartir reto  | Link unico con ubicacion y reglas              |
| Progresion XP         | Niveles de detective, habilidades              |
| Dificultad            | Easy/Hard o progresion automatica              |
| Ranking global        | Con cuentas de usuario                         |
| Accion "Consultar"    | Pregunta si/no al sistema sobre metadatos      |

---

## Fases de implementacion

### Fase 1 -- Datos y backend base [COMPLETADA]
API funcional con arquitectura DDD.
- Dataset 30 paises + 50 imagenes curadas
- ClueEngine rule-based con plantillas en espanol
- ScoreCalculator con haversine + coherencia
- Endpoints: /game/generate, /game/score, /game/clue/:id

### Fase 2 -- Viewer de escena (Mapillary) [EN CURSO]
- MapillaryViewer.tsx con SDK de Mapillary
- useResources.ts: energia (3 acciones) + timer soft
- ResourceBar.tsx: UI de recursos

### Fase 3 -- Mapa de respuesta (Mapbox)
- MapboxAnswerMap.tsx: pin + confirmar
- BetButton.tsx: apuesta x2 antes del pin
- Resultado: linea pin->real + score

### Fase 4 -- Panel de pistas
- CluePanel.tsx: pistas + pedir mas
- Animacion typewriter noir

### Fase 5 -- Game loop completo
- useGame.ts: estado 5 rondas
- GamePage.tsx: orquestador
- SummaryPage.tsx: resumen + localStorage

### Fase 6 -- UI/UX noir
- Paleta noir, tipografia detective
- Mobile-first, responsive
- Mapbox custom dark style

### Fase 7 -- Cuentas opcionales
- JWT auth, historial, rankings
- Migracion localStorage -> backend al loguearse
