'use client';

import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardHeader, CardTitle, CardContent } from '@/design-system/primitives/Card';
import { Badge } from '@/design-system/primitives/Badge';
import { Avatar } from '@/design-system/primitives/Avatar';
import { EmptyState } from '@/design-system/primitives/EmptyState';
import { LoadingState } from '@/design-system/primitives/LoadingState';
import Link from 'next/link';

export default async function DashboardPage() {
  let totalPacientes = 0;
  let consultasHoje = 0;
  let consultasPendentes = 0;
  let planosAtivos = 0;
  let consultasHojeList: any[] = [];
  let pacientesRecentes: any[] = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();

      const todayStart = new Date().toISOString().split('T')[0];
      const tomorrowStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const now = new Date().toISOString();

      const results = await Promise.allSettled([
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

      if (results[0].status === 'fulfilled') totalPacientes = results[0].value.count ?? 0;
      if (results[1].status === 'fulfilled') consultasHoje = results[1].value.count ?? 0;
      if (results[2].status === 'fulfilled') consultasPendentes = results[2].value.count ?? 0;
      if (results[3].status === 'fulfilled') planosAtivos = results[3].value.count ?? 0;
      if (results[4].status === 'fulfilled') consultasHojeList = results[4].value.data ?? [];
      if (results[5].status === 'fulfilled') pacientesRecentes = results[5].value.data ?? [];
    }
  } catch (err) {
    console.error('[Dashboard] Error fetching data:', err);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-headline-sm font-semibold text-text-primary">
          Dashboard
        </h1>
        <p className="text-body-sm text-text-secondary">
          Visão geral da sua clínica{' '}
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
        <Card variant="elevated" padding="md">
          <CardHeader>
            <CardTitle>Pacientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm text-text-secondary">Total de pacientes com plano ativo</p>
            <p className="text-2xl font-bold text-text-primary mt-2">{totalPacientes}</p>
          </CardContent>
          <Link
            href="/dashboard/pacientes"
            className="mt-2 text-body-sm text-text-tertiary hover:text-text-primary font-medium"
          >
            Ver todos →
          </Link>
        </Card>

        <Card variant="elevated" padding="md">
          <CardHeader>
            <CardTitle>Consultas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm text-text-secondary">Consultas agendadas para hoje</p>
            <p className="text-2xl font-bold text-text-primary mt-2">{consultasHoje}</p>
          </CardContent>
          <Link
            href="/dashboard/agenda"
            className="mt-2 text-body-sm text-text-tertiary hover:text-text-primary font-medium"
          >
            Ver agenda →
          </Link>
        </Card>

        <Card variant="elevated" padding="md">
          <CardHeader>
            <CardTitle>Retornos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm text-text-secondary">Consultas aguardando retorno</p>
            <p className="text-2xl font-bold text-text-primary mt-2">{consultasPendentes}</p>
          </CardContent>
        </Card>

        <Card variant="elevated" padding="md">
          <CardHeader>
            <CardTitle>Planos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm text-text-secondary">Planos alimentares ativos</p>
            <p className="text-2xl font-bold text-text-primary mt-2">{planosAtivos}</p>
          </CardContent>
        </Card>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's consultations */}
        <Card variant="elevated" padding="md">
          <CardHeader>
            <CardTitle>Consultas de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {consultasHojeList.length > 0 ? (
              <div className="space-y-3">
                {consultasHojeList.map((consulta: any) => (
                  <div
                    key={consulta.id}
                    className="flex items-center justify-between rounded-lg border border-border-light dark:border-neutral-700 p-3 bg-surface-level1 dark:bg-surface-level1Dark"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono text-text-secondary">
                        {new Date(consulta.data_hora).toLocaleTimeString(
                          'pt-BR',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {consulta.paciente?.nome ?? 'Paciente'}
                        </p>
                        <p className="text-body-sm text-text-secondary">
                          {consulta.tipo === 'primeira'
                            ? 'Primeira consulta'
                            : consulta.tipo === 'retorno'
                            ? 'Retorno'
                            : 'Avaliação'}
                        </p>
                      </div>
                    </div>
                    <Badge status={consulta.status} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                variant="search"
                title="Nenhum resultado"
                description="Não há consultas agendadas para hoje"
              />
            )}
          </CardContent>
        </Card>

        {/* Recent patients */}
        <Card variant="elevated" padding="md">
          <CardHeader>
            <CardTitle>Pacientes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {pacientesRecentes.length > 0 ? (
              <div className="space-y-3">
                {pacientesRecentes.map((paciente) => (
                  <Link
                    key={paciente.id}
                    href={`/dashboard/pacientes/${paciente.id}`}
                    className="flex items-center justify-between rounded-lg border border-border-light dark:border-neutral-700 p-3 bg-surface-level1 dark:bg-surface-level1Dark transition"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" name={paciente.nome} />
                      <div>
                        <p className="font-medium text-text-primary">
                          {paciente.nome}
                        </p>
                        <p className="text-body-sm text-text-secondary">
                          Cadastrado em{' '}
                          {new Date(paciente.created_at).toLocaleDateString(
                            'pt-BR'
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge
                      status={paciente.status}
                      size="sm"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                variant="default"
                title="Nenhum dado encontrado"
                description="Não há pacientes cadastrados"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card variant="elevated" padding="md">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/dashboard/pacientes/novo"
              className="flex flex-col items-center gap-2 rounded-xl border border-border-light dark:border-neutral-700 bg-surface-level1 dark:bg-surface-level1Dark p-4 hover:bg-surface-level2 dark:hover:bg-surface-level2 transition"
            >
              <span className="text-2xl text-text-primary">➕</span>
              <span className="text-body-sm font-medium text-text-primary">
                Novo Paciente
              </span>
            </Link>
            <Link
              href="/dashboard/agenda"
              className="flex flex-col items-center gap-2 rounded-xl border border-border-light dark:border-neutral-700 bg-surface-level1 dark:bg-surface-level1Dark p-4 hover:bg-surface-level2 dark:hover:bg-surface-level2 transition"
            >
              <span className="text-2xl text-text-primary">📅</span>
              <span className="text-body-sm font-medium text-text-primary">
                Nova Consulta
              </span>
            </Link>
            <Link
              href="/dashboard/planos"
              className="flex flex-col items-center gap-2 rounded-xl border border-border-light dark:border-neutral-700 bg-surface-level1 dark:bg-surface-level1Dark p-4 hover:bg-surface-level2 dark:hover:bg-surface-level2 transition"
            >
              <span className="text-2xl text-text-primary">📋</span>
              <span className="text-body-sm font-medium text-text-primary">
                Criar Plano
              </span>
            </Link>
            <Link
              href="/dashboard/prontuario"
              className="flex flex-col items-center gap-2 rounded-xl border border-border-light dark:border-neutral-700 bg-surface-level1 dark:bg-surface-level1Dark p-4 hover:bg-surface-level2 dark:hover:bg-surface-level2 transition"
            >
              <span className="text-2xl text-text-primary">📁</span>
              <span className="text-body-sm font-medium text-text-primary">
                Prontuário
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}