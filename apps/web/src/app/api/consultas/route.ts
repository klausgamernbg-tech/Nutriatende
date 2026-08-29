// ============================================================
// Nutri Atende — API: /api/consultas
// List and create consultations
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createConsultaSchema, listConsultasSchema } from '@nutri-atende/shared';

// GET /api/consultas — List consultations
export async function GET(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const parsed = listConsultasSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { page, limit, paciente_id, nutricionista_id, status, data_inicio, data_fim, sort, order } =
    parsed.data;
  const offset = (page - 1) * limit;

  const admin = createAdminClient();
  let query = admin
    .from('consulta')
    .select(
      `
      *,
      paciente:paciente_id (id, nome, telefone, email),
      nutricionista:nutricionista_id (id, nome)
    `,
      { count: 'exact' }
    )
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  if (paciente_id) query = query.eq('paciente_id', paciente_id);
  if (nutricionista_id) query = query.eq('nutricionista_id', nutricionista_id);
  if (status) query = query.eq('status', status);
  if (data_inicio) query = query.gte('data_hora', data_inicio);
  if (data_fim) query = query.lte('data_hora', data_fim + 'T23:59:59');

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: count ? Math.ceil(count / limit) : 1,
    },
  });
}

// POST /api/consultas — Create consultation
export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: usuario } = await admin
    .from('usuario_sistema')
    .select('clinica_id')
    .eq('id', user.id)
    .single();

  if (!usuario) {
    return NextResponse.json(
      { error: 'Perfil de usuário não encontrado' },
      { status: 404 }
    );
  }

  const body = await request.json();
  const parsed = createConsultaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Check for scheduling conflicts
  const { data: conflitos } = await admin
    .from('consulta')
    .select('id')
    .eq('nutricionista_id', user.id)
    .neq('status', 'cancelada')
    .gte(
      'data_hora',
      new Date(
        new Date(parsed.data.data_hora).getTime() -
          parsed.data.duracao_minutos * 60 * 1000
      ).toISOString()
    )
    .lte(
      'data_hora',
      new Date(
        new Date(parsed.data.data_hora).getTime() +
          parsed.data.duracao_minutos * 60 * 1000
      ).toISOString()
    );

  if (conflitos && conflitos.length > 0) {
    return NextResponse.json(
      { error: 'Horário conflita com outra consulta agendada' },
      { status: 409 }
    );
  }

  const { data, error } = await admin
    .from('consulta')
    .insert({
      ...parsed.data,
      nutricionista_id: user.id,
      clinica_id: usuario.clinica_id,
      status: 'agendada',
      status_pagamento: 'pendente',
      valor_pago: 0,
      lembrete_enviado: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
