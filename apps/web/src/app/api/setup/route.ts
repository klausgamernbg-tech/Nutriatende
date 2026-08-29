// ============================================================
// POST /api/setup — First-time setup
// Creates clinica + usuario_sistema for the authenticated user
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authLimiter } from "@/lib/rate-limiter";

export const dynamic = 'force-dynamic';

interface SetupBody {
  clinica_nome: string;
  clinica_cnpj?: string;
  clinica_endereco?: string;
  clinica_telefone?: string;
  nutricionista_nome: string;
  nutricionista_cref?: string;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = authLimiter(`setup:${ip}`);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente mais tarde.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
        }
      }
    );
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  // Check auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Check if profile already exists (use admin to bypass RLS)
  const { data: existingProfile } = await admin
    .from("usuario_sistema")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existingProfile) {
    return NextResponse.json(
      { error: "Perfil já configurado" },
      { status: 409 }
    );
  }

  const body: SetupBody = await request.json();

  // Validate required fields
  if (!body.clinica_nome || !body.nutricionista_nome) {
    return NextResponse.json(
      { error: "Nome da clínica e nome do nutricionista são obrigatórios" },
      { status: 400 }
    );
  }

  // 1. Create clinica (use admin client to bypass RLS)
  const { data: clinica, error: clinicaError } = await admin
    .from("clinica")
    .insert({
      nome: body.clinica_nome,
      cnpj: body.clinica_cnpj || null,
      endereco: body.clinica_endereco
        ? { endereco: body.clinica_endereco, telefone: body.clinica_telefone }
        : null,
    })
    .select("id")
    .single();

  if (clinicaError) {
    console.error("Error creating clinica:", JSON.stringify(clinicaError));
    return NextResponse.json(
      { error: "Erro ao criar clínica", details: clinicaError.message, code: clinicaError.code },
      { status: 500 }
    );
  }

  // 2. Create usuario_sistema (use admin client to bypass RLS)
  const { error: usuarioError } = await admin.from("usuario_sistema").insert({
    id: user.id,
    clinica_id: clinica.id,
    nome: body.nutricionista_nome,
    email: user.email!,
    perfil: "nutricionista",
    permissoes: {
      can_manage_users: true,
      can_manage_clinic: true,
      can_view_financial: true,
    },
  });

  if (usuarioError) {
    console.error("Error creating usuario_sistema:", usuarioError);
    // Rollback: delete the clinica
    await admin.from("clinica").delete().eq("id", clinica.id);
    return NextResponse.json(
      { error: "Erro ao criar perfil do usuário" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    clinica: { id: clinica.id, nome: body.clinica_nome },
    usuario: { id: user.id, nome: body.nutricionista_nome, perfil: "nutricionista" },
  });
}
