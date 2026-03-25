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

* Basada en **distancia real**: `base = max(0, 5000 - distancia_km * 2)`
* Modificada por:

  * penalización por pistas usadas (-15% por pista)
  * bonus por tiempo restante (hasta +20%)
  * multiplicador de apuesta (x2)
* Desglose muestra deltas de puntos (no acumulados)

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

Todas las pistas usan **voz narrativa del informante** y priorizan **información no visible en la foto** (olores, sonidos, clima, comportamientos).

#### 🗣️ Auditivas (lo que se oía)

* “Nuestro informante recuerda que las conversaciones en los bares se oían a un volumen altísimo”
* “El contacto nos dice que se escuchaba el llamado a la oración desde varios puntos de la ciudad”

#### 🌍 Contextuales (sensaciones, olores, clima)

* “La fuente nos dice que el olor a aceite de oliva frito lo impregnaba todo”
* “Nuestro contacto recuerda una humedad sofocante — la ropa se pegaba al cuerpo”

#### 🧭 Geopolíticas (banderas parciales, moneda, idioma)

* “El contacto recuerda haber visto una bandera con mucho rojo y algo de amarillo”
* “Nuestra fuente dice que no reconocía el alfabeto — no era ni latino ni cirílico”

#### 📜 Narrativas (costumbres, comportamientos)

* “Nuestro informante recuerda que los restaurantes estaban vacíos a las 20h — la gente cenaba pasadas las 22h”
* “El contacto nos dice que le sirvieron comida extremadamente picante sin haberlo pedido”

#### ❌ Negativas (lo que NO se observó)

* “Nuestra intel indica que no hacía frío — descartamos países del norte de Europa”

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
