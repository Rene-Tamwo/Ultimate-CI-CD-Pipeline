const app = require('../server.js');

const PORT = process.env.TEST_PORT || 3001; // Utiliser un port différent
const server = app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
});

// Gérer l'arrêt propre du serveur
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down test server...');
  server.close(() => {
    console.log('✅ Test server shut down');
    process.exit(0);
  });
});

// Exporter le server pour les tests
module.exports = server;
