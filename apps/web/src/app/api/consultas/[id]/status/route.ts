// ============================================================
// Nutri Atende — API: /api/consultas/[id]/status
// Update consultation status
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['agendada', 'confirmada', 'realizada', 'cancelada', 'nao_compareceu']),
  motivo_cancelamento: z.string().max(500).optional(),
});

// PUT /api/consultas/[id]/status — Update consultation status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

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

  const { data, error } = await supabase
    .from('consulta')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}