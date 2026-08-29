// ============================================================
// Nutri Atende — Configurações Page (client component)
// Fetches profile via API route — handles missing profile
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import ChangePassword from './change-password';

export default function ConfiguracoesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const [setupForm, setSetupForm] = useState({
    clinica_nome: '',
    clinica_cnpj: '',
    clinica_endereco: '',
    clinica_telefone: '',
    nutricionista_nome: '',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch via API
        const res = await fetch('/api/setup/check');

        if (res.ok) {
          const data = await res.json();
          if (data.usuario_sistema) {
            setProfile(data.usuario_sistema);
          } else if (data.needsSetup) {
            setNeedsSetup(true);
            // Pre-fill with user email
            setSetupForm(prev => ({
              ...prev,
              nutricionista_nome: user.email?.split('@')[0] || '',
            }));
          }
        }
      } catch (err: any) {
        console.error('[Configuracoes] Error:', err);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupLoading(true);
    setSetupError('');

    try {
      const res = await fetch('/api/setup/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setSetupError(data.error || 'Erro ao criar perfil');
        return;
      }

      // Reload profile
      window.location.reload();
    } catch (err) {
      setSetupError('Erro de conexão');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie seu perfil e configurações da clínica</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Setup form for users without profile */}
      {needsSetup && (
        <div className="bg-white rounded-xl shadow-sm border border-nutri-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">⚙️ Configurar seu perfil</h2>
          <p className="text-sm text-gray-500 mb-4">
            Sua conta foi criada mas ainda não possui perfil de nutricionista configurado.
            Preencha os dados abaixo para começar.
          </p>

          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seu nome completo *
              </label>
              <input
                type="text"
                required
                value={setupForm.nutricionista_nome}
                onChange={(e) => setSetupForm(prev => ({ ...prev, nutricionista_nome: e.target.value }))}
                placeholder="Ex: Dra. Maria Silva"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Clínica *
              </label>
              <input
                type="text"
                required
                value={setupForm.clinica_nome}
                onChange={(e) => setSetupForm(prev => ({ ...prev, clinica_nome: e.target.value }))}
                placeholder="Ex: Clínica NutriVida"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={setupForm.clinica_cnpj}
                  onChange={(e) => setSetupForm(prev => ({ ...prev, clinica_cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="tel"
                  value={setupForm.clinica_telefone}
                  onChange={(e) => setSetupForm(prev => ({ ...prev, clinica_telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={setupForm.clinica_endereco}
                onChange={(e) => setSetupForm(prev => ({ ...prev, clinica_endereco: e.target.value }))}
                placeholder="Rua, número, bairro, cidade - UF"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nutri-500 focus:border-transparent outline-none"
              />
            </div>

            {setupError && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{setupError}</div>
            )}

            <button
              type="submit"
              disabled={setupLoading}
              className="w-full bg-nutri-600 text-white py-3 rounded-lg font-medium hover:bg-nutri-700 transition disabled:opacity-50"
            >
              {setupLoading ? 'Configurando...' : 'Salvar e configurar 🚀'}
            </button>
          </form>
        </div>
      )}

      {/* Profile */}
      {!needsSetup && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">👤 Seu Perfil</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-nutri-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Carregando perfil...</span>
            </div>
          ) : profile ? (
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
                    {profile.perfil === 'nutricionista' ? 'Nutricionista' : profile.perfil || '—'}
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
            <p className="text-gray-400 text-sm">Perfil não encontrado</p>
          )}
        </div>
      )}

      {/* Password Change */}
      {!needsSetup && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">🔑 Alterar Senha</h2>
          <ChangePassword />
        </div>
      )}

      {/* Clinic */}
      {!needsSetup && profile?.clinica && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">🏥 Dados da Clínica</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Nome</label>
              <p className="font-medium text-gray-900">{(profile.clinica as any)?.nome || '—'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">CNPJ</label>
              <p className="font-medium text-gray-900">{(profile.clinica as any)?.cnpj || '—'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Endereço</label>
              <p className="font-medium text-gray-900">{(profile.clinica as any)?.endereco || '—'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Telefone</label>
              <p className="font-medium text-gray-900">{(profile.clinica as any)?.telefone || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* LGPD */}
      {!needsSetup && (
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
      )}

      {/* Logout */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
        <h2 className="font-semibold text-red-700 mb-4">⚠️ Sair da conta</h2>
        <p className="text-sm text-gray-600 mb-4">
          Ao sair, você será redirecionado para a tela de login.
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
        >
          🚪 Sair da conta
        </button>
      </div>
    </div>
  );
}
