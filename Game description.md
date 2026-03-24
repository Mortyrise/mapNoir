# 🕵️ Map Noir — Last Known Location

### Game Design & Technical Blueprint (MVP)

---

## 🎯 Visión

**Map Noir** es un juego de deducción geográfica con un enbfoque detective.
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

1. Se presenta una escena Street View (goegussr like)
2. Se da contexto narrativo + 1 pista abierta
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
* Pedir pista → penaliza score y energia
* Apostar (x2 score) → riesgo alto consume energia

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
* Quien nos dió la información recuerda que vio a gente con cajas de vinos -> Región vinícola”

#### 🧭 Geopolíticas

* “No es un país insular”

#### 📜 Narrativas

* “El sospechoso cruzó una frontera cercana”

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

* pistas fuertes (idioma, moneda)

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

### 🔥 reto Diario
### 🔥 Duelo con amigo
### 🔥 Duelo con random

### 🏆 Ranking

* mejor score (el score depende de la distandcia final a la coordenada de la cantidad de pistas y tiempo)

---

## 🕵️ Narrativa

Formato ligero por partida:

> “Última localización conocida del sospechoso.
> Un testigo afirma haber escuchado francés.

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
* UI rápida

### Backend

* Node.js (Express o similar)

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
* crear/compartir duelos

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
