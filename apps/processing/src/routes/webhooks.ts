// ============================================================
// Nutri Atende — Webhook Routes
// Receives data from external devices (Withings, Apple Health, etc.)
// ============================================================

import type { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function webhookRoutes(fastify: FastifyInstance) {
  // POST /webhooks/withings — Receive weight and body composition data
  fastify.post('/withings', async (request, reply) => {
    const body = request.body as any;

    // Withings webhook format
    // In production, verify the webhook signature
    fastify.log.info({ type: 'withings', body }, 'Received Withings webhook');

    // Process weight measurements
    if (body.measuregrps) {
      for (const group of body.measuregrps) {
        for (const measure of group.measures) {
          if (measure.type === 1) {
            // Weight
            const weightKg = measure.value / 1000;
            fastify.log.info({ weightKg, userId: body.userid });
            // Store in database, map to patient via device integration
          }
        }
      }
    }

    reply.send({ status: 'ok' });
  });

  // POST /webhooks/dexcom — Receive continuous glucose monitoring data
  fastify.post('/dexcom', async (request, reply) => {
    const body = request.body as any;

    fastify.log.info({ type: 'dexcom' }, 'Received Dexcom webhook');

    if (body glucose_records) {
      for (const record of body.glucose_records) {
        fastify.log.info({
          value: record.value,
          timestamp: record.system_time,
          trend: record.trend,
        });
      }
    }

    reply.send({ status: 'ok' });
  });

  // POST /webhooks/freestyle-libre — Receive FreeStyle Libre data
  fastify.post('/freestyle-libre', async (request, reply) => {
    const body = request.body as any;

    fastify.log.info({ type: 'freestyle_libre' }, 'Received FreeStyle Libre webhook');

    reply.send({ status: 'ok' });
  });

  // POST /webhooks/apple-health — Receive Apple Health data via relay
  fastify.post('/apple-health', async (request, reply) => {
    const body = request.body as any;

    fastify.log.info({ type: 'apple_health' }, 'Received Apple Health data');

    if (body.steps) {
      // Store step count
      fastify.log.info({ steps: body.steps, date: body.date });
    }

    if (body.active_energy) {
      // Store active energy burned
      fastify.log.info({ calories: body.active_energy, date: body.date });
    }

    reply.send({ status: 'ok' });
  });
}
