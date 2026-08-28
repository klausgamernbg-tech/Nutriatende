// ============================================================
// Nutri Atende — Webhook Routes
// Receives data from external devices (Withings, Apple Health, etc.)
// ============================================================

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import {
  verifyWithingsSignature,
  verifyDexcomSignature,
  verifyFreeStyleSignature,
  verifyAppleHealthSignature,
} from '../lib/webhook-verify.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Type augmentation for rawBody
declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: string;
  }
}

function getRawBody(request: FastifyRequest): string {
  return request.rawBody || JSON.stringify(request.body);
}

async function findPatientByDevice(fastify: FastifyInstance, deviceType: string, externalUserId: string) {
  const { data: dispositivo } = await supabase
    .from('dispositivo_integracao')
    .select('paciente_id')
    .eq('tipo', deviceType)
    .eq('fabricante', externalUserId)
    .eq('ativo', true)
    .single();

  return dispositivo?.paciente_id;
}

export async function webhookRoutes(fastify: FastifyInstance) {
  // POST /webhooks/withings — Receive weight and body composition data
  fastify.post('/withings', async (request, reply) => {
    const body = request.body as any;
    const rawBody = getRawBody(request);

    // Verify Withings signature
    const withingsSecret = process.env.WITHINGS_WEBHOOK_SECRET;
    const signature = request.headers['x-withings-signature'] as string;
    
    if (withingsSecret && signature) {
      if (!verifyWithingsSignature(rawBody, signature, withingsSecret)) {
        fastify.log.warn('Invalid Withings signature');
        return reply.code(401).send({ error: 'Invalid signature' });
      }
    } else if (withingsSecret && !signature) {
      fastify.log.warn('Missing Withings signature');
      return reply.code(401).send({ error: 'Missing signature' });
    }

    fastify.log.info({ type: 'withings', body }, 'Received Withings webhook');

    const pacienteId = await findPatientByDevice(fastify, 'balanza', String(body.userid));

    if (!pacienteId) {
      fastify.log.warn({ userId: body.userid }, 'No patient found for Withings user');
      return reply.send({ status: 'ok', message: 'Patient not mapped' });
    }

    if (body.measuregrps) {
      for (const group of body.measuregrps) {
        const measureData: Record<string, number> = {};

        for (const measure of group.measures) {
          // Withings measure types: 1=weight, 5=fat mass, 6=muscle mass, 8=bone mass, 76=heart rate, 77=spo2
          switch (measure.type) {
            case 1:
              measureData.peso = measure.value / 1000; // grams to kg
              break;
            case 5:
              measureData.percentual_gordura = measure.value / 1000; // kg
              break;
            case 6:
              measureData.massa_magra = measure.value / 1000; // kg
              break;
            case 8:
              // bone mass - could store in detalhes_metodo
              break;
          }
        }

        if (measureData.peso) {
          // Get patient's current height to calculate IMC
          const { data: paciente } = await supabase
            .from('paciente')
            .select('altura')
            .eq('id', pacienteId)
            .single();

          const imc = paciente?.altura
            ? Math.round((measureData.peso / (paciente.altura * paciente.altura)) * 100) / 100
            : null;

          // Create medidas record
          const { error } = await supabase.from('medidas').insert({
            paciente_id: pacienteId,
            consulta_id: null, // Will be linked later if needed
            data_avaliacao: new Date(group.date * 1000).toISOString(),
            peso: measureData.peso,
            percentual_gordura: measureData.percentual_gordura,
            massa_magra: measureData.massa_magra,
            imc,
            metodo_avaliacao: 'bioimpedancia',
            detalhes_metodo: { source: 'withings', group_id: group.grpid },
          });

          if (error) {
            fastify.log.error({ error, pacienteId }, 'Failed to save Withings measures');
          } else {
            fastify.log.info({ pacienteId, peso: measureData.peso }, 'Saved Withings weight');
          }
        }
      }
    }

    // Update last sync time
    await supabase
      .from('dispositivo_integracao')
      .update({ ultimo_sync: new Date().toISOString() })
      .eq('fabricante', String(body.userid))
      .eq('tipo', 'balanza');

    reply.send({ status: 'ok' });
  });

  // POST /webhooks/dexcom — Receive continuous glucose monitoring data
  fastify.post('/dexcom', async (request, reply) => {
    const body = request.body as any;
    const rawBody = getRawBody(request);

    // Verify Dexcom signature
    const dexcomSecret = process.env.DEXCOM_WEBHOOK_SECRET;
    const signature = request.headers['authorization'] as string;
    
    if (dexcomSecret && signature) {
      if (!verifyDexcomSignature(rawBody, signature, dexcomSecret)) {
        fastify.log.warn('Invalid Dexcom signature');
        return reply.code(401).send({ error: 'Invalid signature' });
      }
    } else if (dexcomSecret && !signature) {
      fastify.log.warn('Missing Dexcom signature');
      return reply.code(401).send({ error: 'Missing signature' });
    }

    fastify.log.info({ type: 'dexcom' }, 'Received Dexcom webhook');

    // Dexcom sends patient ID in different ways depending on integration
    // For now, we'll look for a patient_id in the body or headers
    const externalUserId = body.userId || body.patientId || request.headers['x-dexcom-user-id'];
    
    if (!externalUserId) {
      fastify.log.warn('No user ID in Dexcom webhook');
      return reply.send({ status: 'ok', message: 'No user ID' });
    }

    const pacienteId = await findPatientByDevice(fastify, 'cgm', String(externalUserId));

    if (!pacienteId) {
      fastify.log.warn({ externalUserId }, 'No patient found for Dexcom user');
      return reply.send({ status: 'ok', message: 'Patient not mapped' });
    }

    if (body.glucose_records) {
      for (const record of body.glucose_records) {
        const { error } = await supabase.from('diario_glicemia').insert({
          paciente_id: pacienteId,
          data_hora: new Date(record.system_time).toISOString(),
          glicemia: record.value,
          tipo: record.trend ? `trend_${record.trend}` : 'cgm',
          origem: 'dexcom',
        });

        if (error) {
          fastify.log.error({ error, pacienteId }, 'Failed to save Dexcom glucose');
        }
      }
      fastify.log.info({ pacienteId, count: body.glucose_records.length }, 'Saved Dexcom glucose records');
    }

    await supabase
      .from('dispositivo_integracao')
      .update({ ultimo_sync: new Date().toISOString() })
      .eq('fabricante', String(externalUserId))
      .eq('tipo', 'cgm');

    reply.send({ status: 'ok' });
  });

  // POST /webhooks/freestyle-libre — Receive FreeStyle Libre data
  fastify.post('/freestyle-libre', async (request, reply) => {
    const body = request.body as any;
    const rawBody = getRawBody(request);

    // Verify FreeStyle Libre signature
    const libreSecret = process.env.FREESTYLE_WEBHOOK_SECRET;
    const signature = request.headers['x-libre-signature'] as string;
    
    if (libreSecret && signature) {
      if (!verifyFreeStyleSignature(rawBody, signature, libreSecret)) {
        fastify.log.warn('Invalid FreeStyle signature');
        return reply.code(401).send({ error: 'Invalid signature' });
      }
    } else if (libreSecret && !signature) {
      fastify.log.warn('Missing FreeStyle signature');
      return reply.code(401).send({ error: 'Missing signature' });
    }

    fastify.log.info({ type: 'freestyle_libre' }, 'Received FreeStyle Libre webhook');

    const externalUserId = body.userId || request.headers['x-libre-user-id'];
    
    if (!externalUserId) {
      return reply.send({ status: 'ok', message: 'No user ID' });
    }

    const pacienteId = await findPatientByDevice(fastify, 'glicometro', String(externalUserId));

    if (!pacienteId) {
      fastify.log.warn({ externalUserId }, 'No patient found for FreeStyle user');
      return reply.send({ status: 'ok', message: 'Patient not mapped' });
    }

    // FreeStyle Libre typically sends glucose readings array
    if (body.glucose_readings) {
      for (const record of body.glucose_readings) {
        const { error } = await supabase.from('diario_glicemia').insert({
          paciente_id: pacienteId,
          data_hora: new Date(record.timestamp).toISOString(),
          glicemia: record.value,
          tipo: 'flash',
          origem: 'freestyle_libre',
        });

        if (error) {
          fastify.log.error({ error, pacienteId }, 'Failed to save FreeStyle glucose');
        }
      }
      fastify.log.info({ pacienteId, count: body.glucose_readings.length }, 'Saved FreeStyle glucose records');
    }

    await supabase
      .from('dispositivo_integracao')
      .update({ ultimo_sync: new Date().toISOString() })
      .eq('fabricante', String(externalUserId))
      .eq('tipo', 'glicometro');

    reply.send({ status: 'ok' });
  });

  // POST /webhooks/apple-health — Receive Apple Health data via relay
  fastify.post('/apple-health', async (request, reply) => {
    const body = request.body as any;
    const rawBody = getRawBody(request);

    // Verify Apple Health signature
    const appleSecret = process.env.APPLE_HEALTH_WEBHOOK_SECRET;
    const signature = request.headers['x-apple-signature'] as string;
    
    if (appleSecret && signature) {
      if (!verifyAppleHealthSignature(rawBody, signature, appleSecret)) {
        fastify.log.warn('Invalid Apple Health signature');
        return reply.code(401).send({ error: 'Invalid signature' });
      }
    } else if (appleSecret && !signature) {
      fastify.log.warn('Missing Apple Health signature');
      return reply.code(401).send({ error: 'Missing signature' });
    }

    fastify.log.info({ type: 'apple_health' }, 'Received Apple Health data');

    const externalUserId = body.userId || request.headers['x-apple-user-id'];
    
    if (!externalUserId) {
      return reply.send({ status: 'ok', message: 'No user ID' });
    }

    const pacienteId = await findPatientByDevice(fastify, 'monitor_atividade', String(externalUserId));

    if (!pacienteId) {
      fastify.log.warn({ externalUserId }, 'No patient found for Apple Health user');
      return reply.send({ status: 'ok', message: 'Patient not mapped' });
    }

    const today = body.date || new Date().toISOString().split('T')[0];

    if (body.steps) {
      const { error } = await supabase.from('diario_atividade').upsert({
        paciente_id: pacienteId,
        data: today,
        passos: body.steps,
        origem: 'apple_health',
      }, { onConflict: 'paciente_id,data,origem' });

      if (error) {
        fastify.log.error({ error, pacienteId }, 'Failed to save Apple Health steps');
      }
    }

    if (body.active_energy) {
      const { error } = await supabase.from('diario_atividade').upsert({
        paciente_id: pacienteId,
        data: today,
        calorias_queimadas: body.active_energy,
        origem: 'apple_health',
      }, { onConflict: 'paciente_id,data,origem' });

      if (error) {
        fastify.log.error({ error, pacienteId }, 'Failed to save Apple Health active energy');
      }
    }

    if (body.sleep_minutes) {
      const { error } = await supabase.from('diario_atividade').upsert({
        paciente_id: pacienteId,
        data: today,
        sono_minutos: body.sleep_minutes,
        origem: 'apple_health',
      }, { onConflict: 'paciente_id,data,origem' });

      if (error) {
        fastify.log.error({ error, pacienteId }, 'Failed to save Apple Health sleep');
      }
    }

    await supabase
      .from('dispositivo_integracao')
      .update({ ultimo_sync: new Date().toISOString() })
      .eq('fabricante', String(externalUserId))
      .eq('tipo', 'monitor_atividade');

    reply.send({ status: 'ok' });
  });
}
