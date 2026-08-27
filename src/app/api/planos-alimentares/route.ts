// ============================================================
// Nutri Atende — API: /api/planos-alimentares
// List and create meal plans
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createPlanoSchema = z.object({
  paciente_id: z.string().uuid(),
  consulta_id: z.string().uuid().optional(),
  titulo: z.string().max(200).optional(),
  data_inicio: z.string().date(),
  data_fim: z.string().date().optional(),
  calorias_meta: z.number().int().min(500).max(10000).optional(),
  proteinas_meta: z.number().min(0).optional(),
  carboidratos_meta: z.number().min(0).optional(),
  gorduras_meta: z.number().min(0).optional(),
  fibras_meta: z.number().min(0).optional(),
  observacoes: z.string().max(5000).optional(),
});

// GET /api/planos-alimentares?paciente_id=xxx — List plans
export async function GET(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pacienteId = searchParams.get('paciente_id');

  if (!pacienteId) {
    return NextResponse.json(
      { error: 'paciente_id é obrigatório' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('plano_alimentar')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/planos-alimentares — Create plan
export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createPlanoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Deactivate any existing active plan for this patient
  await supabase
    .from('plano_alimentar')
    .update({ status: 'finalizado' })
    .eq('paciente_id', parsed.data.paciente_id)
    .eq('status', 'ativo');

  const { data, error } = await supabase
    .from('plano_alimentar')
    .insert({
      ...parsed.data,
      nutricionista_id: user.id,
      status: 'rascunho',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
