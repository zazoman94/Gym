# Version de DESARROLLO: sirve la carpeta app/ en http://localhost:5173
# - Sin cache (no se registra el service worker): siempre ves el ultimo codigo.
# - Datos separados de produccion (banda naranja "DESARROLLO").
# - Si tienes Python, tambien accesible desde el movil en la misma wifi (http://IP-del-PC:5173).
param([int]$Port = 5173)

$Root = Split-Path -Parent $PSScriptRoot
$App = Join-Path $Root "app"
Set-Location $Root

$branch = git rev-parse --abbrev-ref HEAD 2>$null
if ($branch -and $branch -ne "develop") {
  Write-Host "Aviso: estas en la rama '$branch'. Para desarrollar usa:  git checkout develop" -ForegroundColor Yellow
}

$ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object { $_.IPAddress -match '^(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))' -and $_.PrefixOrigin -ne 'WellKnown' } |
  Select-Object -First 1).IPAddress

$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) { $py = Get-Command py -ErrorAction SilentlyContinue }

Write-Host ""
Write-Host "  Gym DESARROLLO" -ForegroundColor Yellow
Write-Host "  PC:     http://localhost:$Port"
if ($py -and $ip) { Write-Host "  Movil:  http://${ip}:$Port   (misma wifi; acepta el aviso del firewall)" }
Write-Host "  Ctrl+C para parar"
Write-Host ""
Start-Process "http://localhost:$Port"

if ($py) {
  & $py.Source -m http.server $Port --bind 0.0.0.0 --directory "$App"
  exit
}

# Sin Python: servidor minimo de PowerShell (solo en este PC)
$mime = @{ ".html"="text/html; charset=utf-8"; ".js"="text/javascript; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".json"="application/json"; ".webmanifest"="application/manifest+json"; ".svg"="image/svg+xml"; ".png"="image/png" }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
try {
  while ($l.IsListening) {
    $ctx = $l.GetContext()
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($path -eq "") { $path = "index.html" }
    $file = Join-Path $App $path
    $full = [IO.Path]::GetFullPath($file)
    if ($full.StartsWith([IO.Path]::GetFullPath($App)) -and (Test-Path $full -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $ctx.Response.ContentType = $(if ($mime[$ext]) { $mime[$ext] } else { "application/octet-stream" })
      $ctx.Response.Headers.Add("Cache-Control", "no-store")
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else { $ctx.Response.StatusCode = 404 }
    $ctx.Response.Close()
  }
} finally { $l.Stop() }
