// ============================================================
// Nutri Atende — API: /api/medidas
// List and create measures
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createMedidasSchema } from '@nutri-atende/shared';

// GET /api/medidas?paciente_id=xxx — List measures for a patient
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
    .from('medidas')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('data_avaliacao', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/medidas — Create measures
export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createMedidasSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verify patient exists and belongs to user's clinic
  const { data: paciente } = await supabase
    .from('paciente')
    .select('id')
    .eq('id', parsed.data.paciente_id)
    .single();

  if (!paciente) {
    return NextResponse.json(
      { error: 'Paciente não encontrado' },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from('medidas')
    .insert({
      ...parsed.data,
      data_avaliacao: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
