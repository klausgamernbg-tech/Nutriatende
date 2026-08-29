// ============================================================
// Nutri Atende — API: /api/pacientes
// List and create patients
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPacienteSchema, listPacientesSchema } from '@nutri-atende/shared';
import { getAuthUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// GET /api/pacientes — List patients
export async function GET(request: NextRequest) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

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

  const admin = createAdminClient();

  const { data, count, error: queryError } = await admin
    .from('paciente')
    .select('*, nutricionista:nutricionista_responsavel_id (nome)', { count: 'exact' })
    .eq('clinica_id', auth.clinicaId)
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
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
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const parsed = createPacienteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { consentimento_lgpd, ...pacienteData } = parsed.data;

  const { data, error: insertError } = await admin
    .from('paciente')
    .insert({
      ...pacienteData,
      clinica_id: auth.clinicaId,
      nutricionista_responsavel_id: auth.userId,
      consentimento_lgpd: true,
      data_consentimento_lgpd: new Date().toISOString(),
      consentimento_lgpd_versao: parsed.data.consentimento_lgpd_versao || '1.0',
      telefone: parsed.data.telefone || null,
      email: parsed.data.email || null,
      cpf: parsed.data.cpf || null,
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json(
        {
          error:
            'Já existe um paciente com este email ou CPF nesta clínica',
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
