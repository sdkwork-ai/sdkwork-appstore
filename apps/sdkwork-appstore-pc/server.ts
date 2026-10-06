import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security headers & body parsing
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Body parsing is scoped to the express-owned /api routes. A global
  // express.json() would consume request bodies before the Vite middleware
  // proxies them, and the gateway proxy then streams an already-consumed
  // request: every POST/PUT to the gateway hangs until timeout.
  app.use('/api', express.json({ limit: '10mb' }));

  // --- API Health Endpoint ---
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SDKWork AppStore PC Enterprise Server',
      version: '2.5.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  });

  // --- Vite middleware for dev or static server for production ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SDKWork AppStore PC Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
