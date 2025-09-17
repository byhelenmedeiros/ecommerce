import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


import catalogRoutes from './routes/catalog.routes.js'; 
import wishlistRoutes from './routes/wishlist.routes.js'
import authRoutes from './routes/auth.routes.js'

export function createApp() {
  const app = express();

  // middlewares básicos
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // healthcheck
  app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

  // rotas
  app.use('/catalog', catalogRoutes);

  // 404
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  //auth
app.use(authRoutes);

  //wishlist
  app.use(wishlistRoutes);

 
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  });

  return app;
}
