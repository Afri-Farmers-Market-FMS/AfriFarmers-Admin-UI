import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌱 AfriFarmers Backend API Server                       ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(10)}                        ║
║                                                           ║
║   API Endpoints:                                          ║
║   • Auth:      POST /api/auth/login, /register            ║
║   • Users:     GET/POST/PUT/DELETE /api/users             ║
║   • Farmers:   GET/POST/PUT/DELETE /api/farmers           ║
║   • Dashboard: GET /api/dashboard                         ║
║   • Analytics: GET /api/analytics                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
