# HANDOFF: Reproductor "JohanTube" Profesional

**Fecha**: 2026-10-22  
**Autor**: Antigravity (Johan Tapia - Pair Programming)  
**Ubicación**: `D:\CLAUDE CARPETA\scratch_practicas_web\practicas-web\johantube\`  
**Estado**: Completado y verificado con pruebas automatizadas en navegador real (Playwright / Chromium).

---

## 1. Qué se hizo

Se reemplazó el reproductor mínimo anterior por una solución profesional, moderna y robusta, con código y diseño propios (sin logos, código ni dependencias de YouTube; iconos SVG en línea propios; marca visible "JohanTube").

### Archivos creados y editados (únicamente en el scope autorizado):
- [`johantube/index.html`](file:///D:/CLAUDE%20CARPETA/scratch_practicas_web/practicas-web/johantube/index.html): Estructura semántica completa, metadata `noindex, nofollow`, logo original "JohanTube Pro", capas accesibles para video, subtítulos, preguntas reflexivas, avisos, animaciones de gestos táctiles, controles personalizados, panel de pestañas y pie de página institucional.
- [`johantube/player.css`](file:///D:/CLAUDE%20CARPETA/scratch_practicas_web/practicas-web/johantube/player.css): Sistema de temas claro y oscuro con `prefers-color-scheme`, paleta turquesa institucional (`#0d7377` con acento `#4fd1c5`), barra de progreso con engrosamiento al hover, menú popover de ajustes con efecto blur, tarjeta modal de preguntas interactivas, modo cine responsive, objetivos táctiles >= 44 px, y soporte para `prefers-reduced-motion`.
- [`johantube/player.js`](file:///D:/CLAUDE%20CARPETA/scratch_practicas_web/practicas-web/johantube/player.js): Motor completo en JavaScript vainilla (ES6/ES5 limpio, sin librerías salvo `hls.js 1.5.13` en CDN):
  - **Detección segura de parámetros**: `BASE` por defecto en HTTPS o configurable localmente con `?base=` solo bajo `localhost` o `127.0.0.1`. Llave en `#k=`.
  - **Degradación elegante**: tolerancia comprobada a 404 en `subs.vtt`, `transcripcion.json`, `thumbs.vtt` y `meta.json`.
  - **Barra de progreso con miniatura (sprite)**: parsing de `thumbs.vtt` y recorte dinámico de coordenadas `#xywh=x,y,w,h` sobre `sprite.jpg` en un tooltip centrado con clamping lateral.
  - **Marcadores temporales**: puntos amarillos para preguntas interactivas y divisores para capítulos de la parte.
  - **Atajos de teclado profesionales**: K/Espacio (play/pausa), J/L (∓10 s), Flechas izq/der (∓5 s), Flechas arr/abj (volumen), M (mute), F (fullscreen), C (subtítulos), T (modo cine), I (PiP), 0–9 (0–90%), fotograma por fotograma en pausa (`,`, `.`), `<`/`>` (velocidad), Home/End. Exclusión estricta cuando el foco está en inputs/editables.
  - **Móvil (375×667)**: doble toque táctil en tercio izquierdo (-10s) y derecho (+10s) con animación de ondas; pulsación sostenida (long press) para velocidad 2x temporal; autohide de controles a los 3s de inactividad mientras reproduce.
  - **Reanudar sesión**: almacenamiento seguro en `localStorage` con debounce/throttle, toast flotante "Continuar donde quedó (Parte N, mm:ss)" con botón "Reanudar".
  - **Fin de parte**: cuenta regresiva visual de 5s para avanzar a la siguiente parte, con botones "Ver ahora" y "Cancelar".
  - **Panel con 3 pestañas**:
    1. *Escenas*: lista de capítulos con miniatura recortada del sprite, título y salto al clic.
    2. *Transcripción*: 100 líneas sincronizadas con `timeupdate`, resaltado activo, auto-scroll suave, salto al clic y buscador en tiempo real.
    3. *Partes*: cuadrícula 1–12 con indicador visual de la parte activa.
  - **Preguntas reflexivas**: pausa automática al segundo exacto, tarjeta interactiva con botones "Seguir viendo" y "Ver de nuevo la escena (-30 s)", emisión de `postMessage` `{ johantube: 'pregunta', parte, seg, texto }` y escucha de `{ saltar: { parte, seg } }` y `{ pausar: true }`.

- [`local_vps/<LLAVE_SECRETA>/felicidad/meta.json`](file:///D:/CLAUDE%20CARPETA/Practicas_Peliculas/local_vps/<LLAVE_SECRETA>/felicidad/meta.json): Creado localmente para testing con 3 capítulos sincronizados con el audio real y 2 preguntas reflexivas.

---

## 2. Qué se probó (con salidas y mediciones reales)

Se configuró un entorno de pruebas con servidor de medios en `http://localhost:8099` (simulando VPS) y servidor de frontend en `http://localhost:8088`. Se ejecutaron pruebas con `node --check` y navegación automatizada mediante Playwright / Chromium headless:

### Prueba 1: Sintaxis y Consola
- `node --check player.js`: **0 errores** (código 0).
- Carga de la parte 01 en `http://localhost:8088/johantube/index.html?base=http://localhost:8099#k=<LLAVE_SECRETA>`:
  - Errores de script JS no capturados: **0**.
  - Avisos en consola: **0**.

### Prueba 2: Reproducción, Velocidad y Calidad
- Inicio de reproducción:
  ```json
  { "paused": false, "duration": 600.021344, "playbackRate": 1 }
  ```
- Cambio de velocidad con engranaje (submenú Velocidad > 1.5x):
  ```json
  { "rateAfter": 1.5, "speedLabel": "1.5x" }
  ```
- Cambio de calidad HLS con engranaje (submenú Calidad > nivel 1 [358p]):
  ```json
  { "levelAfter": 1, "qualityLabel": "358p" }
  ```

### Prueba 3: Tooltip de miniatura (Sprite) en hover de la barra
- Movimiento de puntero sobre `#jt-progress-container`:
  ```json
  {
    "tooltipActive": true,
    "thumbHasSprite": true,
    "thumbBgImage": "url(\"http://localhost:8099/<LLAVE_SECRETA>/felicidad/parte01/sprite.jpg\")",
    "thumbBgPosition": "-1280px -268px",
    "thumbWidth": "160px",
    "thumbHeight": "67px",
    "timeText": "04:00"
  }
  ```

### Prueba 4: Atajos de teclado reales
- Tecla `k`: alterna pausa y reproducción (`paused: true` / `paused: false`).
- Tecla `j`: retrocede 10s (de 108.91s a 98.91s exactos).
- Tecla `l`: avanza 10s (de 98.91s a 108.91s exactos).
- Tecla `ArrowLeft`: retrocede 5s (de 108.91s a 103.91s).
- Tecla `m`: alterna silencio (`muted: true` / `muted: false`).
- Tecla `5`: salta al 50% de la duración (`currentTime: 300.010672s` de `600.021344s`, ratio: 0.5 exacto).
- Tecla `0`: salta al 0% (`currentTime: 0s`).

### Prueba 5: Móvil 375×667 y Doble Toque
- Verificación de scroll horizontal:
  ```json
  {
    "scrollWidth": 375,
    "innerWidth": 375,
    "noHorizontalScroll": true
  }
  ```
- Doble toque en tercio derecho (> 65% de ancho): salta de 50s a 60s (+10s).
- Doble toque en tercio izquierdo (< 35% de ancho): salta de 60s a 50s (-10s).

### Prueba 6: Pregunta interactiva y retroceso de 30s
- Reproducción hacia el segundo 344 (pregunta configurada en `meta.json`):
  ```json
  {
    "triggered": true,
    "paused": true,
    "text": "¿Por qué Chris Gardner decide vender el explorador de densidad de huesos portátil?",
    "timeAtTrigger": 344.160279
  }
  ```
- Clic en el botón "Ver de nuevo la escena (-30 s)":
  ```json
  {
    "closedAfterRewind": true,
    "timeAfterRewind": 314.188839,
    "difference": 29.97144
  }
  ```

### Prueba 7: Continuar donde quedó (Reanudar)
- Posición guardada: `{ parte: 1, seg: 195 }`.
- Carga de la página:
  ```json
  {
    "toastActive": true,
    "infoText": "Continuar donde quedó (Parte 1, 03:15)"
  }
  ```
- Clic en el botón "Reanudar":
  ```json
  {
    "timeAfterClick": 195.075582,
    "toastClosed": true
  }
  ```

### Prueba 8: Transcripción en vivo y salto
- Pestaña cargó 100 líneas sincronizadas con `timeupdate`.
- Resaltado activo al cambiar tiempo.
- Clic en la línea "Es un explorador de densidad de huesos portátil": salta a `337.50s`.
- Buscador interactivo filtró "máquina del tiempo" a 5 líneas coincidentes en tiempo real.

### Prueba 9: Tolerancia a 404 (Degradación elegante)
- Carga de la parte 02 (`p=2`, donde `subs.vtt` y `transcripcion.json` responden 404):
  - El video HLS reproduce normalmente (`paused: false`, `duration: 599.99s`).
  - Botón CC queda deshabilitado (`btnCcDisabled: true`).
  - Pestaña Transcripción muestra: `"Transcripción no disponible para esta parte."`.
  - 0 excepciones JavaScript que interrumpan la ejecución.

### Prueba 10: Integración vía postMessage
- Envío `{ saltar: { parte: 1, seg: 80 } }` desde ventana contenedora: salta a `80.26s` y reproduce.
- Envío `{ pausar: true }`: video entra inmediatamente en estado `paused: true`.

---

## 3. Qué no se pudo probar en local

1. **Safari nativo en iOS real**: La prueba móvil se ejecutó en Chromium bajo emulación de viewport táctil de 375×667 px. Safari iOS utiliza la implementación HLS nativa de Apple (`application/vnd.apple.mpegurl`), la cual está codificada en el bloque `canPlayType` como fallback estándar.
2. **VPS en producción**: No se realizó ninguna subida ni deploy al VPS conforme a las reglas explícitas de la tarea. Todos los tests se ejecutaron con los datos reales locales en `http://localhost:8099` y la llave de prueba `<LLAVE_SECRETA>`.
