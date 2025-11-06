const request = require('supertest');

const API_URL = process.env.API_URL || 'http://localhost:3000';

describe('Regression Tests', () => {
  // Test que les fonctionnalités existantes ne sont pas cassées
  test('Health endpoint should always work', async () => {
    const response = await request(API_URL).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  test('Todos endpoint structure should remain consistent', async () => {
    const response = await request(API_URL).get('/todos');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Si des todos existent, vérifier la structure
    if (response.body.length > 0) {
      const todo = response.body[0];
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('title');
      expect(todo).toHaveProperty('completed');
      expect(todo).toHaveProperty('created_at');
    }
  });
});
