const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.resolve(__dirname, '../infra/postgres-data');
const PORT = 5432;
const USER = 'sevazo';
const PASSWORD = 'sevazopassword';
const DBNAME = 'sevazo_db';

async function main() {
  console.log(`[Sevazo PG] Initializing PostgreSQL on port ${PORT}...`);
  console.log(`[Sevazo PG] Data directory: ${DATA_DIR}`);

  const ep = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    port: PORT,
    user: USER,
    password: PASSWORD,
    authMethod: 'password',
    persistent: true,
  });

  if (!fs.existsSync(DATA_DIR)) {
    console.log('[Sevazo PG] First-time setup: Initializing PostgreSQL database cluster...');
    await ep.initialise();
    console.log('[Sevazo PG] Database cluster initialized successfully.');
  }

  console.log('[Sevazo PG] Starting PostgreSQL daemon...');
  await ep.start();
  console.log(`[Sevazo PG] PostgreSQL is listening on localhost:${PORT}!`);

  try {
    await ep.createDatabase(DBNAME);
    console.log(`[Sevazo PG] Database '${DBNAME}' created or verified.`);
  } catch (err) {
    if (err.message && err.message.includes('already exists')) {
      console.log(`[Sevazo PG] Database '${DBNAME}' already exists.`);
    } else {
      console.log(`[Sevazo PG] Note on createDatabase: ${err.message}`);
    }
  }

  console.log('[Sevazo PG] Database connection URL:');
  console.log(`  postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DBNAME}?schema=public`);
  console.log('[Sevazo PG] Server is ready for backend connections!');

  // Keep process alive
  const shutdown = async () => {
    console.log('\n[Sevazo PG] Shutting down PostgreSQL gracefully...');
    try {
      await ep.stop();
      console.log('[Sevazo PG] PostgreSQL stopped.');
    } catch (e) {
      console.error('[Sevazo PG] Error stopping PostgreSQL:', e);
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[Sevazo PG] Fatal Error starting PostgreSQL:', err);
  process.exit(1);
});
