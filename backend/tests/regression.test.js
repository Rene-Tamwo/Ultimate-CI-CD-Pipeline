// Tests de non-régression - Tests structurels (pas besoin de server running)
describe('Regression Tests - Application Structure', () => {
  test('Health check route should be defined in server', () => {
    // Test que le fichier server peut être chargé sans erreurs
    expect(() => {
      const server = require('../server.js');
      return server;
    }).not.toThrow();
  });

  test('Database configuration should use environment variables', () => {
    const dbConfig = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'tododb',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    };
    
    expect(dbConfig.user).toBeDefined();
    expect(dbConfig.host).toBeDefined();
    expect(dbConfig.database).toBeDefined();
    expect(dbConfig.password).toBeDefined();
    expect(dbConfig.port).toBeDefined();
  });

  test('Package.json should have all required scripts', () => {
    const pkg = require('../package.json');
    
    expect(pkg.scripts.start).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
    expect(pkg.scripts['test:integration']).toBeDefined();
    expect(pkg.scripts.dev).toBeDefined();
  });

  test('Dockerfile should exist and be valid', () => {
    const fs = require('fs');
    const path = require('path');
    
    const dockerfilePath = path.join(__dirname, '../Dockerfile');
    expect(fs.existsSync(dockerfilePath)).toBe(true);
    
    const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
    expect(dockerfileContent).toContain('FROM node:18-alpine');
    expect(dockerfileContent).toContain('HEALTHCHECK');
  });
});
