const request = require('supertest');
const { Pool } = require('pg');
const startTestServer = require('../scripts/start-test-server');

const TEST_DB_CONFIG = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tododb_test',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

describe('Todo API Integration Tests', () => {
  let pool;
  let server;
  let baseUrl;

  beforeAll(async () => {
    // Démarrer le serveur de test
    server = await startTestServer();
    baseUrl = `http://localhost:${process.env.TEST_PORT || 3001}`;

    // Pool pour les opérations de base de données
    pool = new Pool(TEST_DB_CONFIG);
    
    // Attendre que le serveur soit prêt
    await new Promise(resolve => setTimeout(resolve, 2000));
  }, 30000);

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(async () => {
    // Nettoyer la table avant chaque test
    if (pool) {
      await pool.query('DELETE FROM todos');
    }
  });

  test('GET /health should return 200 and database status', async () => {
    const response = await request(baseUrl).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body.database).toBe('connected');
  });

  test('POST /todos should create a new todo', async () => {
    const newTodo = { title: 'Test Todo', description: 'Test Description' };
    
    const response = await request(baseUrl)
      .post('/todos')
      .set('Content-Type', 'application/json')
      .send(newTodo);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(newTodo.title);
    expect(response.body.description).toBe(newTodo.description);
    expect(response.body.completed).toBe(false);
    expect(response.body.id).toBeDefined();
  });

  test('GET /todos should return all todos', async () => {
    // Créer un todo d'abord
    await request(baseUrl)
      .post('/todos')
      .set('Content-Type', 'application/json')
      .send({ title: 'Test Todo 1' });

    const response = await request(baseUrl).get('/todos');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe('Test Todo 1');
  });
});
