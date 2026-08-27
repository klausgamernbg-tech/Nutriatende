// ============================================================
// Nutri Atende — API: /api/pacientes/[id]
// Get, update, and delete a single patient
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updatePacienteSchema } from '@nutri-atende/shared';

// GET /api/pacientes/[id] — Get patient details
export async function GET(
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

  const { data, error } = await supabase
    .from('paciente')
    .select(
      `
      *,
      nutricionista:nutricionista_responsavel_id (id, nome, email)
    `
    )
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Paciente não encontrado' },
      { status: 404 }
    );
  }

  // Get latest measures
  const { data: ultimaMedida } = await supabase
    .from('medidas')
    .select('*')
    .eq('paciente_id', params.id)
    .order('data_avaliacao', { ascending: false })
    .limit(1)
    .single();

  // Get consultation stats
  const { count: totalConsultas } = await supabase
    .from('consulta')
    .select('*', { count: 'exact', head: true })
    .eq('paciente_id', params.id)
    .eq('status', 'realizada');

  // Get active plan
  const { data: planoAtivo } = await supabase
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
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updatePacienteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('paciente')
    .update({
      ...parsed.data,
      telefone: parsed.data.telefone || null,
      email: parsed.data.email || null,
      cpf: parsed.data.cpf || null,
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Já existe um paciente com este email ou CPF' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE /api/pacientes/[id] — Soft delete (set status to inactive)
export async function DELETE(
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

  // Check if user is admin
  const { data: usuario } = await supabase
    .from('usuario_sistema')
    .select('perfil')
    .eq('id', user.id)
    .single();

  if (usuario?.perfil !== 'admin') {
    return NextResponse.json(
      { error: 'Apenas administradores podem inativar pacientes' },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from('paciente')
    .update({ status: 'inativo' })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Paciente inativado com sucesso' });
}
