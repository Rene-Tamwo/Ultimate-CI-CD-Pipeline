const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

console.log('🚀 Starting Todo API...');
console.log('PORT:', port);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Configuration de la base de données avec meilleure gestion d'erreur
let pool;

try {
  if (process.env.DATABASE_URL) {
    // Production - utilise DATABASE_URL de Render
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    console.log('✅ Using Render PostgreSQL database');
  } else {
    // Développement local
    pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'tododb',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });
    console.log('✅ Using local PostgreSQL database');
  }
} catch (error) {
  console.error('❌ Database configuration failed:', error);
  process.exit(1);
}

// CORS permissif
app.use(cors());
app.use(express.json());

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo API is running! 🚀',
    database: process.env.DATABASE_URL ? 'Render PostgreSQL' : 'Local PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// Health check amélioré
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes todos avec gestion d'erreur
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('GET /todos error:', error);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

app.post('/todos', async (req, res) => {
  try {
    const { title, description = '' } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO todos (title, description, completed) VALUES ($1, $2, $3) RETURNING *',
      [title.trim(), description, false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('POST /todos error:', error);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Initialisation de la base de données (non bloquante)
async function initDatabase() {
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
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    // Ne pas arrêter l'application - juste logger l'erreur
  }
}

// Démarrer le serveur
app.listen(port, async () => {
  console.log(`✅ Todo API server running on port ${port}`);
  // Initialiser la DB en arrière-plan
  initDatabase().then(() => {
    console.log('📍 Health check available at: /health');
  });
});

module.exports = app;
