// ============================================================
// Nutri Atende — Configurações Page
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin';
import LogoutButton from './logout-button';

export default async function ConfiguracoesPage() {
  const supabase = createAdminClient();

  let userId = '';
  try {
    const { headers } = await import('next/headers');
    const headersList = headers();
    userId = typeof (headersList as any).get === 'function'
      ? (headersList as any).get('x-user-id') || ''
      : '';
  } catch {
    // fallback
  }

  const { data: profile } = await supabase
    .from('usuario_sistema')
    .select('*, clinica:clinica_id (id, nome, cnpj, endereco, telefone)')
    .eq('id', userId)
    .single();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie seu perfil e configurações da clínica</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">👤 Seu Perfil</h2>
        {profile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Nome</label>
                <p className="font-medium text-gray-900">{profile.nome || '—'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium text-gray-900">{profile.email || '—'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Perfil</label>
                <p className="font-medium text-gray-900 capitalize">
                  {profile.perfil === 'nutricionista'
                    ? 'Nutricionista'
                    : profile.perfil || '—'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Clínica</label>
                <p className="font-medium text-gray-900">
                  {(profile.clinica as any)?.nome || '—'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Carregando...</p>
        )}
      </div>

      {/* Clinic */}
      {profile?.clinica && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">🏥 Dados da Clínica</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Nome</label>
              <p className="font-medium text-gray-900">
                {(profile.clinica as any)?.nome || '—'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">CNPJ</label>
              <p className="font-medium text-gray-900">
                {(profile.clinica as any)?.cnpj || '—'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Endereço</label>
              <p className="font-medium text-gray-900">
                {(profile.clinica as any)?.endereco || '—'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Telefone</label>
              <p className="font-medium text-gray-900">
                {(profile.clinica as any)?.telefone || '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LGPD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">🔒 Privacidade (LGPD)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Todos os dados dos pacientes são protegidos conforme a Lei Geral de Proteção de Dados.
          Você pode exportar ou solicitar a exclusão de dados a qualquer momento.
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            📥 Exportar meus dados
          </button>
          <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium">
            🗑️ Solicitar exclusão
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
        <h2 className="font-semibold text-red-700 mb-4">⚠️ Sair da conta</h2>
        <p className="text-sm text-gray-600 mb-4">
          Ao sair, você será redirecionado para a tela de login.
        </p>
        <LogoutButton />
      </div>
    </div>
  );
}
