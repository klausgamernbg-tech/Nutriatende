// ============================================================
// Nutri Atende — API: /api/setup/create-profile
// Creates usuario_sistema + clinica for existing auth users
// who were created directly in the database
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

interface CreateProfileBody {
  clinica_nome: string;
  clinica_cnpj?: string;
  clinica_endereco?: string;
  clinica_telefone?: string;
  nutricionista_nome: string;
}

export async function POST(request: NextRequest) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const body: CreateProfileBody = await request.json();

  if (!body.clinica_nome || !body.nutricionista_nome) {
    return NextResponse.json(
      { error: 'Nome da clínica e nome do nutricionista são obrigatórios' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Check if profile already exists
  const { data: existing } = await admin
    .from('usuario_sistema')
    .select('id')
    .eq('id', auth.userId)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Perfil já configurado' },
      { status: 409 }
    );
  }

  // 1. Create clinica
  const { data: clinica, error: clinicaError } = await admin
    .from('clinica')
    .insert({
      nome: body.clinica_nome,
      cnpj: body.clinica_cnpj || null,
      endereco: body.clinica_endereco
        ? { endereco: body.clinica_endereco, telefone: body.clinica_telefone }
        : null,
    })
    .select('id')
    .single();

  if (clinicaError) {
    console.error('Error creating clinica:', clinicaError);
    return NextResponse.json(
      { error: 'Erro ao criar clínica', details: clinicaError.message },
      { status: 500 }
    );
  }

  // 2. Create usuario_sistema
  const { error: usuarioError } = await admin.from('usuario_sistema').insert({
    id: auth.userId,
    clinica_id: clinica.id,
    nome: body.nutricionista_nome,
    email: auth.usuario.email || '',
    perfil: 'nutricionista',
    permissoes: {
      can_manage_users: true,
      can_manage_clinic: true,
      can_view_financial: true,
    },
  });

  if (usuarioError) {
    // Rollback: delete the clinica
    await admin.from('clinica').delete().eq('id', clinica.id);
    console.error('Error creating usuario_sistema:', usuarioError);
    return NextResponse.json(
      { error: 'Erro ao criar perfil do usuário' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    clinica: { id: clinica.id, nome: body.clinica_nome },
    usuario: { id: auth.userId, nome: body.nutricionista_nome },
  });
}
