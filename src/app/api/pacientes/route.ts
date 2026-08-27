// ============================================================
// Nutri Atende — API: /api/pacientes
// List and create patients
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPacienteSchema, listPacientesSchema } from '@nutri-atende/shared';

// GET /api/pacientes — List patients
export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Auth check
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

  let query = supabase
    .from('paciente')
    .select(
      `
      *,
      nutricionista:nutricionista_responsavel_id (nome)
    `,
      { count: 'exact' }
    )
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with derived fields
  const enriched = await Promise.all(
    (data || []).map(async (paciente: any) => {
      // Get latest consultation
      const { data: ultimaConsulta } = await supabase
        .from('consulta')
        .select('data_hora')
        .eq('paciente_id', paciente.id)
        .eq('status', 'realizada')
        .order('data_hora', { ascending: false })
        .limit(1)
        .single();

      // Get next consultation
      const { data: proximaConsulta } = await supabase
        .from('consulta')
        .select('data_hora')
        .eq('paciente_id', paciente.id)
        .in('status', ['agendada', 'confirmada'])
        .gte('data_hora', new Date().toISOString())
        .order('data_hora', { ascending: true })
        .limit(1)
        .single();

      // Get latest measures
      const { data: ultimaMedida } = await supabase
        .from('medidas')
        .select('peso, imc')
        .eq('paciente_id', paciente.id)
        .order('data_avaliacao', { ascending: false })
        .limit(1)
        .single();

      return {
        ...paciente,
        idade: paciente.data_nascimento
          ? Math.floor(
              (Date.now() -
                new Date(paciente.data_nascimento).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            )
          : null,
        ultima_consulta: ultimaConsulta?.data_hora || null,
        proximo_retorno: proximaConsulta?.data_hora || null,
        peso_atual: ultimaMedida?.peso || null,
        imc_atual: ultimaMedida?.imc || null,
        nutricionista_nome: paciente.nutricionista?.nome || null,
      };
    })
  );

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

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // Get user's clinica_id
  const { data: usuario } = await supabase
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

  const { data, error } = await supabase
    .from('paciente')
    .insert({
      ...pacienteData,
      clinica_id: usuario.clinica_id,
      nutricionista_responsavel_id: user.id,
      consentimento_lgpd: true,
      data_consentimento_lgpd: new Date().toISOString(),
      consentimento_lgpd_versao: parsed.data.consentimento_lgpd_versao,
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
