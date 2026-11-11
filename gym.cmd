@echo off
rem Atajo: gym setup | dev | backup | release [patch|minor|major] | status
setlocal
set "ROOT=%~dp0"
set "CMD=%~1"
if "%CMD%"=="" goto help
shift
if /I "%CMD%"=="setup" (powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\setup.ps1" %1 %2 %3 & goto end)
if /I "%CMD%"=="dev" (powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\dev.ps1" %1 %2 & goto end)
if /I "%CMD%"=="backup" (powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\backup.ps1" %1 %2 & goto end)
if /I "%CMD%"=="release" (powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\release.ps1" %1 %2 & goto end)
if /I "%CMD%"=="status" (git -C "%ROOT%." status -sb & git -C "%ROOT%." log --oneline -5 --decorate & goto end)
:help
echo.
echo   gym setup              Prepara git (ramas main y develop) y la copia en OneDrive. Solo una vez.
echo   gym dev                Arranca la version de desarrollo en http://localhost:5173
echo   gym backup             Copia el repositorio completo a OneDrive
echo   gym release [patch]    Publica develop en produccion (main) con nueva version
echo   gym status             Rama actual y ultimos commits
echo.
:end
endlocal
