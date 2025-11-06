const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tododb_test',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function initTestDatabase() {
  try {
    console.log('🔄 Initializing test database...');
    
    // Créer la table todos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Test database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initTestDatabase();
