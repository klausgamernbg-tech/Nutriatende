// ============================================================
// Nutri Atende — API: /api/setup/create-profile
// Creates or updates usuario_sistema + clinica for auth users
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface ProfileBody {
  clinica_nome: string;
  clinica_cnpj?: string;
  clinica_endereco?: string;
  clinica_telefone?: string;
  nutricionista_nome: string;
}

export async function POST(request: NextRequest) {
  // Auth check — use cookie-based client directly
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body: ProfileBody = await request.json();

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
    .select('id, clinica_id')
    .eq('id', user.id)
    .single();

  if (existing) {
    // ---- UPDATE existing profile ----

    // Update usuario_sistema
    const { error: updateUsuarioError } = await admin
      .from('usuario_sistema')
      .update({
        nome: body.nutricionista_nome,
        email: user.email || '',
      })
      .eq('id', user.id);

    if (updateUsuarioError) {
      console.error('[Setup] Error updating usuario_sistema:', updateUsuarioError);
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil', details: updateUsuarioError.message },
        { status: 500 }
      );
    }

    // Update clinica if we have its id
    if (existing.clinica_id) {
      const updateData: Record<string, any> = {
        nome: body.clinica_nome,
      };
      if (body.clinica_cnpj !== undefined) updateData.cnpj = body.clinica_cnpj || null;
      if (body.clinica_endereco !== undefined || body.clinica_telefone !== undefined) {
        updateData.endereco = {
          endereco: body.clinica_endereco || '',
          telefone: body.clinica_telefone || '',
        };
      }

      const { error: updateClinicaError } = await admin
        .from('clinica')
        .update(updateData)
        .eq('id', existing.clinica_id);

      if (updateClinicaError) {
        console.error('[Setup] Error updating clinica:', updateClinicaError);
        // Non-fatal — profile is updated, clinic update failed
      }
    }

    return NextResponse.json({
      success: true,
      updated: true,
      clinica: { id: existing.clinica_id, nome: body.clinica_nome },
      usuario: { id: user.id, nome: body.nutricionista_nome },
    });
  }

  // ---- CREATE new profile ----

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
    console.error('[Setup] Error creating clinica:', clinicaError);
    return NextResponse.json(
      { error: 'Erro ao criar clínica', details: clinicaError.message },
      { status: 500 }
    );
  }

  // 2. Create usuario_sistema
  const { error: usuarioError } = await admin.from('usuario_sistema').insert({
    id: user.id,
    clinica_id: clinica.id,
    nome: body.nutricionista_nome,
    email: user.email || '',
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
    console.error('[Setup] Error creating usuario_sistema:', usuarioError);
    return NextResponse.json({ error: 'Erro ao criar perfil do usuário' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    created: true,
    clinica: { id: clinica.id, nome: body.clinica_nome },
    usuario: { id: user.id, nome: body.nutricionista_nome },
  });
}
