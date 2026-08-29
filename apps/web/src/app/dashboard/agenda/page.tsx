// ============================================================
// Nutri Atende — Agenda Page (Calendar View)
// ============================================================

import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AgendaPage() {
  const supabase = createAdminClient();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Get consultations for the next 7 days
  const { data: consultas } = await supabase
    .from('consulta')
    .select('*, paciente:paciente_id (id, nome)')
    .gte('data_hora', todayStr)
    .lte('data_hora', weekFromNow)
    .in('status', ['agendada', 'confirmada'])
    .order('data_hora', { ascending: true });

  // Group by date
  const consultasPorDia: Record<string, any[]> = {};
  (consultas || []).forEach((c) => {
    const dateKey = new Date(c.data_hora).toISOString().split('T')[0];
    if (!consultasPorDia[dateKey]) consultasPorDia[dateKey] = [];
    consultasPorDia[dateKey].push(c);
  });

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  // Generate 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      date: d,
      dateStr: d.toISOString().split('T')[0],
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      monthName: monthNames[d.getMonth()],
      isToday: i === 0,
      consultas: consultasPorDia[d.toISOString().split('T')[0]] || [],
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500">
            Próximos 7 dias — {consultas?.length ?? 0} consulta{(consultas?.length ?? 0) !== 1 ? 's' : ''} agendada{(consultas?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/consultas/nova"
          className="inline-flex items-center px-4 py-2.5 bg-nutri-600 text-white font-medium rounded-lg hover:bg-nutri-700 transition"
        >
          + Nova Consulta
        </Link>
      </div>

      {/* Weekly calendar */}
      <div className="space-y-3">
        {days.map((day) => (
          <div
            key={day.dateStr}
            className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
              day.isToday ? 'border-nutri-300 ring-1 ring-nutri-200' : 'border-gray-100'
            }`}
          >
            {/* Day header */}
            <div
              className={`px-6 py-3 flex items-center justify-between ${
                day.isToday ? 'bg-nutri-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold ${
                    day.isToday ? 'text-nutri-700' : 'text-gray-700'
                  }`}
                >
                  {day.dayName}
                </span>
                <span className="text-sm text-gray-500">
                  {day.dayNum} de {day.monthName}
                </span>
                {day.isToday && (
                  <span className="px-2 py-0.5 bg-nutri-600 text-white text-xs font-medium rounded-full">
                    Hoje
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {day.consultas.length} consulta{day.consultas.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Consultations */}
            <div className="p-4">
              {day.consultas.length > 0 ? (
                <div className="space-y-2">
                  {day.consultas.map((consulta: any) => (
                    <Link
                      key={consulta.id}
                      href={`/dashboard/pacientes/${consulta.paciente?.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[50px]">
                          <p className="text-lg font-bold text-gray-900">
                            {new Date(consulta.data_hora).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {consulta.paciente?.nome ?? 'Paciente'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {consulta.tipo === 'primeira'
                              ? 'Primeira consulta'
                              : consulta.tipo === 'retorno'
                              ? 'Retorno'
                              : 'Avaliação'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          consulta.status === 'confirmada'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {consulta.status === 'confirmada' ? 'Confirmada' : 'Agendada'}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-4 text-sm">
                  Nenhuma consulta neste dia
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
