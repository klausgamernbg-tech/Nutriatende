// ============================================================
// Nutri Atende — Consultas List Page
// ============================================================

import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function ConsultasPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createAdminClient();

  const page = Number(searchParams.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;

  let query = supabase
    .from('consulta')
    .select(
      `
      *,
      paciente:paciente_id (id, nome, telefone)
    `,
      { count: 'exact' }
    )
    .order('data_hora', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: consultas, count } = await query;
  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultas</h1>
          <p className="text-gray-500">
            {count ?? 0} consulta{(count ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/consultas/nova"
          className="inline-flex items-center px-4 py-2.5 bg-nutri-600 text-white font-medium rounded-lg hover:bg-nutri-700 transition"
        >
          + Nova Consulta
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form className="flex flex-col sm:flex-row gap-3">
          <select
            name="status"
            defaultValue={status || ''}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
          >
            <option value="">Todos os status</option>
            <option value="agendada">Agendadas</option>
            <option value="confirmada">Confirmadas</option>
            <option value="realizada">Realizadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Consultas table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {consultas && consultas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data / Hora
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Tipo
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {consultas.map((consulta: any) => (
                  <tr key={consulta.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {new Date(consulta.data_hora).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(consulta.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/pacientes/${consulta.paciente?.id}`}
                        className="font-medium text-gray-900 hover:text-nutri-600"
                      >
                        {consulta.paciente?.nome ?? '—'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-700">
                        {consulta.tipo === 'primeira'
                          ? 'Primeira consulta'
                          : consulta.tipo === 'retorno'
                          ? 'Retorno'
                          : 'Avaliação'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                          : 'Cancelada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-700">
                        {consulta.valor ? `R$ ${consulta.valor.toFixed(2)}` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">Nenhuma consulta encontrada</p>
            <Link
              href="/dashboard/consultas/nova"
              className="inline-flex items-center px-4 py-2 bg-nutri-600 text-white rounded-lg hover:bg-nutri-700 transition"
            >
              + Agendar primeira consulta
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/dashboard/consultas?page=${page - 1}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ← Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/dashboard/consultas?page=${page + 1}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Próxima →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
