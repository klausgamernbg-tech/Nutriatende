// ============================================================
// Nutri Atende — Patient Detail Page
// ============================================================

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function PacienteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { id } = params;

  // Fetch patient with relations
  const { data: paciente, error } = await supabase
    .from('paciente')
    .select(
      `
      *,
      nutricionista:nutricionista_responsavel_id (nome, email)
    `
    )
    .eq('id', id)
    .single();

  if (error || !paciente) {
    notFound();
  }

  // Fetch latest measures
  const { data: ultimaMedida } = await supabase
    .from('medidas')
    .select('*')
    .eq('paciente_id', id)
    .order('data_avaliacao', { ascending: false })
    .limit(1)
    .single();

  // Fetch recent consultations
  const { data: consultas } = await supabase
    .from('consulta')
    .select('*')
    .eq('paciente_id', id)
    .order('data_hora', { ascending: false })
    .limit(5);

  // Fetch active plan
  const { data: planoAtivo } = await supabase
    .from('plano_alimentar')
    .select('*')
    .eq('paciente_id', id)
    .eq('status', 'ativo')
    .single();

  // Calculate age
  const idade = paciente.data_nascimento
    ? Math.floor(
        (Date.now() -
          new Date(paciente.data_nascimento).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/pacientes"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Voltar para pacientes
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-nutri-100 rounded-full flex items-center justify-center text-nutri-700 font-bold text-xl">
              {paciente.nome
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {paciente.nome}
              </h1>
              <p className="text-gray-500">
                {idade !== null ? `${idade} anos` : '—'} •{' '}
                {paciente.sexo === 'M'
                  ? 'Masculino'
                  : paciente.sexo === 'F'
                  ? 'Feminino'
                  : paciente.sexo || '—'}{' '}
                •{' '}
                <span
                  className={`font-medium ${
                    paciente.status === 'ativo'
                      ? 'text-green-600'
                      : paciente.status === 'manutencao'
                      ? 'text-amber-600'
                      : 'text-gray-600'
                  }`}
                >
                  {paciente.status === 'ativo'
                    ? 'Ativo'
                    : paciente.status === 'manutencao'
                    ? 'Manutenção'
                    : 'Inativo'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/dashboard/pacientes/${id}/editar`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            ✏️ Editar
          </Link>
          <Link
            href={`/dashboard/consultas/nova?paciente_id=${id}`}
            className="px-4 py-2 bg-nutri-600 text-white rounded-lg hover:bg-nutri-700 transition text-sm font-medium"
          >
            + Nova Consulta
          </Link>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Info */}
        <div className="space-y-6">
          {/* Contact info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              📞 Informações de Contato
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Telefone:</span>{' '}
                <span className="text-gray-900">
                  {paciente.telefone || '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>{' '}
                <span className="text-gray-900">
                  {paciente.email || '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Nutricionista:</span>{' '}
                <span className="text-gray-900">
                  {paciente.nutricionista?.nome || '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Cadastrado em:</span>{' '}
                <span className="text-gray-900">
                  {new Date(paciente.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {paciente.tags && paciente.tags.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">🏷️ Tags</h2>
              <div className="flex flex-wrap gap-2">
                {paciente.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-nutri-50 text-nutri-700 rounded-full text-sm"
                  >
                    {tag.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Queixa principal */}
          {paciente.queixa_principal && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">
                🏥 Queixa Principal
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                {paciente.queixa_principal}
              </p>
            </div>
          )}
        </div>

        {/* Center column — Measures & Charts */}
        <div className="space-y-6">
          {/* Latest measures */}
          {ultimaMedida ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">
                  📊 Última Avaliação
                </h2>
                <span className="text-xs text-gray-500">
                  {new Date(
                    ultimaMedida.data_avaliacao
                  ).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {ultimaMedida.peso ? `${ultimaMedida.peso}` : '—'}
                  </p>
                  <p className="text-xs text-gray-500">kg</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {ultimaMedida.imc ? `${ultimaMedida.imc}` : '—'}
                  </p>
                  <p className="text-xs text-gray-500">IMC</p>
                </div>
                {ultimaMedida.altura && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {(ultimaMedida.altura * 100).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500">cm</p>
                  </div>
                )}
                {ultimaMedida.circunferencia_cintura && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {ultimaMedida.circunferencia_cintura}
                    </p>
                    <p className="text-xs text-gray-500">cm cintura</p>
                  </div>
                )}
              </div>

              {/* IMC classification */}
              {ultimaMedida.imc && (
                <div className="mt-4 p-3 rounded-lg bg-nutri-50">
                  <p className="text-sm font-medium text-nutri-700">
                    {ultimaMedida.imc < 18.5
                      ? 'Abaixo do peso'
                      : ultimaMedida.imc < 25
                      ? '✅ Peso normal'
                      : ultimaMedida.imc < 30
                      ? '⚠️ Sobrepeso'
                      : ultimaMedida.imc < 35
                      ? '🟠 Obesidade grau I'
                      : ultimaMedida.imc < 40
                      ? '🔴 Obesidade grau II'
                      : '🔴 Obesidade grau III'}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <Link
                  href={`/dashboard/pacientes/${id}/medidas`}
                  className="text-sm text-nutri-600 hover:text-nutri-700 font-medium"
                >
                  Ver histórico completo →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">
                📊 Avaliação
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                Nenhuma medida registrada ainda
              </p>
              <Link
                href={`/dashboard/pacientes/${id}/medidas/nova`}
                className="text-sm text-nutri-600 hover:text-nutri-700 font-medium"
              >
                + Registrar primeira avaliação
              </Link>
            </div>
          )}

          {/* Active plan */}
          {planoAtivo ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">
                🍽️ Plano Alimentar Ativo
              </h2>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">
                  {planoAtivo.titulo || 'Plano sem título'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Meta: {planoAtivo.calorias_meta || '—'} kcal/dia
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Início:{' '}
                  {new Date(planoAtivo.data_inicio).toLocaleDateString('pt-BR')}
                  {planoAtivo.data_fim
                    ? ` — Fim: ${new Date(
                        planoAtivo.data_fim
                      ).toLocaleDateString('pt-BR')}`
                    : ' — Vigente'}
                </p>
              </div>
              <div className="mt-3">
                <Link
                  href={`/dashboard/planos/${planoAtivo.id}`}
                  className="text-sm text-nutri-600 hover:text-nutri-700 font-medium"
                >
                  Ver plano completo →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">
                🍽️ Plano Alimentar
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                Nenhum plano alimentar ativo
              </p>
              <Link
                href={`/dashboard/planos/novo?paciente_id=${id}`}
                className="text-sm text-nutri-600 hover:text-nutri-700 font-medium"
              >
                + Criar plano alimentar
              </Link>
            </div>
          )}
        </div>

        {/* Right column — Consultations */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                📅 Consultas Recentes
              </h2>
              <Link
                href={`/dashboard/consultas?paciente_id=${id}`}
                className="text-xs text-nutri-600 hover:text-nutri-700"
              >
                Ver todas
              </Link>
            </div>

            {consultas && consultas.length > 0 ? (
              <div className="space-y-3">
                {consultas.map((consulta: any) => (
                  <div
                    key={consulta.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(consulta.data_hora).toLocaleDateString(
                          'pt-BR'
                        )}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          consulta.status === 'realizada'
                            ? 'bg-green-100 text-green-700'
                            : consulta.status === 'agendada'
                            ? 'bg-blue-100 text-blue-700'
                            : consulta.status === 'confirmada'
                            ? 'bg-nutri-100 text-nutri-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {consulta.status === 'realizada'
                          ? 'Realizada'
                          : consulta.status === 'agendada'
                          ? 'Agendada'
                          : consulta.status === 'confirmada'
                          ? 'Confirmada'
                          : consulta.status === 'cancelada'
                          ? 'Cancelada'
                          : 'Não compareceu'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {consulta.tipo === 'primeira'
                        ? 'Primeira consulta'
                        : consulta.tipo === 'retorno'
                        ? 'Retorno'
                        : 'Avaliação'}
                      {consulta.valor
                        ? ` — R$ ${consulta.valor.toFixed(2)}`
                        : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Nenhuma consulta registrada
              </p>
            )}

            <div className="mt-4">
              <Link
                href={`/dashboard/consultas/nova?paciente_id=${id}`}
                className="text-sm text-nutri-600 hover:text-nutri-700 font-medium"
              >
                + Agendar consulta
              </Link>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              ⚡ Ações Rápidas
            </h2>
            <div className="space-y-2">
              <Link
                href={`/dashboard/pacientes/${id}/medidas/nova`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-700"
              >
                📏 Registrar Medidas
              </Link>
              <Link
                href={`/dashboard/planos/novo?paciente_id=${id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-700"
              >
                🍽️ Criar Plano Alimentar
              </Link>
              <Link
                href={`/dashboard/prontuario/${id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-700"
              >
                📁 Ver Prontuário Completo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
