1.- Un solo dev
2.- web only, en el futuro tirare de webview if needed
3. En un principio será gratis para comprobar viabildiad y traccion, en el futuro ya plantearé la monetización, quizas freemium o ads, aunqeu no es importante ahora
4.- Tengo una vps que puedo usar de momento, pero el presupusto es muy bajo
5.- Los 2 modos me gustan. plantearia ambos
6.- puedes jugar sin cuenta de usuario anonimo pero si quieres ver la puntuacion o resultado ahi pedirte login
7.- En mi cabeza yo tengo una bbdd de cada pais guardada con la info basica de paises y a partir de ahi generamos pistas o fun facts sobre zonas, que se puede ir mejorando con el tiempo, ya sea con apis o otro sistema.

Decisiones tecnicas.
1.- Empezar con Mapillary (gratis) + fallback a imágenes curadas. Si valida, migrar a Google Street View.
2.- React + Vite.
3.- Leaflet + OSM para MVP, este mapa tiene que ser una interfaz que se peuda cambiar en el futuro si tracciona, es decir, BUILD FOR CHANGE
4.- Node + Express
5.- Sin DB, para poder probar, pero la idea es cambiarlo en el futuro BUILD FOR CHANGE
6.- Nominatim
