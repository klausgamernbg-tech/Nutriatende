// ============================================================
// Nutri Atende — Planos Alimentares List Page
// ============================================================

import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function PlanosPage() {
  const supabase = createAdminClient();

  const { data: planos, count } = await supabase
    .from('plano_alimentar')
    .select(
      `
      *,
      paciente:paciente_id (id, nome)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planos Alimentares</h1>
          <p className="text-gray-500">
            {count ?? 0} plano{(count ?? 0) !== 1 ? 's' : ''} cadastrado{(count ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/planos/novo"
          className="inline-flex items-center px-4 py-2.5 bg-nutri-600 text-white font-medium rounded-lg hover:bg-nutri-700 transition"
        >
          + Novo Plano
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {planos && planos.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {planos.map((plano: any) => (
              <div key={plano.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {plano.titulo || 'Plano sem título'}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          plano.status === 'ativo'
                            ? 'bg-green-100 text-green-700'
                            : plano.status === 'rascunho'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {plano.status === 'ativo'
                          ? 'Ativo'
                          : plano.status === 'rascunho'
                          ? 'Rascunho'
                          : plano.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>Paciente: {plano.paciente?.nome ?? '—'}</span>
                      <span>Meta: {plano.calorias_meta || '—'} kcal/dia</span>
                      <span>
                        Início: {new Date(plano.data_inicio).toLocaleDateString('pt-BR')}
                      </span>
                      {plano.data_fim && (
                        <span>
                          Fim: {new Date(plano.data_fim).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/planos/${plano.id}`}
                    className="text-sm text-nutri-600 hover:text-nutri-700 font-medium"
                  >
                    Ver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">Nenhum plano alimentar cadastrado</p>
            <Link
              href="/dashboard/planos/novo"
              className="inline-flex items-center px-4 py-2 bg-nutri-600 text-white rounded-lg hover:bg-nutri-700 transition"
            >
              + Criar primeiro plano
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
