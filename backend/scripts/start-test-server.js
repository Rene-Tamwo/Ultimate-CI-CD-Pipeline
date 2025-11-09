// Importe l'app depuis server.js
const app = require('../server.js');
const { Pool } = require('pg');

const TEST_DB_CONFIG = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tododb_test',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

// Fonction d'initialisation de la BDD de test
async function initTestDatabase() {
  const pool = new Pool(TEST_DB_CONFIG);
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Test database initialized');
  } catch (error) {
    console.error('❌ Test database initialization failed:', error);
  } finally {
    await pool.end();
  }
}

const PORT = process.env.TEST_PORT || 3001;

// Démarrer le serveur de test
const startTestServer = async () => {
  await initTestDatabase();
  
  const server = app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}`);
  });

  // Gestion propre de l'arrêt
  process.on('SIGTERM', () => {
    console.log('🛑 Shutting down test server...');
    server.close(() => {
      console.log('✅ Test server shut down');
      process.exit(0);
    });
  });

  return server;
};

// Démarrer immédiatement si exécuté directement
if (require.main === module) {
  startTestServer();
}

module.exports = startTestServer;
