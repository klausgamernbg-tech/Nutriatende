// ============================================================
// Nutri Atende — API: /api/pacientes/[id]
// Get, update, and delete a single patient
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { updatePacienteSchema } from '@nutri-atende/shared';
import { getAuthUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// GET /api/pacientes/[id] — Get patient details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const admin = createAdminClient();
  const { data, error: queryError } = await admin
    .from('paciente')
    .select(`
      *,
      nutricionista:nutricionista_responsavel_id (id, nome, email)
    `)
    .eq('id', params.id)
    .eq('clinica_id', auth.clinicaId)
    .single();

  if (queryError || !data) {
    return NextResponse.json(
      { error: 'Paciente não encontrado' },
      { status: 404 }
    );
  }

  // Get latest measures
  const { data: ultimaMedida } = await admin
    .from('medidas')
    .select('*')
    .eq('paciente_id', params.id)
    .order('data_avaliacao', { ascending: false })
    .limit(1)
    .single();

  // Get consultation stats
  const { count: totalConsultas } = await admin
    .from('consulta')
    .select('*', { count: 'exact', head: true })
    .eq('paciente_id', params.id)
    .eq('status', 'realizada');

  // Get active plan
  const { data: planoAtivo } = await admin
    .from('plano_alimentar')
    .select('*')
    .eq('paciente_id', params.id)
    .eq('status', 'ativo')
    .single();

  return NextResponse.json({
    data: {
      ...data,
      idade: data.data_nascimento
        ? Math.floor(
            (Date.now() - new Date(data.data_nascimento).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null,
      ultima_medida: ultimaMedida || null,
      total_consultas_realizadas: totalConsultas || 0,
      plano_alimentar_ativo: planoAtivo || null,
    },
  });
}

// PUT /api/pacientes/[id] — Update patient
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const body = await request.json();
  const parsed = updatePacienteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error: updateError } = await admin
    .from('paciente')
    .update({
      ...parsed.data,
      telefone: parsed.data.telefone || null,
      email: parsed.data.email || null,
      cpf: parsed.data.cpf || null,
    })
    .eq('id', params.id)
    .eq('clinica_id', auth.clinicaId)
    .select()
    .single();

  if (updateError) {
    if (updateError.code === '23505') {
      return NextResponse.json(
        { error: 'Já existe um paciente com este email ou CPF' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE /api/pacientes/[id] — Soft delete (set status to inactive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  // Check if user is admin
  const admin = createAdminClient();
  const { data: usuario } = await admin
    .from('usuario_sistema')
    .select('perfil')
    .eq('id', auth.userId)
    .single();

  if (usuario?.perfil !== 'admin') {
    return NextResponse.json(
      { error: 'Apenas administradores podem inativar pacientes' },
      { status: 403 }
    );
  }

  const { error: deleteError } = await admin
    .from('paciente')
    .update({ status: 'inativo' })
    .eq('id', params.id)
    .eq('clinica_id', auth.clinicaId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Paciente inativado com sucesso' });
}
