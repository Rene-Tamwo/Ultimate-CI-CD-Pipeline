const request = require('supertest');
const { Pool } = require('pg');

// URL de l'API - sera override par les variables d'environnement en CI
const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_DB_CONFIG = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tododb',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

describe('Todo API Integration Tests', () => {
  let pool;

  beforeAll(async () => {
    pool = new Pool(TEST_DB_CONFIG);
    // Attendre que la base soit prête
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    await pool.end();
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
      .send({ title: 'Test Todo 1' });

    const response = await request(API_URL).get('/todos');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe('Test Todo 1');
  });
});
