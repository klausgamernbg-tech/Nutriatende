// ============================================================
// Nutri Atende — API: /api/consultas/[id]/status
// Update consultation status
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { getAuthUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const updateStatusSchema = z.object({
  status: z.enum(['agendada', 'confirmada', 'realizada', 'cancelada', 'nao_compareceu']),
  motivo_cancelamento: z.string().max(500).optional(),
});

// PUT /api/consultas/[id]/status — Update consultation status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const parsed = updateStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // If cancelling, require motivo_cancelamento
  if (parsed.data.status === 'cancelada' && !parsed.data.motivo_cancelamento) {
    return NextResponse.json(
      { error: 'Motivo do cancelamento é obrigatório' },
      { status: 400 }
    );
  }

  const updateData: any = { status: parsed.data.status };
  if (parsed.data.motivo_cancelamento) {
    updateData.observacoes = parsed.data.motivo_cancelamento;
  }

  const admin = createAdminClient();
  const { data, error: updateError } = await admin
    .from('consulta')
    .update(updateData)
    .eq('id', params.id)
    .eq('clinica_id', auth.clinicaId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
