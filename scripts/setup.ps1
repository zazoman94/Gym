# Prepara el repositorio una sola vez:
#   - git con ramas main (produccion) y develop (desarrollo)
#   - hook que hace copia a OneDrive en cada commit
#   - primera copia de seguridad
# Opcional: -RemoteUrl https://github.com/USUARIO/gym.git  para conectar con GitHub y publicar.
param([string]$RemoteUrl = "")

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Info($m) { Write-Host "  $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "  OK  $m" -ForegroundColor Green }

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "No encuentro git. Instalalo con:  winget install --id Git.Git -e" -ForegroundColor Red
  Write-Host "Cierra y vuelve a abrir la terminal y repite:  gym setup"
  exit 1
}

# Identidad de git (solo si no esta configurada)
if (-not (git config --global user.name)) {
  $n = Read-Host "Tu nombre para los commits"
  git config --global user.name "$n"
}
if (-not (git config --global user.email)) {
  $e = Read-Host "Tu email para los commits"
  git config --global user.email "$e"
}

if (-not (Test-Path ".git")) {
  git init -q
  git symbolic-ref HEAD refs/heads/main
  Ok "Repositorio creado"
} else { Info "El repositorio ya existia" }

git config core.hooksPath scripts/hooks
git config core.autocrlf false
Ok "Hook de copia automatica activado"

$hasCommits = $true
git rev-parse --verify HEAD 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { $hasCommits = $false }

if (-not $hasCommits) {
  git add -A
  git commit -q --no-verify -m "Version inicial 0.1.0"
  git tag v0.1.0
  Ok "Primer commit en main (v0.1.0)"
}

git show-ref --verify --quiet refs/heads/develop
if ($LASTEXITCODE -ne 0) { git branch develop; Ok "Rama develop creada" }
git checkout -q develop
Ok "Trabajando en la rama develop"

if ($RemoteUrl) {
  git remote get-url origin 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { git remote add origin $RemoteUrl } else { git remote set-url origin $RemoteUrl }
  git push -u origin main develop --tags
  Ok "Subido a $RemoteUrl"
}

& "$PSScriptRoot\backup.ps1"

Write-Host ""
Write-Host "Listo. Siguiente paso:  gym dev" -ForegroundColor Green
