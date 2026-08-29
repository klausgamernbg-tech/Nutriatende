// ============================================================
// Nutri Atende — API: /api/setup/check
// Returns the current user's profile (usuario_sistema + clinica)
// Used by configuracoes page to display user profile
// ============================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const admin = createAdminClient();
  const { data: usuario, error: queryError } = await admin
    .from('usuario_sistema')
    .select('*, clinica:clinica_id (id, nome, cnpj, endereco, telefone)')
    .eq('id', auth.userId)
    .single();

  // If profile doesn't exist, return empty profile (not 404)
  // This allows the configuracoes page to offer profile creation
  if (queryError || !usuario) {
    return NextResponse.json({
      usuario_sistema: null,
      needsSetup: true,
    });
  }

  return NextResponse.json({ usuario_sistema: usuario });
}
