// ============================================================
// Nutri Atende — Processing Service (Fastify)
// Handles PDF generation, webhooks, background jobs
// ============================================================

import Fastify from 'fastify';
import dotenv from 'dotenv';
import { pdfRoutes } from './routes/pdf.js';
import { webhookRoutes } from './routes/webhooks.js';

dotenv.config();

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
});

// Health check
server.get('/health', async () => {
  return { status: 'ok', service: 'nutri-atende-processing', timestamp: new Date().toISOString() };
});

// Register routes
server.register(pdfRoutes, { prefix: '/api/pdf' });
server.register(webhookRoutes, { prefix: '/webhooks' });

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`🚀 Processing service running on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
