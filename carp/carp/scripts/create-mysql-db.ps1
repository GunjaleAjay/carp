param(
    [string]$DbName = "carp",
    [string]$DbUser = "root",
    [string]$DbPassword = "patil",
    [switch]$UseDocker
)

# Create the SQL command to create database and user (if not root)
$createDbSql = "CREATE DATABASE IF NOT EXISTS \`"$DbName\`" CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if ($DbUser -ne "root") {
    $createDbSql += " GRANT ALL PRIVILEGES ON \`"$DbName\`".* TO '$DbUser'@'%' IDENTIFIED BY '$DbPassword'; FLUSH PRIVILEGES;"
}

Write-Host "Preparing to create database '$DbName'..."

if ($UseDocker) {
    # Try to find a running container with mysql or mariadb
    $mysqlContainer = docker ps --filter "ancestor=mysql" --format "{{.ID}}" | Select-Object -First 1
    if (-not $mysqlContainer) {
        $mysqlContainer = docker ps --filter "ancestor=mariadb" --format "{{.ID}}" | Select-Object -First 1
    }

    if (-not $mysqlContainer) {
        Write-Error "No running MySQL/MariaDB container found. Start the DB (scripts/start-mysql.ps1) or run without -UseDocker to use local mysql client."
        exit 2
    }

    Write-Host "Using docker exec into container $mysqlContainer to run SQL..."
    $escaped = $createDbSql.Replace('"','\"')
    $cmd = "docker exec -i $mysqlContainer sh -c \"mysql -u$DbUser -p\$DbPassword -e \`"$escaped\`"\""
    Write-Host $cmd
    iex $cmd
    exit $LASTEXITCODE
} else {
    # Use local mysql client
    $mysqlExists = Get-Command mysql -ErrorAction SilentlyContinue
    if (-not $mysqlExists) {
        Write-Error "mysql client not found in PATH. Install the mysql cli or run with -UseDocker after starting a container."
        exit 3
    }

    $cmd = "mysql -u$DbUser -p$DbPassword -e \"$createDbSql\""
    Write-Host "Running: $cmd"
    iex $cmd
    exit $LASTEXITCODE
}
