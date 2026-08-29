// ============================================================
// Nutri Atende — API: /api/medidas
// List and create measures
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createMedidasSchema } from '@nutri-atende/shared';
import { getAuthUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// GET /api/medidas?paciente_id=xxx — List measures for a patient
export async function GET(request: NextRequest) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const pacienteId = searchParams.get('paciente_id');

  if (!pacienteId) {
    return NextResponse.json(
      { error: 'paciente_id é obrigatório' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error: queryError } = await admin
    .from('medidas')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('data_avaliacao', { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/medidas — Create measures
export async function POST(request: NextRequest) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const parsed = createMedidasSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify patient exists and belongs to user's clinic
  const { data: paciente } = await admin
    .from('paciente')
    .select('id')
    .eq('id', parsed.data.paciente_id)
    .eq('clinica_id', auth.clinicaId)
    .single();

  if (!paciente) {
    return NextResponse.json(
      { error: 'Paciente não encontrado' },
      { status: 404 }
    );
  }

  const { data, error: insertError } = await admin
    .from('medidas')
    .insert({
      ...parsed.data,
      data_avaliacao: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
