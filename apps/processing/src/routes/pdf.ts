// ============================================================
// Nutri Atende — PDF Routes
// Generate PDFs for meal plans, receipts, and reports
// ============================================================

import type { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { renderFile } from '../templates/render.js';
import { generateMealPlanPDF } from '../services/pdf-generator.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function pdfRoutes(fastify: FastifyInstance) {
  // POST /api/pdf/plano-alimentar/:id — Generate meal plan PDF
  fastify.post<{ Params: { id: string } }>(
    '/plano-alimentar/:id',
    async (request, reply) => {
      const { id } = request.params;

      // Fetch plan with items
      const { data: plano, error: planoError } = await supabase
        .from('plano_alimentar')
        .select(
          `
          *,
          itens:plano_alimentar_item (*),
          paciente:paciente_id (nome, data_nascimento, sexo),
          nutricionista:nutricionista_id (nome),
          clinica:clinica_id (nome, configuracoes)
        `
        )
        .eq('id', id)
        .single();

      if (planoError || !plano) {
        return reply.status(404).send({ error: 'Plano não encontrado' });
      }

      try {
        const pdfBuffer = await generateMealPlanPDF(plano);

        reply
          .header('Content-Type', 'application/pdf')
          .header(
            'Content-Disposition',
            `attachment; filename="plano-alimentar-${plano.paciente?.nome?.replace(/\s+/g, '-').toLowerCase() || 'paciente'}.pdf"`
          )
          .send(pdfBuffer);
      } catch (err) {
        fastify.log.error(err);
        return reply
          .status(500)
          .send({ error: 'Erro ao gerar PDF' });
      }
    }
  );

  // POST /api/pdf/recibo/:id — Generate receipt PDF
  fastify.post<{ Params: { id: string } }>(
    '/recibo/:id',
    async (request, reply) => {
      const { id } = request.params;

      const { data: transacao, error } = await supabase
        .from('transacao_financeira')
        .select(
          `
          *,
          paciente:paciente_id (nome, cpf),
          clinica:clinica_id (nome, cnpj, endereco, configuracoes)
        `
        )
        .eq('id', id)
        .single();

      if (error || !transacao) {
        return reply
          .status(404)
          .send({ error: 'Transação não encontrada' });
      }

      // Generate receipt HTML and convert to PDF
      // For now, return a simple JSON response
      reply.send({
        message: 'Geração de recibo em desenvolvimento',
        transacao_id: id,
      });
    }
  );
}
