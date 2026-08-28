// ============================================================
// Nutri Atende — Pacientes List Page
// ============================================================

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();

  const page = Number(searchParams.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;

  let query = supabase
    .from('paciente')
    .select(
      `
      *,
      nutricionista:nutricionista_responsavel_id (nome)
    `,
      { count: 'exact' }
    )
    .order('nome', { ascending: true })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data: pacientes, count } = await query;

  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500">
            {count ?? 0} paciente{(count ?? 0) !== 1 ? 's' : ''} cadastrado
            {(count ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/pacientes/novo"
          className="inline-flex items-center px-4 py-2.5 bg-nutri-600 text-white font-medium rounded-lg hover:bg-nutri-700 transition"
        >
          + Novo Paciente
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Buscar por nome ou email..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            name="status"
            defaultValue={status || ''}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="manutencao">Manutenção</option>
            <option value="inativo">Inativos</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Patients table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {pacientes && pacientes.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Contato
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Idade
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pacientes.map((paciente: any) => {
                    const idade = paciente.data_nascimento
                      ? Math.floor(
                          (Date.now() -
                            new Date(paciente.data_nascimento).getTime()) /
                            (365.25 * 24 * 60 * 60 * 1000)
                        )
                      : null;

                    return (
                      <tr
                        key={paciente.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-nutri-100 rounded-full flex items-center justify-center text-nutri-700 font-medium text-sm flex-shrink-0">
                              {paciente.nome
                                .split(' ')
                                .map((n: string) => n[0])
                                .slice(0, 2)
                                .join('')}
                            </div>
                            <div>
                              <Link
                                href={`/dashboard/pacientes/${paciente.id}`}
                                className="font-medium text-gray-900 hover:text-nutri-600"
                              >
                                {paciente.nome}
                              </Link>
                              <p className="text-sm text-gray-500 sm:hidden">
                                {paciente.telefone || paciente.email || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <p className="text-sm text-gray-900">
                            {paciente.telefone || '—'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {paciente.email || '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-sm text-gray-700">
                            {idade !== null ? `${idade} anos` : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {paciente.tags?.slice(0, 2).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-nutri-50 text-nutri-700 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {(paciente.tags?.length ?? 0) > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                                +{(paciente.tags?.length ?? 0) - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/pacientes/${paciente.id}`}
                            className="text-sm text-nutri-600 hover:text-nutri-700 font-medium"
                          >
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={`/dashboard/pacientes?page=${page - 1}${
                        search ? `&search=${search}` : ''
                      }${status ? `&status=${status}` : ''}`}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      ← Anterior
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={`/dashboard/pacientes?page=${page + 1}${
                        search ? `&search=${search}` : ''
                      }${status ? `&status=${status}` : ''}`}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Próxima →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">
              {search
                ? 'Nenhum paciente encontrado para a busca'
                : 'Nenhum paciente cadastrado ainda'}
            </p>
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
  );
}
