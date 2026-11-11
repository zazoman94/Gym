# Gym

App para el móvil para registrar los entrenamientos y ver el progreso. Es una PWA: una web que se instala en la pantalla de inicio, funciona sin conexión y guarda los datos en el propio teléfono. Sin dependencias ni proceso de compilación: HTML, CSS y JavaScript.

## Estructura

```
app/                  La aplicación (lo que se publica)
  index.html
  css/app.css
  js/version.js       Versión (la cambia el script de publicación)
  js/routine.js       Ejercicios y días de la rutina  ← para cambiar la rutina
  js/body.js          Mapa muscular
  js/store.js         Datos (localStorage), exportar/importar
  js/app.js           Pantallas y lógica
  sw.js               Service worker (funcionamiento sin conexión)
scripts/              Scripts de PowerShell (setup, dev, release, backup)
.github/workflows/    Publicación automática en GitHub Pages
gym.cmd               Atajo para los scripts
CLAUDE.md             Instrucciones para Claude Code
```

## Primera vez

1. Instala git si no lo tienes: `winget install --id Git.Git -e` (y abre una terminal nueva).
2. En esta carpeta: `gym setup`

Esto crea el repositorio con dos ramas, activa la copia automática a OneDrive y hace la primera copia.

## Desarrollo y producción

| | Desarrollo | Producción |
|---|---|---|
| Rama git | `develop` | `main` |
| Dónde se ve | `gym dev` → http://localhost:5173 (y en el móvil por wifi) | GitHub Pages, instalada en el móvil |
| Datos | Separados, de prueba (banda naranja) | Tus registros reales |
| Caché | Ninguna, siempre el último código | Funciona sin conexión |

Flujo normal:

1. Trabaja en `develop` (con Claude Code o a mano) y haz commits.
2. Prueba con `gym dev`. En Ajustes hay un botón para cargar datos de ejemplo.
3. Cuando esté bien: `gym release` (o `gym release minor` para cambios grandes). Sube la versión, actualiza el CHANGELOG, fusiona en `main` y lo publica.
4. En el móvil, la app avisa de que hay una versión nueva → **Actualizar**.

## Publicar en internet (necesario para usarla en el móvil)

1. Crea una cuenta en GitHub y un repositorio vacío llamado `gym` (puede ser privado solo con GitHub Pro; si no, público: el código no contiene tus datos).
2. `powershell -ExecutionPolicy Bypass -File scripts\setup.ps1 -RemoteUrl https://github.com/TU_USUARIO/gym.git`
3. En GitHub: Settings → Pages → Source: **GitHub Actions**.
4. En 1-2 minutos estará en `https://TU_USUARIO.github.io/gym/`. Ábrela en el móvil e instálala (Chrome: menú ⋮ → Instalar aplicación; iPhone Safari: Compartir → Añadir a pantalla de inicio).

## Copias de seguridad

- **Código**: tras cada commit se guarda una copia completa del repositorio en `OneDrive\Copias de seguridad\Gym\gym-FECHA.bundle` (se conservan las 30 últimas). También manual: `gym backup`.
  Para restaurar: `git clone "C:\Users\...\OneDrive\Copias de seguridad\Gym\gym-FECHA.bundle" Gym`
- **Tus entrenamientos**: viven en el móvil. En la app, Ajustes → **Exportar** y guárdalo en OneDrive desde el menú de compartir. Para recuperarlos, Ajustes → Importar.

El repositorio no está dentro de OneDrive a propósito: sincronizar la carpeta `.git` puede corromperla.
