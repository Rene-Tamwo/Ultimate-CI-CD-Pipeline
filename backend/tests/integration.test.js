const request = require('supertest');
const { Pool } = require('pg');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_DB_CONFIG = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tododb_test',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

describe('Todo API Integration Tests', () => {
  let pool;

  beforeAll(async () => {
    pool = new Pool(TEST_DB_CONFIG);
    
    // Initialiser la table de test
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
      console.log('✅ Test database table ready');
    } catch (error) {
      console.error('❌ Test database setup failed:', error);
      throw error;
    }
    
    // Attendre que la BDD soit prête
    await new Promise(resolve => setTimeout(resolve, 2000));
  }, 15000);

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  beforeEach(async () => {
    // Nettoyer la table avant chaque test
    await pool.query('DELETE FROM todos');
  });

  test('GET /health should return 200 and database status', async () => {
    const response = await request(API_URL).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body.database).toBe('connected');
  });

  test('POST /todos should create a new todo', async () => {
    const newTodo = { title: 'Test Todo', description: 'Test Description' };
    
    const response = await request(API_URL)
      .post('/todos')
      .set('Content-Type', 'application/json') // ← AJOUT IMPORTANT
      .set('Accept', 'application/json')       // ← AJOUT IMPORTANT
      .send(newTodo);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(newTodo.title);
    expect(response.body.description).toBe(newTodo.description);
    expect(response.body.completed).toBe(false);
    expect(response.body.id).toBeDefined();
  });

  test('GET /todos should return all todos', async () => {
    // Créer un todo d'abord
    await request(API_URL)
      .post('/todos')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({ title: 'Test Todo 1' });

    const response = await request(API_URL).get('/todos');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe('Test Todo 1');
  });
});
