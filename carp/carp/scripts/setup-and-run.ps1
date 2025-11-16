<#
Setup script for Carbon-Aware Route Planner
- Creates the MySQL database if missing
- Copies backend env.template to .env and updates DB values
- Installs backend dependencies, runs migrations and seeds
- Optionally installs and starts frontend dev server

Usage:
  Open PowerShell as a normal user (not required to run as Admin).
  From project root (where this script is located):
    powershell -ExecutionPolicy Bypass -File .\scripts\setup-and-run.ps1

Parameters:
  -DbHost (default: localhost)
  -DbPort (default: 3306)
  -DbUser (default: root)
  -DbName (default: carp)
  -RunFrontend (switch) : also install & start frontend dev server

Security:
  The script will prompt you for the MySQL password (hidden input). Avoid passing passwords on the command line.
#>
param(
    [string]$DbHost = 'localhost',
    [int]$DbPort = 3306,
    [string]$DbUser = 'root',
    [string]$DbName = 'carp',
    [switch]$RunFrontend
)

function Write-Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Success($m){ Write-Host "[OK]   $m" -ForegroundColor Green }
function Write-Err($m){ Write-Host "[ERR]  $m" -ForegroundColor Red }

# Prompt for MySQL password securely
$securePwd = Read-Host -Prompt "MySQL password for user '$DbUser'" -AsSecureString
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd)
$plainPwd = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)

# Paths
$repoRoot = Resolve-Path "..\" -Relative | Split-Path -Parent
# Try to detect script location relative to repo root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir "..")
$projectRoot = $projectRoot.Path

$backendDir = Join-Path $projectRoot 'carp-api'
$frontendDir = Join-Path $projectRoot 'carp-ui'

Write-Info "Project root: $projectRoot"
Write-Info "Backend dir: $backendDir"
Write-Info "Frontend dir: $frontendDir"

# 1) Create database (requires MySQL client 'mysql' in PATH)
Write-Info ("Ensuring database '{0}' exists on {1}:{2} (if mysql CLI is available)..." -f $DbName, $DbHost, $DbPort)

# Check for mysql CLI
$mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
if ($null -ne $mysqlCmd) {
    Write-Info "mysql CLI found. Creating database if needed..."
    $sql = "CREATE DATABASE IF NOT EXISTS $DbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    $mysqlArgs = @('-u', $DbUser, ("-p{0}" -f $plainPwd), '-h', $DbHost, '-P', $DbPort.ToString(), '-e', $sql)
    try {
        $createOut = & mysql @mysqlArgs 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Err "mysql client returned error: $createOut"
            Write-Err "Ensure 'mysql' CLI is installed and accessible from PATH. You can create the DB manually or run a MySQL container."
            exit 1
        } else { Write-Success "Database created or already exists." }
    } catch {
        Write-Err "Failed to run mysql client: $_"
        exit 1
    }
} else {
    Write-Info "mysql CLI not found. Skipping automatic DB creation."
    Write-Info "If the database '$DbName' does not exist you must create it manually or start a MySQL container before running migrations."
}

# 2) Copy and update backend .env
$envTemplate = Join-Path $backendDir 'env.template'
$envTarget = Join-Path $backendDir '.env'
if (-Not (Test-Path $envTemplate)) {
    Write-Err "env.template not found at $envTemplate"
} else {
    Write-Info "Creating backend .env at $envTarget"
    $envContent = Get-Content $envTemplate -Raw
    $envContent = [regex]::Replace($envContent, 'DB_HOST=.*', "DB_HOST=$DbHost")
    $envContent = [regex]::Replace($envContent, 'DB_PORT=.*', "DB_PORT=$($DbPort.ToString())")
    $envContent = [regex]::Replace($envContent, 'DB_USER=.*', "DB_USER=$DbUser")
    # Put password in quotes in .env to preserve special characters
    $envContent = [regex]::Replace($envContent, 'DB_PASSWORD=.*', "DB_PASSWORD=\"$plainPwd\"")
    $envContent = [regex]::Replace($envContent, 'DB_NAME=.*', "DB_NAME=$DbName")
    $envContent = [regex]::Replace($envContent, 'FRONTEND_URL=.*', 'FRONTEND_URL=http://localhost:5173')
    Set-Content -Path $envTarget -Value $envContent -Encoding UTF8
    Write-Success "Backend .env written (review and set JWT_SECRET and GOOGLE_MAPS_API_KEY before production)."
}

# --- Prerequisite checks -------------------------------------------------
function Suggest-InstallNode {
    Write-Host "Node.js / npm not found. Install Node.js LTS and re-run this script." -ForegroundColor Yellow
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  1) Download installer: https://nodejs.org (choose LTS)" -ForegroundColor Yellow
    Write-Host "  2) Install via winget (Admin): winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements" -ForegroundColor Yellow
}

