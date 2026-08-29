// ============================================================
// Nutri Atende — API: /api/consultas/calendario
// Get consultations for calendar view
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { getAuthUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const calendarQuerySchema = z.object({
  data_inicio: z.string().date(),
  data_fim: z.string().date(),
  nutricionista_id: z.string().uuid().optional(),
});

// GET /api/consultas/calendario — Get consultations for calendar
export async function GET(request: NextRequest) {
  const { auth, error } = await getAuthUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const parsed = calendarQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data_inicio, data_fim, nutricionista_id } = parsed.data;

  const admin = createAdminClient();
  let query = admin
    .from('consulta')
    .select(`
      id,
      data_hora,
      duracao_minutos,
      tipo,
      status,
      paciente:paciente_id (id, nome)
    `)
    .eq('clinica_id', auth.clinicaId)
    .gte('data_hora', data_inicio)
    .lte('data_hora', data_fim + 'T23:59:59')
    .neq('status', 'cancelada')
    .order('data_hora', { ascending: true });

  if (nutricionista_id) {
    query = query.eq('nutricionista_id', nutricionista_id);
  }

  const { data, error: queryError } = await query;

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  // Transform for calendar display
  const events = (data || []).map((consulta: any) => ({
    id: consulta.id,
    title: `${consulta.paciente?.nome || 'Paciente'} - ${consulta.tipo}`,
    start: consulta.data_hora,
    end: new Date(new Date(consulta.data_hora).getTime() + consulta.duracao_minutos * 60000).toISOString(),
    status: consulta.status,
    tipo: consulta.tipo,
    paciente: consulta.paciente,
    backgroundColor:
      consulta.status === 'confirmada'
        ? '#10B981'
        : consulta.status === 'realizada'
        ? '#6B7280'
        : '#3B82F6',
    borderColor:
      consulta.status === 'confirmada'
        ? '#059669'
        : consulta.status === 'realizada'
        ? '#4B5563'
        : '#2563EB',
  }));

  return NextResponse.json({ data: events });
}
