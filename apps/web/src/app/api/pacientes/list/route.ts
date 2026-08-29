// ============================================================
// Nutri Atende — API: /api/pacientes/list
// Lightweight patient list for dropdowns
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/api-auth';

// GET /api/pacientes/list?status=ativo — Lightweight patient list for dropdowns
export async function GET(request: NextRequest) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // 'ativo', 'inativo', etc.
  const search = searchParams.get('search') || '';

  const admin = createAdminClient();

  let query = admin
    .from('paciente')
    .select('id, nome, status')
    .eq('clinica_id', auth.clinicaId)
    .order('nome');

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('nome', `%${search}%`);
  }

  const { data, error: queryError } = await query;

  if (queryError) {
    console.error('[Pacientes List] Query error:', queryError);
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}
