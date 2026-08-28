// ============================================================
// Nutri Atende — API: /api/pacientes/check-dup
// Check for duplicate patient (email or CPF)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const checkDupSchema = z.object({
  email: z.string().email().optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
});

// GET /api/pacientes/check-dup — Check duplicate
export async function GET(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

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

  // Get user's clinica_id
  const { data: usuario } = await supabase
    .from('usuario_sistema')
    .select('clinica_id')
    .eq('id', user.id)
    .single();

  if (!usuario) {
    return NextResponse.json(
      { error: 'Perfil de usuário não encontrado' },
      { status: 404 }
    );
  }

  let query = supabase
    .from('paciente')
    .select('id, nome, email, cpf')
    .eq('clinica_id', usuario.clinica_id);

  if (parsed.data.email && parsed.data.cpf) {
    query = query.or(`email.eq.${parsed.data.email},cpf.eq.${parsed.data.cpf}`);
  } else if (parsed.data.email) {
    query = query.eq('email', parsed.data.email);
  } else {
    query = query.eq('cpf', parsed.data.cpf!);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      exists: (data?.length ?? 0) > 0,
      paciente: data?.[0] || null,
    },
  });
}