function Suggest-InstallDocker {
    Write-Host "Docker not found. Install Docker Desktop and start it to use the included docker-compose DB helper." -ForegroundColor Yellow
    Write-Host "Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
}

# Check for Node/npm before attempting installs
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
if ($null -eq $nodeCmd -or $null -eq $npmCmd) {
    Write-Err "node/npm not found in PATH. Aborting before running npm install."
    Suggest-InstallNode
    exit 2
}

# Check for Docker (not required but helpful)
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if ($null -eq $dockerCmd) {
    Write-Info "Docker CLI not found. You can still run migrations if your DB is reachable, or install Docker to launch a MySQL container using scripts/start-mysql.ps1." 
}

# Check DB connectivity before running migrations
function Test-DbConnection {
    param($host, $port)
    try {
        $res = Test-NetConnection -ComputerName $host -Port $port -WarningAction SilentlyContinue
        return $res.TcpTestSucceeded
    } catch {
        return $false
    }
}

if (-not (Test-DbConnection -host $DbHost -port $DbPort)) {
    Write-Err "Cannot reach database at $DbHost:$DbPort. Ensure MySQL is running and accessible (start Docker or create DB manually)."
    Write-Host "To start DB with Docker (if Docker Desktop installed): powershell -File .\scripts\start-mysql.ps1" -ForegroundColor Yellow
    Write-Host "Or create DB manually using mysql client: mysql -u $DbUser -p -e \"CREATE DATABASE IF NOT EXISTS $DbName;\"" -ForegroundColor Yellow
    # Continue: npm install may still be useful locally, but migrations will fail until DB is reachable.
}

# 3) Install backend deps
Write-Info "Installing backend dependencies (this may take a few minutes)..."
Push-Location $backendDir
try {
    $npmOut = & npm install 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "npm install failed. Output:`n$npmOut"
        Pop-Location
        exit 1
    } else { Write-Success "Backend dependencies installed." }
} catch {
    Write-Err "Failed to run npm install: $_"
    Pop-Location
    exit 1
}

# 4) Run migrations
Write-Info "Running Knex migrations..."
try {
    $mOut = & npx knex migrate:latest --knexfile knexfile.js 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "knex migrate failed: $mOut"
        Pop-Location
        exit 1
    } else { Write-Success "Migrations completed." }
} catch {
    Write-Err "Failed to run migrations: $_"
    Pop-Location
    exit 1
}

# 5) Run seeds
Write-Info "Running Knex seeds..."
try {
    $sOut = & npx knex seed:run --knexfile knexfile.js 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "knex seed failed: $sOut"
        # continue even if seeds fail
    } else { Write-Success "Seeds completed." }
} catch {
    Write-Err "Failed to run seeds: $_"
}

# Optionally start backend (in new PowerShell window)
Write-Info "Starting backend dev server in a new PowerShell window..."
$startCmd = "cd '$backendDir'; npm run dev"
Start-Process -FilePath powershell -ArgumentList '-NoExit', '-Command', $startCmd -WindowStyle Normal -ErrorAction SilentlyContinue
Pop-Location

# 6) Frontend setup (if requested)
if ($RunFrontend) {
    Write-Info "Setting up frontend..."
    if (-Not (Test-Path $frontendDir)) { Write-Err "Frontend directory not found: $frontendDir" }
    else {
        # create Vite env
        $frontendEnv = Join-Path $frontendDir '.env'
        Set-Content -Path $frontendEnv -Value "VITE_API_URL=http://localhost:3001/api" -Encoding UTF8
        Push-Location $frontendDir
        try {
            $npmOut2 = & npm install 2>&1
            if ($LASTEXITCODE -ne 0) { Write-Err "Frontend npm install failed: $npmOut2"; Pop-Location; exit 1 }
            else { Write-Success "Frontend dependencies installed." }
        } catch {
            Write-Err "Failed to run front npm install: $_"; Pop-Location; exit 1
        }
    Write-Info "Starting frontend dev server in a new PowerShell window..."
    $startFront = "cd '$frontendDir'; npm run dev"
    Start-Process -FilePath powershell -ArgumentList '-NoExit', '-Command', $startFront -WindowStyle Normal -ErrorAction SilentlyContinue
        Pop-Location
    }
}

Write-Success "Setup script finished. Backend should be running at http://localhost:3001 and frontend (if started) at the Vite URL shown in the terminal."

# Clear plainPwd variable from memory
$plainPwd = ''
[System.GC]::Collect()

