# Copia de seguridad del repositorio completo (todas las ramas, etiquetas e historial) en OneDrive.
# Genera un unico archivo .bundle. Para restaurar:  git clone "ruta\gym-AAAAMMDD-HHmmss.bundle" Gym
# El repositorio NO se guarda dentro de OneDrive a proposito: sincronizar la carpeta .git puede corromperla.
param([switch]$Quiet, [int]$Keep = 30)

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$od = $env:OneDrive
if (-not $od) { $od = $env:OneDriveConsumer }
if (-not $od) { $od = Join-Path $HOME "OneDrive" }
if (-not (Test-Path $od)) {
  if (-not $Quiet) { Write-Host "No encuentro la carpeta de OneDrive ($od). Copia no realizada." -ForegroundColor Yellow }
  exit 0
}

$dest = Join-Path $od "Copias de seguridad\Gym"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

git rev-parse --verify HEAD 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { exit 0 }

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$file = Join-Path $dest "gym-$stamp.bundle"
git bundle create "$file" --all 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "Fallo al crear la copia" -ForegroundColor Red; exit 1 }

# Mantener solo las ultimas $Keep copias
Get-ChildItem $dest -Filter "gym-*.bundle" | Sort-Object Name -Descending | Select-Object -Skip $Keep | Remove-Item -Force

if (-not $Quiet) { Write-Host "  OK  Copia en OneDrive: $file" -ForegroundColor Green }
