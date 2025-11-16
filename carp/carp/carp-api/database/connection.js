const knex = require('knex');
const knexConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment] || knexConfig.development;

const db = knex(config);

/**
 * Initialize database connection
 */
const initializeDatabase = async () => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    console.log('✅ Database connected successfully');
    
    // Run migrations in production
    if (environment === 'production') {
      await db.migrate.latest();
      console.log('✅ Database migrations completed');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

/**
 * Close database connection
 */
const closeDatabase = async () => {
  await db.destroy();
  console.log('✅ Database connection closed');
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

module.exports = {
  db,
  initializeDatabase,
  closeDatabase
};
