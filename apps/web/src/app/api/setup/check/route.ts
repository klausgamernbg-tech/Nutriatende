// ============================================================
// Nutri Atende — API: /api/setup/check
// Returns the current user's profile (usuario_sistema + clinica)
// Used by configuracoes page to display user profile
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Step 1: Verify auth via cookies (no profile lookup needed)
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // Step 2: Try to get profile — this may fail if profile doesn't exist yet
  const admin = createAdminClient();
  const { data: usuario, error: queryError } = await admin
    .from('usuario_sistema')
    .select('*, clinica:clinica_id (id, nome, cnpj, endereco, telefone)')
    .eq('id', user.id)
    .single();

  // If profile doesn't exist, return needsSetup (not 404)
  if (queryError || !usuario) {
    return NextResponse.json({
      usuario_sistema: null,
      needsSetup: true,
      userId: user.id,
      email: user.email,
    });
  }

  return NextResponse.json({ usuario_sistema: usuario });
}
