# Starts MySQL via docker-compose if Docker is available
$dc = Get-Command docker -ErrorAction SilentlyContinue
if ($null -eq $dc) {
  Write-Host "Docker not found. Please install Docker Desktop and try again." -ForegroundColor Red
  exit 1
}

$compose = Get-Command docker-compose -ErrorAction SilentlyContinue
if ($null -eq $compose) {
  Write-Host "Using 'docker compose' (Docker CLI v2) to start services..." -ForegroundColor Cyan
  docker compose up -d db
} else {
  Write-Host "Using 'docker-compose' to start services..." -ForegroundColor Cyancd
  docker-compose up -d db
}

Write-Host "Waiting 10s for MySQL to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10
Write-Host "Done. MySQL (carp) should be available on localhost:3306" -ForegroundColor Green
