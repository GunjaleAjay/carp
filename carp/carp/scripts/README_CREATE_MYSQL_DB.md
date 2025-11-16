This helper creates the MySQL database required by the backend.

Usage:

- With Docker (recommended if you started the container with docker-compose):
  powershell -ExecutionPolicy Bypass -File .\scripts\create-mysql-db.ps1 -UseDocker

- With local mysql client installed:
  powershell -ExecutionPolicy Bypass -File .\scripts\create-mysql-db.ps1 -DbName carp -DbUser root -DbPassword patil

Notes:
- If you use a non-root user the script will attempt to grant privileges on the database.
- If the mysql client is not installed the script will fail and suggest running with -UseDocker.
- This script only creates the database and a grant for non-root users. You still need to run migrations and seeds.
