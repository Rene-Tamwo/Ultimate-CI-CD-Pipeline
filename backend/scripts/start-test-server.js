const app = require('../server.js');

const PORT = process.env.TEST_PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
});

// Gérer l'arrêt propre
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down test server...');
  server.close(() => {
    console.log('✅ Test server shut down');
    process.exit(0);
  });
});

module.exports = server;
