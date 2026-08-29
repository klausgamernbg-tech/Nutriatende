// ============================================================
// Nutri Atende — Patient Record (Prontuário) Detail Page
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ProntuarioDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const { id } = params;

  // Fetch patient
  const { data: paciente, error } = await supabase
    .from('paciente')
    .select('*, nutricionista:nutricionista_responsavel_id (nome, email)')
    .eq('id', id)
    .single();

  if (error || !paciente) {
    notFound();
  }

  // Fetch all measures
  const { data: medidas } = await supabase
    .from('medidas')
    .select('*')
    .eq('paciente_id', id)
    .order('data_avaliacao', { ascending: false });

  // Fetch all consultations
  const { data: consultas } = await supabase
    .from('consulta')
    .select('*')
    .eq('paciente_id', id)
    .order('data_hora', { ascending: false });

  // Fetch anamneses
  const { data: anamneses } = await supabase
    .from('anamnese')
    .select('*, consulta:consulta_id (data_hora)')
    .eq('paciente_id', id)
    .order('created_at', { ascending: false });

  // Fetch plans
  const { data: planos } = await supabase
    .from('plano_alimentar')
    .select('*')
    .eq('paciente_id', id)
    .order('created_at', { ascending: false });

  const idade = paciente.data_nascimento
    ? Math.floor(
        (Date.now() - new Date(paciente.data_nascimento).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/prontuario"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Voltar para prontuários
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
            <h1 className="text-2xl font-bold text-gray-900">{paciente.nome}</h1>
            <p className="text-gray-500">
              {idade !== null ? `${idade} anos` : '—'} •{' '}
              {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Feminino' : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Measures history */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📏 Histórico de Medidas</h2>
          {medidas && medidas.length > 0 ? (
            <div className="space-y-3">
              {medidas.map((medida: any) => (
                <div key={medida.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(medida.data_avaliacao).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {medida.metodo || 'Manual'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{medida.peso || '—'}</p>
                      <p className="text-xs text-gray-500">kg</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{medida.imc || '—'}</p>
                      <p className="text-xs text-gray-500">IMC</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {medida.altura ? `${(medida.altura * 100).toFixed(0)}` : '—'}
                      </p>
                      <p className="text-xs text-gray-500">cm</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {medida.circunferencia_cintura || '—'}
                      </p>
                      <p className="text-xs text-gray-500">cintura</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              Nenhuma medida registrada
            </p>
          )}
        </div>

        {/* Consultations history */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📅 Histórico de Consultas</h2>
          {consultas && consultas.length > 0 ? (
            <div className="space-y-3">
              {consultas.map((consulta: any) => (
                <div key={consulta.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(consulta.data_hora).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(consulta.data_hora).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {consulta.tipo === 'primeira'
                          ? 'Primeira consulta'
                          : consulta.tipo === 'retorno'
                          ? 'Retorno'
                          : 'Avaliação'}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        consulta.status === 'realizada'
                          ? 'bg-green-100 text-green-700'
                          : consulta.status === 'agendada'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {consulta.status === 'realizada'
                        ? 'Realizada'
                        : consulta.status === 'agendada'
                        ? 'Agendada'
                        : consulta.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              Nenhuma consulta registrada
            </p>
          )}
        </div>

        {/* Nutritional plans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">🍽️ Planos Alimentares</h2>
          {planos && planos.length > 0 ? (
            <div className="space-y-3">
              {planos.map((plano: any) => (
                <div key={plano.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {plano.titulo || 'Plano sem título'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {plano.calorias_meta ? `${plano.calorias_meta} kcal/dia` : '—'} • Início:{' '}
                        {new Date(plano.data_inicio).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plano.status === 'ativo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {plano.status === 'ativo' ? 'Ativo' : plano.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              Nenhum plano alimentar criado
            </p>
          )}
        </div>

        {/* Anamneses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📋 Anamneses</h2>
          {anamneses && anamneses.length > 0 ? (
            <div className="space-y-3">
              {anamneses.map((anamnese: any) => (
                <div key={anamnese.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {anamnese.consult?.data_hora
                      ? new Date(anamnese.consult.data_hora).toLocaleDateString('pt-BR')
                      : 'Data não informada'}
                  </p>
                  {anamnese.queixa_principal && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Queixa:</strong> {anamnese.queixa_principal}
                    </p>
                  )}
                  {anamnese.alimentacao_atual && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Alimentação:</strong> {anamnese.alimentacao_atual}
                    </p>
                  )}
                  {anamnese.restricoes && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Restrições:</strong> {anamnese.restricoes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              Nenhuma anamnese registrada
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
