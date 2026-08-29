// ============================================================
// Nutri Atende — API: /api/pacientes
// List and create patients
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPacienteSchema, listPacientesSchema } from '@nutri-atende/shared';

// GET /api/pacientes — List patients
export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Auth check (uses cookies)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const parsed = listPacientesSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { page, limit, search, status, sort, order } = parsed.data;
  const offset = (page - 1) * limit;

  // Use admin client for data queries (bypass RLS)
  const admin = createAdminClient();

  const { data, count, error } = await admin
    .from('paciente')
    .select('*, nutricionista:nutricionista_responsavel_id (nome)', { count: 'exact' })
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform data
  const enriched = (data || []).map((paciente: any) => ({
    ...paciente,
    idade: paciente.data_nascimento
      ? Math.floor(
          (Date.now() - new Date(paciente.data_nascimento).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null,
    nutricionista_nome: paciente.nutricionista?.nome || null,
  }));

  return NextResponse.json({
    data: enriched,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: count ? Math.ceil(count / limit) : 1,
    },
  });
}

// POST /api/pacientes — Create patient
export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Auth check (uses cookies)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // Get user's clinica_id (use admin client to bypass RLS)
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
  const parsed = createPacienteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { consentimento_lgpd, ...pacienteData } = parsed.data;

  // Use admin client for insert (bypass RLS)
  const { data, error } = await admin
    .from('paciente')
    .insert({
      ...pacienteData,
      clinica_id: usuario.clinica_id,
      nutricionista_responsavel_id: user.id,
      consentimento_lgpd: true,
      data_consentimento_lgpd: new Date().toISOString(),
      consentimento_lgpd_versao: parsed.data.consentimento_lgpd_versao || '1.0',
      telefone: parsed.data.telefone || null,
      email: parsed.data.email || null,
      cpf: parsed.data.cpf || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        {
          error:
            'Já existe um paciente com este email ou CPF nesta clínica',
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
