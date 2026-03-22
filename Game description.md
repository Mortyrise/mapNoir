# 🕵️ Map Noir — Last Known Location

### Game Design & Technical Blueprint (MVP)

---

## 🎯 Visión

**Map Noir** es un juego web móvil de deducción geográfica con estética detective.
El jugador resuelve casos ubicando escenas reales en el mapa a partir de **pistas ambiguas, incompletas y no visibles en la imagen**.

> No se trata de saber, sino de **decidir con incertidumbre**.

---

## 🧠 Fantasía del jugador

> “Soy un detective reconstruyendo la última ubicación conocida de un caso.”

El jugador:

* observa una escena real
* interpreta pistas externas
* formula hipótesis
* toma decisiones bajo presión

---

## 🔁 Core Loop

1. Se presenta una escena (Street View o imagen)
2. Se da contexto narrativo + 2–4 pistas abiertas
3. El jugador gestiona recursos (movimiento, consultas, tiempo)
4. Decide una ubicación en el mapa
5. Recibe puntuación + feedback visual

---

## 🗺️ Mecánica principal

### 📍 Mapa abierto

* Sin opciones múltiples
* El jugador marca cualquier punto (o región limitada)

### 🎯 Puntuación

* Basada en **distancia real**
* Modificada por:

  * uso de recursos
  * tiempo restante
  * coherencia con pistas

---

## ⚡ Sistema de recursos

### Recursos base

* ⏱ Tiempo: 30–60s
* 🔋 Energía: 2–4 acciones

### Acciones

* Moverse (Street View) → coste energía
* Pedir pista → penaliza score
* Consultar (sí/no) → coste medio
* Apostar (x2 score) → riesgo alto

👉 Decisiones irreversibles

---

## 🔍 Sistema de pistas

### ❗ Regla clave

Las pistas **no deben ser visibles directamente en la imagen**

---

### Tipos de pistas

#### 🗣️ Auditivas / externas

* “Se escuchaba francés”
* “Alguien mencionó euros”

#### 🌍 Contextuales

* “Zona turística europea”
* “Región vinícola”

#### 🧭 Geopolíticas

* “No es un país insular”
* “Se conduce por la derecha”

#### 📜 Narrativas

* “El sospechoso cruzó una frontera cercana”

#### ❌ Negativas (muy importantes)

* “No es Asia”
* “No es clima tropical”

---

## 🧠 Deducción

El jugador:

* combina pistas
* descarta regiones
* estima probabilidad

👉 Nunca hay certeza total

---

## 🧪 Generación de niveles

### 📦 Dataset base (MVP)

Estructura simple por país/región:

```json
{
  "country": "Spain",
  "languages": ["es"],
  "driving": "right",
  "climate": "mediterranean",
  "currency": "EUR",
  "region": "Europe"
}
```

---

### ⚙️ Flujo de generación

1. Seleccionar coordenadas aleatorias
2. Obtener país (reverse geocoding)
3. Enriquecer con dataset propio
4. Generar:

   * 2 pistas externas
   * 1 pista narrativa
   * 1 pista negativa (opcional)
5. Crear escena

---

### 🎚️ Dificultad

**Fácil**

* pistas fuertes (idioma, conducción)

**Media**

* mezcla de pistas

**Difícil**

* pistas ambiguas / narrativas

---

## 🧩 Sistema anti-azar

* No hay opciones cerradas
* Score continuo (no binario)
* Penalización por abuso de pistas
* Bonus por precisión sin ayudas

---

## 🧑‍🤝‍🧑 Modo social

### 🔥 Crear reto

* seleccionar ubicación
* configurar reglas (tiempo, energía)
* compartir link

### 🏆 Ranking

* mejor score
* menos pistas usadas
* más precisión

---

## 🕵️ Narrativa

Formato ligero por partida:

> “Última localización conocida del sospechoso.
> Un testigo afirma haber escuchado francés.
> Se movía cerca de una frontera.”

---

## 📈 Progresión (post-MVP)

* XP por partidas
* niveles de detective
* habilidades:

  * más energía
  * pistas adicionales
  * ayudas visuales

---

## 🌐 Dominio y marca

* Dominio principal: **mapnoir.com**
* Nombre producto: **Map Noir**
* Subtítulo: **Last Known Location**

---

## 🏗️ Arquitectura técnica (MVP)

### Frontend

* React + Vite
* Mapa: Mapbox / Leaflet
* UI rápida y mobile-first

### Backend

* Node.js (Express o similar)
* API:

  * /game/generate
  * /game/score
  * /challenge/create

### Servicios

* Reverse geocoding (Nominatim)
* Street View (o alternativa de imágenes)

---

## 🚀 MVP Scope

* escena (Street View o imagen)
* mapa interactivo
* sistema de score por distancia
* pistas generadas automáticamente
* recursos básicos
* crear/compartir retos

---

## 🎯 Principios de diseño

* Decisiones > conocimiento
* Incertidumbre > certeza
* Riesgo > exploración libre
* Deducción > memorización

---

## 🧠 Frase clave

> “No sabes dónde estás.
> Decides dónde crees que estás.”

---
