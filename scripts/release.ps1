# Pasa lo que hay en develop a PRODUCCION (rama main):
#   1. Comprueba que estas en develop y sin cambios pendientes
#   2. Sube la version (patch por defecto: 0.1.0 -> 0.1.1) en app/js/version.js
#   3. Anade al CHANGELOG los commits desde la version anterior
#   4. Fusiona develop en main, crea la etiqueta vX.Y.Z y vuelve a develop
#   5. Si hay GitHub configurado, sube todo (y GitHub Pages publica la app)
# Uso:  gym release            (patch)
#       gym release minor      (0.1.3 -> 0.2.0)
#       gym release major      (0.2.0 -> 1.0.0)
param([ValidateSet("patch", "minor", "major")][string]$Bump = "patch")

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
function Fail($m) { Write-Host $m -ForegroundColor Red; exit 1 }

if ((git rev-parse --abbrev-ref HEAD) -ne "develop") { Fail "Tienes que estar en la rama develop:  git checkout develop" }
if (git status --porcelain) { Fail "Hay cambios sin guardar. Haz commit antes de publicar." }

$vf = Join-Path $Root "app\js\version.js"
$txt = Get-Content $vf -Raw
if ($txt -notmatch 'APP_VERSION = "(\d+)\.(\d+)\.(\d+)"') { Fail "No encuentro la version en app/js/version.js" }
$ma = [int]$Matches[1]; $mi = [int]$Matches[2]; $pa = [int]$Matches[3]
$old = "$ma.$mi.$pa"
switch ($Bump) { "major" { $ma++; $mi = 0; $pa = 0 } "minor" { $mi++; $pa = 0 } default { $pa++ } }
$new = "$ma.$mi.$pa"

$lastTag = git describe --tags --abbrev=0 main 2>$null
$range = if ($lastTag) { "$lastTag..develop" } else { "develop" }
$log = git log $range --no-merges --pretty=format:"- %s"
if (-not $log) { Fail "No hay commits nuevos en develop desde $lastTag." }

Write-Host ""
Write-Host "  Version $old -> $new" -ForegroundColor Cyan
Write-Host ($log -join "`n")
$ok = Read-Host "`n  Publicar en produccion? (s/n)"
if ($ok -ne "s") { Write-Host "Cancelado."; exit 0 }

$utf8 = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($vf, ($txt -replace 'APP_VERSION = "[^"]+"', "APP_VERSION = `"$new`""), $utf8)

$cl = Join-Path $Root "CHANGELOG.md"
$prev = if (Test-Path $cl) { [IO.File]::ReadAllText($cl, $utf8) } else { "# Cambios`n" }
$head, $rest = $prev -split "`n", 2
$entry = "`n## $new - $(Get-Date -Format 'yyyy-MM-dd')`n" + ($log -join "`n") + "`n"
[IO.File]::WriteAllText($cl, "$head`n$entry$rest", $utf8)

git add -A
git commit -q -m "Version $new"
git checkout -q main
git merge -q --no-ff develop -m "Publicar version $new"
git tag "v$new"
git checkout -q develop
git merge -q --ff-only main

git remote get-url origin 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
  git push origin main develop --tags
  Write-Host "  OK  Subido. GitHub Pages publicara la version $new en 1-2 minutos." -ForegroundColor Green
} else {
  Write-Host "  OK  Version $new en main. (Sin GitHub configurado: no se ha publicado en internet.)" -ForegroundColor Yellow
}
& "$PSScriptRoot\backup.ps1"
