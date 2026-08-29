// ============================================================
// Nutri Atende — Shared API Auth Helper
// Handles authentication + profile lookup with error logging
// ============================================================

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export interface AuthResult {
  userId: string;
  clinicaId: string;
  usuario: {
    id: string;
    clinica_id: string;
    nome?: string;
    email?: string;
    perfil?: string;
  };
}

/**
 * Get authenticated user and their clinic profile.
 * Uses cookie-based auth for user verification + admin client for profile lookup.
 * Returns null with a NextResponse error if auth fails.
 */
export async function getAuthUser(): Promise<
  { auth: AuthResult; error?: never } | { auth?: never; error: NextResponse }
> {
  try {
    // Step 1: Verify auth via cookies
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('[API Auth] getUser error:', authError.message);
      return {
        error: NextResponse.json(
          { error: 'Erro de autenticação', details: authError.message },
          { status: 401 }
        ),
      };
    }

    if (!user) {
      return {
        error: NextResponse.json(
          { error: 'Não autenticado' },
          { status: 401 }
        ),
      };
    }

    // Step 2: Get user profile from usuario_sistema via admin client
    const admin = createAdminClient();
    const { data: usuario, error: profileError } = await admin
      .from('usuario_sistema')
      .select('id, clinica_id, nome, email, perfil')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[API Auth] Profile query error:', {
        userId: user.id,
        error: profileError.message,
        code: profileError.code,
      });
      return {
        error: NextResponse.json(
          {
            error: 'Perfil de usuário não encontrado',
            details: profileError.message,
            code: profileError.code,
          },
          { status: 404 }
        ),
      };
    }

    if (!usuario) {
      console.error('[API Auth] Profile not found for user:', user.id);
      return {
        error: NextResponse.json(
          {
            error: 'Perfil de usuário não encontrado',
            userId: user.id,
          },
          { status: 404 }
        ),
      };
    }

    if (!usuario.clinica_id) {
      console.error('[API Auth] User has no clinica_id:', user.id);
      return {
        error: NextResponse.json(
          { error: 'Usuário não está associado a uma clínica' },
          { status: 400 }
        ),
      };
    }

    return {
      auth: {
        userId: user.id,
        clinicaId: usuario.clinica_id,
        usuario,
      },
    };
  } catch (err: any) {
    console.error('[API Auth] Unexpected error:', err?.message || err);
    return {
      error: NextResponse.json(
        { error: 'Erro interno de autenticação' },
        { status: 500 }
      ),
    };
  }
}
