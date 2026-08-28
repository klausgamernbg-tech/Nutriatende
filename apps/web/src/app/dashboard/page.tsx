// ============================================================
// Nutri Atende — Dashboard Page
// Main dashboard with KPIs and overview
// ============================================================

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createClient();

  const todayStart = new Date().toISOString().split('T')[0];
  const tomorrowStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const now = new Date().toISOString();

  // Fetch all data in parallel (single Promise.all)
  const [
    { count: totalPacientes },
    { count: consultasHoje },
    { count: consultasPendentes },
    { count: planosAtivos },
    { data: consultasHojeList },
    { data: pacientesRecentes },
  ] = await Promise.all([
    supabase.from('paciente').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase
      .from('consulta')
      .select('*', { count: 'exact', head: true })
      .eq('data_hora', todayStart)
      .in('status', ['agendada', 'confirmada']),
    supabase
      .from('consulta')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'agendada')
      .gte('data_hora', now),
    supabase
      .from('plano_alimentar')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativo'),
    supabase
      .from('consulta')
      .select('*, paciente:paciente_id (nome, telefone)')
      .gte('data_hora', todayStart)
      .lt('data_hora', tomorrowStart)
      .in('status', ['agendada', 'confirmada'])
      .order('data_hora', { ascending: true })
      .limit(10),
    supabase
      .from('paciente')
      .select('id, nome, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Visão geral da sua clínica —{' '}
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pacientes Ativos
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {totalPacientes ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-nutri-50 rounded-xl flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
          <Link
            href="/dashboard/pacientes"
            className="mt-3 text-sm text-nutri-600 hover:text-nutri-700 font-medium"
          >
            Ver todos →
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Consultas Hoje
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {consultasHoje ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
              📅
            </div>
          </div>
          <Link
            href="/dashboard/agenda"
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver agenda →
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Retornos Pendentes
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {consultasPendentes ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl">
              ⏰
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Planos Ativos
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {planosAtivos ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">
              🍽️
            </div>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's consultations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Consultas de Hoje</h2>
          </div>
          <div className="p-6">
            {consultasHojeList && consultasHojeList.length > 0 ? (
              <div className="space-y-3">
                {consultasHojeList.map((consulta: any) => (
                  <div
                    key={consulta.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono text-gray-500">
                        {new Date(consulta.data_hora).toLocaleTimeString(
                          'pt-BR',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
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
                      {consulta.status === 'confirmada'
                        ? 'Confirmada'
                        : 'Agendada'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhuma consulta agendada para hoje
              </p>
            )}
          </div>
        </div>

        {/* Recent patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Pacientes Recentes
            </h2>
            <Link
              href="/dashboard/pacientes"
              className="text-sm text-nutri-600 hover:text-nutri-700 font-medium"
            >
              Ver todos →
            </Link>
          </div>
          <div className="p-6">
            {pacientesRecentes && pacientesRecentes.length > 0 ? (
              <div className="space-y-3">
                {pacientesRecentes.map((paciente) => (
                  <Link
                    key={paciente.id}
                    href={`/dashboard/pacientes/${paciente.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-nutri-100 rounded-full flex items-center justify-center text-nutri-700 font-medium text-sm">
                        {paciente.nome
                          .split(' ')
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {paciente.nome}
                        </p>
                        <p className="text-sm text-gray-500">
                          Cadastrado em{' '}
                          {new Date(paciente.created_at).toLocaleDateString(
                            'pt-BR'
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        paciente.status === 'ativo'
                          ? 'bg-green-100 text-green-700'
                          : paciente.status === 'manutencao'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {paciente.status === 'ativo'
                        ? 'Ativo'
                        : paciente.status === 'manutencao'
                        ? 'Manutenção'
                        : 'Inativo'}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum paciente cadastrado</p>
                <Link
                  href="/dashboard/pacientes/novo"
                  className="inline-flex items-center px-4 py-2 bg-nutri-600 text-white rounded-lg hover:bg-nutri-700 transition"
                >
                  + Cadastrar primeiro paciente
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/dashboard/pacientes/novo"
            className="flex flex-col items-center gap-2 p-4 bg-nutri-50 rounded-xl hover:bg-nutri-100 transition"
          >
            <span className="text-2xl">➕</span>
            <span className="text-sm font-medium text-nutri-700">
              Novo Paciente
            </span>
          </Link>
          <Link
            href="/dashboard/agenda"
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
          >
            <span className="text-2xl">📅</span>
            <span className="text-sm font-medium text-blue-700">
              Nova Consulta
            </span>
          </Link>
          <Link
            href="/dashboard/planos"
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition"
          >
            <span className="text-2xl">📋</span>
            <span className="text-sm font-medium text-purple-700">
              Criar Plano
            </span>
          </Link>
          <Link
            href="/dashboard/prontuario"
            className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition"
          >
            <span className="text-2xl">📁</span>
            <span className="text-sm font-medium text-amber-700">
              Prontuário
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
