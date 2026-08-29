// ============================================================
// Nutri Atende — API: /api/setup/check
// Returns the current user's profile (usuario_sistema + clinica)
// Used by configuracoes page to display user profile
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // Use admin client to bypass RLS
  const admin = createAdminClient();
  const { data: usuario, error } = await admin
    .from('usuario_sistema')
    .select('*, clinica:clinica_id (id, nome, cnpj, endereco, telefone)')
    .eq('id', user.id)
    .single();

  if (error || !usuario) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ usuario_sistema: usuario });
}
