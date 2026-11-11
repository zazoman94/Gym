# Gym · instrucciones para Claude Code

App PWA personal para registrar entrenamientos de gimnasio desde el móvil. El usuario habla español: responde, comenta el código y escribe los textos de la interfaz en español.

## Reglas del proyecto

- **Sin dependencias ni compilación.** HTML + CSS + JS clásico (sin módulos, sin npm, sin frameworks). Cada archivo de `app/js/` expone globales en `window`. No añadas build steps.
- **Ramas:** se trabaja SIEMPRE en `develop`. Nunca hagas commit directamente en `main`. Solo `scripts/release.ps1` (`gym release`) pasa cambios a `main`, sube la versión y crea la etiqueta. No cambies `app/js/version.js` a mano.
- **Commits:** pequeños y con mensaje en español en imperativo ("Añade gráfica de volumen"). El mensaje aparece en el CHANGELOG, así que que se entienda para el usuario.
- **Datos del usuario:** se guardan en `localStorage` con clave `gym:<env>:v1` (ver `store.js`). Nunca rompas la compatibilidad con datos existentes: si cambias el formato, sube `SCHEMA` y añade una migración en `load()`. Las sesiones se guardan con ids de ejercicio: si renombras un id en `routine.js`, migra los datos o el historial se pierde.
- **Service worker:** si añades o renombras un archivo en `app/`, actualiza la lista `ASSETS` de `app/sw.js`, o no funcionará sin conexión.
- **Entornos:** `store.js` detecta desarrollo por el host (localhost / IP local). En desarrollo no se registra el service worker y los datos van aparte. Mantén ese comportamiento.
- **Móvil primero:** se usa con una mano en el gimnasio. Botones de al menos 44 px, campos numéricos con `inputmode`, nada de diálogos `alert/confirm` (usa confirmaciones dentro de la página como las existentes). Respeta las zonas seguras (`env(safe-area-inset-*)`) y los dos temas (tokens en `:root` de `app.css`).

## Probar

- `gym dev` sirve `app/` en http://localhost:5173. En Ajustes → "Cargar datos de ejemplo" para tener historial y gráficas.
- Antes de dar algo por terminado, comprueba que no hay errores en la consola y que se ve bien a 390 px de ancho.

## Archivos

- `app/js/routine.js`: ejercicios (`EXERCISES`) y días (`DAYS`: `[id, series, repsMin, repsMax, nota]`). Para cambiar la rutina, edita aquí.
- `app/js/store.js`: carga/guardado, últimas series de un ejercicio, series para gráficas, exportar/importar, datos de ejemplo.
- `app/js/app.js`: las cuatro pantallas (Entrenar, Progreso, Historial, Ajustes), temporizador de descanso, wake lock, registro del service worker y aviso de actualización.
- `scripts/`: `setup.ps1` (una vez), `dev.ps1`, `release.ps1`, `backup.ps1` (copia `git bundle` en OneDrive; la llama el hook `scripts/hooks/post-commit`).
