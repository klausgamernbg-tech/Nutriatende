// ============================================================
// Nutri Atende — API: /api/anamneses
// CRUD for anamneses
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { getAuthUser } from '@/lib/api-auth';

const createAnamneseSchema = z.object({
  consulta_id: z.string().uuid(),
  paciente_id: z.string().uuid(),
  queixa_principal: z.string().max(1000).optional(),
  motivo_consulta: z.string().max(1000).optional(),
  alimentacao_atual: z.string().max(5000).optional(),
  rotina_diaria: z.string().max(5000).optional(),
  restricoes_alimentares: z.string().max(2000).optional(),
  alergias_intolerancias: z.string().max(2000).optional(),
  historico_familiar: z.string().max(2000).optional(),
  medicacoes_em_uso: z.string().max(2000).optional(),
  atividade_fisica: z.string().max(2000).optional(),
  sono: z.string().max(1000).optional(),
  estresse: z.string().max(1000).optional(),
  observacoes_livres: z.string().max(5000).optional(),
  preenchido_publicamente: z.boolean().default(false),
});

const updateAnamneseSchema = z.object({
  queixa_principal: z.string().max(1000).optional(),
  motivo_consulta: z.string().max(1000).optional(),
  alimentacao_atual: z.string().max(5000).optional(),
  rotina_diaria: z.string().max(5000).optional(),
  restricoes_alimentares: z.string().max(2000).optional(),
  alergias_intolerancias: z.string().max(2000).optional(),
  historico_familiar: z.string().max(2000).optional(),
  medicacoes_em_uso: z.string().max(2000).optional(),
  atividade_fisica: z.string().max(2000).optional(),
  sono: z.string().max(1000).optional(),
  estresse: z.string().max(1000).optional(),
  observacoes_livres: z.string().max(5000).optional(),
});

// GET /api/anamneses?consulta_id=xxx — Get anamnese by consultation
export async function GET(request: NextRequest) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const consultaId = searchParams.get('consulta_id');

  if (!consultaId) {
    return NextResponse.json({ error: 'consulta_id é obrigatório' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error: queryError } = await admin
    .from('anamnese')
    .select('*')
    .eq('consulta_id', consultaId)
    .single();

  if (queryError) {
    if (queryError.code === 'PGRST116') {
      return NextResponse.json({ data: null }, { status: 200 });
    }
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/anamneses — Create anamnese
export async function POST(request: NextRequest) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const parsed = createAnamneseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error: insertError } = await admin
    .from('anamnese')
    .insert(parsed.data)
    .select()
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'Anamnese já existe para esta consulta' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

// PUT /api/anamneses — Update anamnese (by consulta_id)
export async function PUT(request: NextRequest) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const consultaId = searchParams.get('consulta_id');

  if (!consultaId) {
    return NextResponse.json({ error: 'consulta_id é obrigatório' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateAnamneseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error: updateError } = await admin
    .from('anamnese')
    .update(parsed.data)
    .eq('consulta_id', consultaId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
