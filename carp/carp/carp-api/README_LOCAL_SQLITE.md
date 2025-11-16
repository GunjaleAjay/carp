Local SQLite development

If you can't run MySQL locally or via Docker, you can run the backend against a lightweight SQLite DB for development.

Steps:
1. Install Node.js (LTS) so npm is available.
2. From `carp-api` run:
   npm install --no-audit --no-fund
   # optional dependency sqlite3 will be installed as an optionalDependency
3. Run migrations against the local environment:
   npx knex migrate:latest --knexfile knexfile.js --env local
4. Start the backend in local mode:
   npm run dev:local

This will create `carp-api/database/dev.sqlite3` and run the application using the same code paths; note that some MySQL-specific features may behave differently.
