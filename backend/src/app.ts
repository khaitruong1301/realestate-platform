import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { inquiryRouter } from './modules/inquiries/inquiry.routes.js';
import { propertyRouter } from './modules/properties/property.routes.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // chạy sau nginx
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()) }));
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/properties', propertyRouter);
  app.use('/api', inquiryRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
