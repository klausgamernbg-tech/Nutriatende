// ============================================================
// Nutri Atende — API: /api/pacientes/check-dup
// Check for duplicate patient (email or CPF)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { getAuthUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const checkDupSchema = z.object({
  email: z.string().email().optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
});

// GET /api/pacientes/check-dup — Check duplicate
export async function GET(request: NextRequest) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const parsed = checkDupSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!parsed.data.email && !parsed.data.cpf) {
    return NextResponse.json(
      { error: 'email ou cpf é obrigatório' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  let query = admin
    .from('paciente')
    .select('id, nome, email, cpf')
    .eq('clinica_id', auth.clinicaId);

  if (parsed.data.email && parsed.data.cpf) {
    query = query.or(`email.eq.${parsed.data.email},cpf.eq.${parsed.data.cpf}`);
  } else if (parsed.data.email) {
    query = query.eq('email', parsed.data.email);
  } else {
    query = query.eq('cpf', parsed.data.cpf!);
  }

  const { data, error: queryError } = await query.limit(1);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      exists: (data?.length ?? 0) > 0,
      paciente: data?.[0] || null,
    },
  });
}
